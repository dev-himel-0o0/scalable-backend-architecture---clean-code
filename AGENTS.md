# AGENTS.md

## Repo shape
- Single-package ESM Express 5 + TypeScript API using a feature-module (modular monolith) layout. `src/server.ts` is the entry point, `src/app.ts` wires middleware and mounts routers, config is in `src/config`, and the shared `pg` pool is in `src/db`.
- Each domain lives in `src/modules/<domain>/` as `<domain>.route.ts` (URL → handler), `<domain>.controller.ts` (HTTP + envelopes), `<domain>.service.ts` (SQL), and `<domain>.interface.ts` (payload types). Only the `user` module exists.
- There is no repository layer: services run SQL directly against the pool. No tests, lint, formatter, build script, CI, or Docker.
- Cross-module code lives only in `src/config` and `src/db`; modules do not import each other. There are no path aliases or barrel files.

## Commands
- `npm run dev` — `tsx watch --env-file=.env ./src/server.ts`.
- `npx tsc --noEmit` — the only automated check (TypeScript 7.0.2). Without `--noEmit` it emits to `dist/`.
- `npm test` is a stub that exits 1; there is no test runner or single-test command.

## Environment
- `.env` is gitignored and holds real credentials; copy `.env.example` to create it.
- `src/config/index.ts` reads only `PORT` and `DATABASE_URL`; `DATABASE_URL_POOLED` exists in env files but is unused. Config is a default-exported object with no runtime validation, so values may be `undefined`.
- Env is loaded via dotenv from `process.cwd()/.env` at import time: run from the repo root and restart `npm run dev` after editing `.env`.
- A missing/unreachable DB is non-fatal: startup logs the failure and HTTP still serves.

## Architecture
- Request flow: `app.ts` → `<domain>.route.ts` → `<domain>.controller.ts` → `<domain>.service.ts` → shared `pool`. Routes never contain SQL; controllers never query directly.
- Route files create an `express.Router()`, bind paths to controller methods, and export a named router (`userRoute`). `app.ts` mounts it with `app.use("/api/v1/user", userRoute)`.
- Controllers are inline `async (req, res)` + `try/catch`; they read `req.body`/`req.params` directly (no validation), send the JSON envelope, and never call `next`. There is no centralized error middleware.
- Services are singleton objects (`userService`) that take plain arguments and return raw `pg` `QueryResult`s. Keep SQL parameterized (`$1`, `$2`, ...).
- To add a module: create the four files under `src/modules/<domain>/`, export the router, and mount it in `app.ts`. Keep relative, extensionless imports.

## Database
- `src/db/index.ts` creates the shared `Pool` and exports `initNeonDB()`.
- `initNeonDB()` is called without `await` in `server.ts`, so HTTP can accept requests before `CREATE TABLE IF NOT EXISTS users` finishes. Success logs `Database connected!`; failure logs `Database <error>`.
- There are no migrations: changing the schema means editing that SQL and applying it to existing databases by hand.
- `users` columns: `id, name, age, email` (unique), `password, is_active, created_at, updated_at`. Passwords are stored in plain text; no hashing.
- Queries: `INSERT ... RETURNING *`, `SELECT *`, `UPDATE` with `COALESCE` and `updated_at = NOW()`, `DELETE` without `RETURNING`. Controllers read `result.rows[0]` and `result.rowCount`.

## API conventions
- Routes: `GET /` (plain text `Home`, outside `/api/v1`), `POST|GET /api/v1/user`, `GET|PUT|DELETE /api/v1/user/:id`. The resource path is singular `/user`, not `/users`.
- Success shape: `{ success, message, data }`; errors: 500 `{ success, message, error }` forwarding `DatabaseError.message` and otherwise `"Internal Server Error!"`. `error` is the raw thrown value and JSON-serializes to `{}` for `Error` instances.
- Status quirks: create returns 201, update returns 201 (not 200), delete returns 200 with no `data`, and get-by-id returns 200 even when no row exists (its `data` key is then omitted from the JSON).
- Create uses only `name, age, email, password` and ignores `is_active`; update changes only `name, age, password, is_active` (email is not updatable).
- Known double-response bug: `getUsers` sends 404 when the list is empty and then unconditionally sends 200; `deleteUserById` does the same when no row matches. Express logs "headers already sent" and keeps the 404. If touching either handler, add `return`s instead of copying the pattern.
- Keep SQL parameterized (`$1`, `$2`, ...); nothing interpolates request data.

## TypeScript quirks
- `verbatimModuleSyntax` is on: type-only imports must use `import type` (e.g. `Request`, `Response`, `Router`).
- Imports are extensionless with `moduleResolution: "bundler"`; `tsx` handles them at runtime.
- `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` are enabled; `result.rows[0]` is possibly `undefined`.
- `IUser` requires `name`, `email`, and `password`, has `age?: number | null`, and types `is_active` as the literal `true`, so passing `false` is a type error even though the update service reads it.
- Controllers cast `req.params.id as string`; the cast is redundant with the current Express 5 types.
- `.vscode/settings.json` pins VS Code to the workspace TypeScript version.
