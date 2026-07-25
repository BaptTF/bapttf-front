# AGENTS.md — bapttf-web

Site perso (portfolio, blog, terminal) en **SvelteKit** exporté en statique.

## Stack

- **Runtime / package manager** : Bun (pas npm/pnpm pour le quotidien)
- **Framework** : Svelte 5 + SvelteKit 2 + TypeScript
- **UI** : Tailwind CSS 4, shadcn-svelte (`components.json`)
- **Contenu** : Markdown via mdsvex (`src/posts/*.md`)
- **Build** : `@sveltejs/adapter-static` → dossier `build/`
- **Prod** : Docker + `static-web-server`, image GHCR, deploy via CI

## Commandes (alignées sur la CI)

La CI (`.github/workflows/ci-cd.yml`) exécute dans cet ordre :

```sh
bun install
bun run check
bun run lint
bun run build
```

**Après toute modification de code, tu DOIS lancer au minimum :**

```sh
bun run check
```

Corrige les erreurs avant de considérer la tâche terminée. Si tu touches au lint ou au build (deps, config, routes, assets), lance aussi :

```sh
bun run lint
bun run build
```

Autres scripts utiles :

| Script | Rôle |
|--------|------|
| `bun run dev` | Serveur de dev |
| `bun run check` | `svelte-kit sync` + `svelte-check` (types / Svelte) |
| `bun run lint` | ESLint |
| `bun run build` | Build statique dans `build/` |
| `bun run preview` | Preview du build |

## Structure

```
src/
  routes/          # Pages SvelteKit (+page.svelte / +page.ts)
  lib/
    components/    # Composants UI
    api/           # Client openapi-fetch + types générés
    markdown/      # Plugins rehype (ex. wrap tables)
  posts/           # Articles Markdown (frontmatter + corps)
static/            # Assets statiques
docs/              # Specs (ex. terminal)
```

Le site est **entièrement pré-rendu** (`prerender = true` dans `+layout.ts`).

## Variables d'environnement

Build-time (préfixe `PUBLIC_`) :

| Variable | Usage | Défaut local |
|----------|--------|--------------|
| `PUBLIC_API_URL` | API backend (ex. `/root`) | `http://localhost:1323/api/v1` |
| `PUBLIC_WS_URL` | WebSocket terminal | `ws://localhost:1323/ws/terminal` |

En CI/deploy, elles sont injectées via Docker build-args / GitHub vars.

## Contenu blog

- Fichiers dans `src/posts/*.md`
- Frontmatter typique : `title`, `date`, `tags`, éventuellement `project` (slug, link, description, featured)
- Extensions gérées : `.svelte`, `.svx`, `.md`

## Conventions pour les agents

1. **Toujours `bun`**, pas `npm` / `npx` sauf nécessité absolue.
2. **Toujours `bun run check`** après des changements code (comme la CI).
3. Respecter Svelte 5 (runes) et les patterns existants du repo.
4. Ne pas élargir le scope : pas de refacto / docs non demandés.
5. Ne pas committer / push sans demande explicite.
6. Préserver le design et les conventions déjà en place (pas de redesign gratuit).
7. **Un sujet = un commit** : ne pas mélanger fix CI, docs agents, et contenu blog.

## Conventions de commit

Format [Conventional Commits](https://www.conventionalcommits.org/) en anglais, court, focus sur le *pourquoi* :

```
<type>(optional-scope): <description>
```

Types utilisés dans ce repo :

| Type | Quand |
|------|--------|
| `feat` | Nouvelle fonctionnalité / contenu significatif |
| `fix` | Correction de bug ou de build/CI |
| `chore` | Maintenance, nettoyage, placeholders |
| `docs` | Documentation / `AGENTS.md` / specs |

Scopes optionnels courants : `ci`, ou un domaine clair si utile.

Exemples (d’après l’historique) :

- `fix: allow markdown tables to scroll on mobile`
- `feat: add branded favicon and apple touch icon`
- `chore: remove placeholder`
- `fix(ci): use metadata-action for Docker tags`
- `docs: rewrite AGENTS.md with project and CI guidelines`

Règles pour les agents :

- **Séparer** les commits par intention (ex. fix check ≠ docs ≠ article).
- Message en **1 ligne**, impératif, sans point final.
- Ne **pas** amend / force-push sauf demande explicite.
- Ne **pas** committer secrets (`.env`, credentials, etc.).
- Après commit : vérifier avec `git status`.

## Svelte MCP

Utilise le serveur MCP Svelte pour la doc et la validation du code Svelte.

1. **`list-sections`** — à appeler en premier pour découvrir les sections de doc. Sur un sujet Svelte/SvelteKit, commence toujours par là.
2. **`get-documentation`** — récupère les sections pertinentes (analyse surtout `use_cases`).
3. **`svelte-autofixer`** — obligatoire après avoir écrit du code Svelte ; répéter jusqu’à plus d’issues.
4. **`playground-link`** — uniquement si l’utilisateur confirme, et jamais si le code a été écrit dans le projet.
)
