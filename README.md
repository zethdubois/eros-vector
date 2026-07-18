# Eros Vector

SvelteKit survey engine for 4D relationship mapping. See [eros-vector-spec.md](eros-vector-spec.md).

## Setup

```sh
pnpm install
```

## Developing

```sh
pnpm dev
```

Opens on **http://localhost:3000** (same port as production `pnpm start`).

```sh
# open in browser
pnpm dev -- --open
```

## Building

```sh
pnpm build
pnpm preview
```

Production start (Railway / Railpack) — also **port 3000** by default:

```sh
pnpm build
pnpm start
```

Survey progress persists in the browser via `localStorage` (`eros-vector-survey`). Use **Restart** to clear it.

## Access gate (invite-only)

The app is password-gated. Copy [`.env.example`](.env.example) to `.env` and set:

- `ACCESS_PASSWORD_VIEWER` — public app only (`/`, `/survey`, …)
- `ACCESS_PASSWORD_READONLY` — public app **plus** `/backstage` (peek tools)
- `ACCESS_PASSWORD_DEVELOPER` — public app **plus** `/backstage` (full tools, including reset)
- `ACCESS_COOKIE_SECRET` — long random string for signing the session cookie

Uses `@sveltejs/adapter-node`, which writes a Node server to `build/`. On Railway, set `ORIGIN` to your public URL (e.g. `https://your-app.up.railway.app`) and the access env vars above.
