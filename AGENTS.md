# AGENTS.md

## Repo shape
- Single-package ESM Express 5 + TypeScript API. Despite the repo name, there are no layers: all app code is in `src/server.ts`, config in `src/config/index.ts`. No tests, lint, formatter, build script, CI, or Docker.
- Uses raw `pg` (`Pool`) with inline SQL, no ORM.

## Commands
- `npm run dev` — `tsx watch --env-file=.env ./src/server.ts`.
- `npx tsc --noEmit` — the only automated check (TypeScript 7.0.2). Without `--noEmit` it emits to `dist/`.
- `npm test` is a stub that exits 1; there is no test runner or single-test command.

## Environment
- `.env` is gitignored and holds real credentials; copy `.env.example` to create it.
- Only `DATABASE_URL` is read (`src/config/index.ts`); `DATABASE_URL_POOLED` exists in env files but is unused.
- Env is loaded via dotenv from `process.cwd()/.env` at import time: run from the repo root and restart `npm run dev` after editing `.env`.
- A missing/unreachable DB is non-fatal: startup logs `Database Error: ...` and HTTP still serves.

## Database
- On import, `initNeonDB()` runs a fire-and-forget (not awaited) `CREATE TABLE IF NOT EXISTS users (...)`; HTTP can accept requests before it finishes.
- There are no migrations: changing the schema means editing that SQL and applying it to existing databases by hand.
- `users` columns: `id, name, age, email` (unique), `password, is_active, created_at, updated_at`. Passwords are stored in plain text; no hashing.

## API conventions
- Routes: `GET /`, `POST|GET /api/v1/users`, `GET|PUT|DELETE /api/v1/users/:id`.
- Handlers are inline `async` + `try/catch`. Success shape: `{ success, message, data }`; errors: 500 `{ success, message, error }` exposing `DatabaseError.message`.
- Keep SQL parameterized (`$1`, `$2`, ...); nothing interpolates request data.
- Known bug: `GET /api/v1/users` sends 404 when the table is empty and then falls through to a second 200, which raises "headers already sent" if that handler is touched.

## TypeScript quirks
- `verbatimModuleSyntax` is on: type-only imports must use `import type` (e.g. `Request`, `Response`).
- Imports are extensionless with `moduleResolution: "bundler"`; `tsx` handles them at runtime.
- `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` are enabled; `result.rows[0]` is possibly `undefined`.
- `.vscode/settings.json` pins VS Code to the workspace TypeScript version.
