---
title: "Du vieux laptop à Kubernetes : mon parcours self-hosting"
date: "2026-07-24"
tags: ["self-hosting", "kubernetes", "devops", "infrastructure"]
---

## Pourquoi j'ai commencé à faire du self hosting ?

J'ai commencé à avoir l'idée pendant ma deuxième année d'école d'ingénieur. J'aime bien comprendre comment ça marche, et je me suis posé la question comment ça marche jusqu'au bout. Je voulais vraiment comprendre toute la stack du kernel jusqu'à la production.

Je me suis bien amusé à faire tout ça et je fais un post pour retracer tout ce que j'ai fait. Du vieux laptop chez moi à un cluster Kubernetes multi-node en GitOps dans le cloud.

## Le laptop sur la table dans le salon

Mon premier "serveur", c'était un vieux laptop que j'avais eu quand j'étais au collège et qu'on avait gardé chez mes parents. J'avais envie de comprendre comment installer un serveur web de A à Z. C'est bien de coder un site web mais je me suis dit c'est encore mieux s'il marche vraiment.

À ce moment j'y connaissais pas grand chose encore, j'avais installé le code directement sur la machine. C'est un site Flask et la seule chose à laquelle j'avais fait attention c'était de faire tourner le site avec gunicorn à cause des **warnings** de Flask. Pas de conteneurs, pas de reverse proxy, je ne savais même pas que ça existait à ce moment-là. Le service tournait directement sur le port 80 en **root** évidemment. J'avais ouvert les ports sur la livebox et fait du port forwarding, trouvé un DNS gratuit. Et là, miracle, ça marche vraiment. C'était brut mais ça marchait et surtout c'était la première fois que j'arrivais à faire tourner quelque chose qui fonctionnait vraiment.

## Découverte des reverse proxy

Peu de temps après, je me suis posé la question : j'ai un serveur web sur ma machine mais je peux pas en avoir un deuxième. C'est un serveur web par IPv4, tu m'étonnes qu'il en manque. Une recherche Google plus tard, j'ai découvert Nginx. Si vous avez déjà configuré Nginx à la main vous connaissez la douleur, surtout au début quand tu y connais rien et que tu vas un peu au hasard. À l'époque sans IA c'est pas simple et il y avait beaucoup de connaissances à assimiler.

Bref, c'était incroyable, je pouvais faire tourner autant de sites que je voulais en faisant soit plusieurs DNS soit encore mieux avec des sous-domaines.

## Le départ au Canada et le VPS Contabo

Arrive le moment où je dois partir au Canada pour mon double diplôme. Pas question de laisser tourner un laptop chez mes parents à distance, et encore moins de le ramener dans ma valise. Pour du dev et des petits services, un VPS ça suffisait largement.

J'ai pris un VPS Contabo à 5€/mois. Entre temps j'avais pas mal progressé grâce à l'association de mon école. Ils avaient un setup Traefik + Docker Compose qui m'avait vraiment impressionné. Un `docker-compose.yml`, des labels sur les conteneurs, et Traefik qui gère le routing et les certificats TLS tout seul. Plus besoin de se battre avec Nginx et Certbot à la main.

J'ai reproduit ça sur mon VPS. Honnêtement c'est probablement le meilleur setup pour démarrer en self hosting : Traefik en reverse proxy, Docker Compose pour orchestrer, et ça marche.

Sur ce VPS j'avais :
- **Vaultwarden** — pour mes mots de passe
- **CouchDB** — pour Obsidian LiveSync, synchroniser mes notes Obsidian entre mes appareils
- **Quelques petits sites web** que j'avais faits dont un pour ma copine

## L'anecdote du DNS

En parallèle j'avais acheté mon nom de domaine sur Cloudflare et migré tout dessus. Sauf que quand je suis arrivé en stage en entreprise, j'ai découvert que la sécurité DNS ça rigole pas : par défaut un domaine de moins de 6 mois est bloqué par les proxys d'entreprise. Résultat, impossible d'accéder à mon Vaultwarden au bureau. J'ai dû passer sur Bitwarden en attendant que mon domaine gagne en ancienneté. Leçon apprise, le setup d'un nom de domaine c'est vraiment important.

## La CI/CD artisanale

