---
title: "Mon infrastructure K3S : architecture et choix techniques"
date: "2026-07-13"
tags: ["k3s", "gitops", "argocd", "self-hosting", "infrastructure"]
project:
  slug: vps-infra
  link: "https://github.com/BaptTF/vps-infra"
  description: "Infrastructure K3S GitOps : ArgoCD, Traefik, Immich, Tailscale, et plus."
  featured: true
---

## Vue d'ensemble

Mon infrastructure tourne sur un cluster **K3S** composé de deux nœuds reliés par Tailscale :

| Nœud | Rôle | Fournisseur | vCPU | RAM | OS |
|------|------|-------------|------|-----|-----|
| `debian-16gb-hel1-2` | control-plane | Hetzner | 8 | ~15 Go | Debian 13 |
| `vmi2735515` | worker | Contabo | 3 | ~8 Go | Debian 12 |

L'ensemble est géré en **GitOps pur** : toute la configuration vit dans un repo GitHub, et un push sur `main` déclenche automatiquement le déploiement.

Pas de Terraform, pas d'Ansible, pas de scripts de provisioning. Juste des manifestes Kubernetes gérés par ArgoCD.

**Repo** : [github.com/BaptTF/vps-infra](https://github.com/BaptTF/vps-infra)

> **Note sur l'évolution** : historiquement le control-plane tournait sur le Contabo et un second nœud (`bapt-debian`, une VM chez un pote avec 8 Go) faisait office de worker. Quand cette VM est tombée, j'ai cherché un remplaçant et trouvé Hetzner. J'ai inversé les rôles : le Hetzner est devenu control-plane (plus de ressources pour etcd + workloads critiques) et le Contabo a glissé en worker.

## GitOps avec ArgoCD

J'utilise le pattern **App of Apps** : un `root-app.yaml` pointe vers un dossier `apps/` contenant les Application CRs de chaque service. Chaque app est configurée avec `autoSync`, `prune: true` et `selfHeal: true`. Si quelqu'un modifie quelque chose à la main sur le cluster, ArgoCD le remet en état.

### Mises à jour automatiques

**Renovate** surveille les versions des charts Helm et crée des PRs automatiquement. **ArgoCD Image Updater** fait pareil pour les images (surtout GHCR) et commit les nouveaux tags directement dans le repo.

Pour activer ou désactiver un service, je déplace juste son fichier entre `apps/` et `disable-apps/`. C'est tout.

## Réseau

### Ingress public : Traefik

Traefik sert d'ingress controller pour tout le trafic public. Il écoute sur les ports 80, 443, et 22 (pour le SSH Forgejo). Le routing se fait via des `IngressRoute` CRs vers `*.bapttf.com`.

Les certificats TLS sont gérés par **cert-manager** avec un challenge DNS-01 via l'API Cloudflare. Ça permet d'avoir des certificats wildcard sans exposer de port supplémentaire.

### Mesh VPN : Tailscale

Tailscale est au cœur de l'architecture. Les 2 nœuds K3S communiquent via le tunnel WireGuard de Tailscale, et Flannel encapsule son overlay VXLAN dans ce tunnel. Certains services comme Grafana, Bifrost ou LLDAP ne sont exposés que sur le Tailnet via l'ingress class `tailscale`. Et pour l'admin, kubectl et l'UI ArgoCD sont accessibles uniquement via Tailscale.

### Cloudflare

En frontal, Cloudflare fournit le WAF par défaut, la protection DDoS, et la gestion DNS. L'API Cloudflare est utilisée par cert-manager pour les challenges DNS-01.

## Authentification

La stack auth c'est **LLDAP** pour l'annuaire LDAP (avec une UI web pour gérer les utilisateurs et les groupes `family`, `nice`, `lldap_admin`) et **Authelia** pour le portail SSO. Authelia fournit du ForwardAuth via un middleware Traefik pour protéger les routes, et un provider OIDC pour les apps qui le supportent comme Immich ou les dashboards Hermes.

Les politiques d'accès sont basées sur les groupes LDAP : certains services sont accessibles à la famille, d'autres uniquement aux admins.

## Secret Management

J'utilise un modèle à deux niveaux :

1. **Sealed Secrets** (Bitnami). Utilisé **uniquement** pour bootstrapper le premier secret, les credentials d'accès à Infisical. Le certificat de scellement est versionné dans le repo.

2. **Infisical**. SaaS externe qui gère tous les autres secrets. L'opérateur Kubernetes synchronise automatiquement les secrets depuis Infisical vers des `Secret` Kubernetes, organisés par path (`/argocd`, `/cloudflare`, `/tailscale`, `/agents/bifrost`, etc.).

### Pourquoi Infisical ?

Quand je me suis renseigné, ça me paraissait plus simple que Vault (qui est massif pour un petit cluster) et plus intégré que SOPS (qui nécessite de gérer des clés et de chiffrer/déchiffrer à chaque modif). Avec Infisical, j'ai une UI web, de la rotation, des environnements, et un opérateur Kubernetes natif. Est-ce que c'était le meilleur choix ? Je sais pas. Mais ça marche bien.

## Bases de données

J'utilise **CloudNative-PG** (CNPG) comme opérateur PostgreSQL. Il gère un cluster principal avec 9 bases (ArgoCD, Authelia, Vaultwarden, Immich server, agents, TripKit, etc.) et un cluster dédié Immich avec l'extension `vectorchord` pour la recherche par similarité d'images.

CNPG gère automatiquement les backups via Barman : backup quotidien vers Cloudflare R2, rétention de 30 jours, WAL archiving compressé en gzip.

## Stockage

### Local

Le provisionneur par défaut de K3S (`local-path`) est utilisé pour la plupart des PVCs : bases de données, config, petits volumes.

### Hetzner Storage Box (SMB)

Pour Immich, les photos et vidéos sont stockées sur une **Storage Box Hetzner** montée via le driver CSI SMB. C'est un choix économique : 1To de stockage réseau pour quelques euros par mois, bien moins cher que d'augmenter le disque du VPS.

L'architecture de stockage Immich :
- **Local PVC** : thumbnails, profils, données générées
- **Storage Box** : uploads, librairie principale, vidéos encodées, photos famille

Un **FileBrowser** est aussi monté sur cette Storage Box pour permettre à la famille de gérer ses fichiers.

## Backup

Approche multi-couche :

| Quoi | Vers où | Fréquence | Rétention |
|------|---------|-----------|-----------|
| PostgreSQL (CNPG Barman) | Cloudflare R2 | Daily (04:00 UTC) | 30 jours |
| Volumes K3S (Restic) | Hetzner Storage Box (SFTP) | Manuel | - |
| Velero (en standby) | Cloudflare R2 | Daily (03:00 UTC) | 30 jours |
| Config/Manifestes | GitHub (Git) | Chaque push | Illimité |

## Services déployés

### Actifs

| Service | Description | Accès |
|---------|-------------|-------|
| **Immich** | Google Photos self-hosted, ML, reconnaissance faciale | Public (OIDC) |
| **Vaultwarden** | Gestionnaire de mots de passe (compatible Bitwarden) | Public |
| **Bifrost** | Gateway LLM (routes vers Bedrock, Gemini, Groq) | Tailscale |
| **Agents IA** | OpenCLAW, Nullclaw, Hermes-Leo/Lya, Steel browser | Mixte |
| **TripKit** | App de planification de voyages (frontend + backend) | Public |
| **BaptTF Front** | Mon site perso/portfolio/blog | Public |
| **HA-EYG** | Home Assistant (proxy via Tailscale ExternalName) | Tailscale |
| **LLDAP** | Annuaire LDAP + UI d'admin | Tailscale |
| **Authelia** | Portail SSO + OIDC provider | Public |

### Désactivés (en standby)

Monitoring (kube-prometheus-stack), Forgejo, OpenWebUI, MinIO, Obsidian LiveSync, Velero, et quelques autres.

## Rétrospective

### Bons choix

- **ArgoCD + GitOps**, ne plus jamais SSH sur un serveur pour déployer. C'est la liberté.
- **Tailscale** simplifie tout. Réseau inter-nœuds, accès admin, ingress privé, c'est le même outil pour tout.
- **CloudNative-PG** c'est PostgreSQL managé sur Kubernetes, avec backup automatique. J'ai plus peur de perdre mes bases.
- **Traefik** avec les IngressRoute CRs et cert-manager, ça juste marche.
- **Renovate + Image Updater** font que les mises à jour se passent quasi toutes seules.

### Évolution de l'infrastructure

Historiquement, le control-plane tournait sur le Contabo (8 Go) et un second nœud worker (`bapt-debian`, une VM chez un pote avec 8 Go) faisait office de worker. Quand cette VM s'est éteinte, j'ai dû manuellement scaler à zéro plusieurs workloads sur le Contabo pour éviter l'OOM. J'ai ensuite cherché un nouveau VPS pour remplacer le worker. C'est le Hetzner (15 Go). Au passage j'ai inversé les rôles : le Hetzner est devenu control-plane (il a la RAM pour supporter etcd + les workloads critiques) et le Contabo a glissé en worker. En août je vais passer le Contabo de 8 Go à 12 Go de RAM. Pas par choix, Contabo a augmenté ses prix et offre l'upgrade gratuitement en contrepartie.

### Choix discutables

- **Contabo en worker (8 Go)** ça suffit pour un worker léger, mais ça ne laisse aucune marge pour scaler. Si je veux ajouter des services stateful gourmands, ce nœud sera le premier à saturer.
- **Infisical** crée une dépendance à un SaaS externe pour les secrets. J'avais hésité avec HashiCorp Vault, mais c'était overkill pour ce que j'avais besoin. Un pote m'avait fait l'analogie : « Vault sur un VPS de 8 Go, c'est comme installer un coffre-fort suisse pour garder les clés d'une Twingo ». Infisical est plus léger, plus simple à mettre en place, et il fait exactement ce que j'ai besoin sans la complexité de Vault.
- **Pas de monitoring permanent**. kube-prometheus-stack est désactivé pour économiser la RAM. C'est un compromis temporaire.

### Ce que je changerais

- Garder le monitoring actif en permanence sur le Hetzner (control-plane, 15 Go), qui a la marge mémoire pour l'accueillir.
- Automatiser les backups Restic, actuellement manuels. Je regarde pour les envoyer dans un bucket S3, soit chez Hetzner soit sur Backblaze B2, je me décide pas encore.
