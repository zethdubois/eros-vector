# Eros Vector

SvelteKit survey engine for 4D relationship mapping. See [docs/dev/eros-vector-spec.md](docs/dev/eros-vector-spec.md). Domain authorship for the Backstage wiki lives in [docs/wiki/](docs/wiki/).

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

- `PUBLIC_BETA_MODE=true` — beta labels/flow; set `false` for public-release behavior
- `ACCESS_PASSWORD_BETA` — public app only (`/`, `/survey`, …)
- `ACCESS_PASSWORD_REVIEWER` — public app **plus** `/backstage` (peek tools)
- `ACCESS_PASSWORD_DEVELOPER` — public app **plus** `/backstage` (full tools, including reset)
- `ACCESS_COOKIE_SECRET` — long random string for signing the access/visitor cookies
- `IP_HASH_SECRET` — salt for hashing visitor IPs (raw IPs are never stored)
- `DATABASE_URL` — PostgreSQL connection string (private Railway URL on the deployed service)
- `DATABASE_PUBLIC_URL` — optional; public Railway proxy URL for local `pnpm dev` / db scripts

Uses `@sveltejs/adapter-node`, which writes a Node server to `build/`. On Railway, set `ORIGIN` to your public URL (e.g. `https://your-app.up.railway.app`) and the access env vars above. Also set `IP_HASH_SECRET` in the Railway service.

## Database (survey questions + anonymous analytics)

Scored survey questions live in PostgreSQL (`survey_axes`, `survey_questions`). Anonymous
visitor tracking uses `visitors`, `visitor_sessions`, and `survey_responses` (full survey
state as JSONB, synced after answers). Managed with Drizzle:

```sh
# Generate a migration after editing the Drizzle schema (does not touch a database)
pnpm db:generate

# Local database writes
pnpm db:migrate
pnpm db:seed

# Production database writes (explicit acknowledgement required)
pnpm db:migrate:prod
pnpm db:seed:prod
```

All commands use `DATABASE_URL`. Remote database writes are blocked by the non-`:prod`
commands; this prevents an accidental production migration or seed. The seed is idempotent,
but it updates live question wording and ordering, so review changes before running it.

### Railway production workflow

The deployed app uses Railway's private `DATABASE_URL` (`postgres.railway.internal`), which
resolves **only inside Railway's network** and avoids public egress fees. Because of this,
`railway run` does not work for migrations: it injects the service variables but executes on
your local machine, where the private host cannot be resolved. Run the database commands
inside Railway instead.

**Recommended — pre-deploy step (runs automatically on every deploy):** In the Railway app
service, open Settings, find the Deploy section, and set the pre-deploy command to:

```sh
pnpm db:migrate:prod && pnpm db:seed:prod
```

This runs after build and before the new version serves traffic, on the private network, so
migrations are always applied before dependent code goes live. The seed is idempotent.

**One-off — SSH into the deployed service** (after this branch is deployed):

```sh
railway ssh -- sh -lc 'pnpm db:migrate:prod && pnpm db:seed:prod'
```

`tsx` is a runtime dependency so these commands work inside the Railway image (where
devDependencies may be pruned). The application fails with a clear `503` if the question
catalog is unavailable or incomplete.

**Local access (optional):** from your laptop, `postgres.railway.internal` will not resolve.
Set `DATABASE_PUBLIC_URL` in `.env` to Railway's public Postgres proxy
(Postgres service → Connect → Public Network). The app and db scripts prefer
`DATABASE_PUBLIC_URL` when set. This incurs egress fees, so prefer the pre-deploy
step for routine migrations. If the DB is unreachable, the survey page falls back to
the in-repo question catalog so local UI work can continue (visitor sync still needs DB).

### Anonymous visitors

- Signed cookies `ev_visitor` / `ev_session` identify browsers without accounts.
- Client IP is hashed with `IP_HASH_SECRET` and discarded; coarse region comes from
  platform geo headers when available.
- Survey progress still uses `localStorage`; the server syncs via `POST /api/survey/sync`.
- Privacy and Terms drafts live at `/legal` (linked from the home page).
