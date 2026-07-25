# bapttf-web

Site perso SvelteKit (portfolio, blog, terminal), buildé en statique.

## Setup

```sh
bun install
bun run dev
```

## Scripts

```sh
bun run check   # svelte-check (CI)
bun run lint
bun run build
bun run preview
```

## Docker

```sh
docker compose build
docker compose up
```

Le Dockerfile utilise Bun (`oven/bun`) + `bun install --frozen-lockfile`, puis sert `build/` avec static-web-server.