Pour déployer mes projets perso j'avais bricolé un truc de CI/CD fait maison. Un GitHub Actions qui build l'image Docker, la push sur le registry GitHub, puis trigger un webhook custom hébergé sur le VPS. Ce webhook faisait un `docker compose pull && docker compose restart`. C'était du bricolage, clairement, mais ça marchait et ça m'avait bien appris comment les briques fonctionnaient ensemble.

## Tailscale : la révélation

C'est aussi à ce moment que j'ai découvert Tailscale. Un VPN mesh basé sur WireGuard, zéro configuration, qui connecte tous tes appareils entre eux. Plus besoin d'exposer des ports d'admin sur internet, plus de SSH sur IP publique, tout passe dans le tunnel. En termes de simplicité et de sécurité c'est trop bien. Une fois que j'ai testé, je pouvais plus revenir en arrière.

## Le déclic : OpenClaw et les limites de Docker Compose

Le vrai point de bascule c'est quand j'ai voulu héberger [OpenClaw](https://github.com/openclaw/openclaw) pour mon père. D'un coup les besoins changeaient : plus de services interconnectés, des mises à jour fréquentes à gérer proprement, une config qui commençait à devenir chaotique.

Avec Docker Compose tout devenait pénible. Les montages de volumes, la gestion des updates (pas d'update auto facile), la config éparpillée entre plusieurs fichiers, pas de vrai rollback. Ma CI/CD webhook commençait clairement à montrer ses limites.

En parallèle l'association de mon école était passée sur K3S, et je me suis dit que c'était l'occasion d'apprendre. J'avais hésité avec Docker Swarm, mais en voyant que c'était de moins en moins maintenu et les problèmes que la communauté remontait, je me suis dit : quitte à migrer vers quelque chose de plus compliqué, autant que ce soit K3S.

## Migration vers K3S

Toutes les IA te déconseillent de passer sur Kubernetes avec 8 Go de RAM. Et honnêtement elles ont pas tort. Ça m'a pris deux bonnes semaines pour tout migrer. Comprendre les concepts (Pods, Services, Ingress, PVC...), configurer ArgoCD, migrer les données, débuguer les problèmes de réseau et surtout faire le setup initial et le choix du setup initial. J'avais passé toute la première semaine à tout tester sur une VM, je voulais pas tout casser ou encore pire me lock out de mon VPS.

Mais une fois en place c'est un autre monde :
- **Tout est en configuration** — plus besoin de SSH sur la machine pour déployer
- **GitOps** — un push sur `main` = un déploiement
- **Mises à jour automatiques** — Renovate pour les charts, Image Updater pour les images
- **Rollback natif** — ArgoCD gère les retours en arrière
- **Auto-heal** — si un pod crash, il redémarre tout seul

## Où j'en suis aujourd'hui

Aujourd'hui j'ai un cluster K3S de 2 nœuds : un sur Contabo et un sur Hetzner. Hetzner c'est beaucoup plus performant, je pourrais faire un article complet sur le choix du deuxième VPS mais globalement merci r/VPS sur Reddit. Tout est géré en GitOps avec ArgoCD. J'héberge une quinzaine de services : Immich (mon Google Photos), Vaultwarden, des agents IA (Openclaw, Hermes-Agent, Nullclaw), un gateway LLM (Bifrost), mon site perso, et plein d'autres.

Tout le détail technique est dans [l'article dédié à mon infrastructure](/blog/vps-infra) : architecture réseau, secret management, backup, choix techniques, etc.

**Repo GitHub** : [github.com/BaptTF/vps-infra](https://github.com/BaptTF/vps-infra)

## Ce que j'ai appris

Le self hosting pour moi c'est avant tout un prétexte pour apprendre. Chaque service que tu déploies t'amène à comprendre un nouveau concept : les certificats TLS, le DNS, les bases de données, le stockage, l'auth, la CI/CD...

Quelques conseils si vous voulez vous lancer :

1. **Commencez petit** — un VPS à 5€ et un Docker Compose, c'est largement assez pour apprendre énormément
2. **Tailscale dès le départ** — ça sécurise tout et ça simplifie vraiment la vie
3. **Traefik + Docker Compose** — le meilleur rapport simplicité/puissance pour débuter
4. **Ne passez sur Kubernetes que si vous en avez vraiment envie** — c'est overkill pour 90% des usages, mais c'est un apprentissage de ouf
5. **Le plus important** : essayez, échouez, recommencez. C'est super fun et en plus on apprend.
