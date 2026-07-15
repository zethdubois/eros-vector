# Eros Vector

SvelteKit survey engine for 4D relationship mapping. See [eros-vector-spec.md](eros-vector-spec.md).

## Setup

```sh
pnpm install
```

## Developing

```sh
pnpm dev

# open in browser
pnpm dev -- --open
```

## Building

```sh
pnpm build
pnpm preview
```

Production start (Railway / Railpack):

```sh
pnpm build
pnpm start
```

Uses `@sveltejs/adapter-node`, which writes a Node server to `build/`. On Railway, set `ORIGIN` to your public URL (e.g. `https://your-app.up.railway.app`).
