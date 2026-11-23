# AGENTS.md

## Repo shape
- Single-package ESM Express 5 + TypeScript API using a feature-module (modular monolith) layout. `src/server.ts` is the entry point, `src/app.ts` wires middleware and mounts routers, config is in `src/config`, and the shared `pg` pool is in `src/db`.
- Each domain lives in `src/modules/<domain>/` as `<domain>.route.ts` (URL → handler), `<domain>.controller.ts` (HTTP + envelopes), `<domain>.service.ts` (business logic), `<domain>.repository.ts` (SQL), and `<domain>.interface.ts` (payload types). The `user`, `profile`, and `auth` modules exist.
- Repositories are the only layer that imports the shared `pool`; services call repositories. No tests, lint, formatter, build script, CI, or Docker.
- Cross-module code lives only in `src/config` and `src/db`; modules do not import each other. There are no path aliases or barrel files.

## Agent tooling
- Only `AGENTS.md` is committed. The rest of the agent setup is machine-local and gitignored: `.agents/skills/` (seven vendored Neon skills), `skills-lock.json`, and `opencode.jsonc` (Neon MCP server at `https://mcp.neon.tech/mcp`). Never stage them, even with `git add -f`.
- The skills are third-party Neon reference docs, not this codebase: do not edit them by hand, do not import from them, and do not copy their example snippets as repo conventions.
- Reinstall or refresh with `neon skills -y` from the repo root; check with `neon skills status`, update with `neon skills update -y`. Keep this setup project-local (do not use `--global`). The project-scope status check can print `outdated` even when the content matches upstream; `neon skills -y` reinstall is authoritative. A GitHub rate-limit warning from the update check is non-fatal; set `GITHUB_TOKEN` to raise the limit.
- The app does not depend on any of this: `npm run dev` and `npx tsc --noEmit` are still the only commands that matter.

## Commands
- `npm run dev` — `tsx watch --env-file=.env ./src/server.ts`.
- `npx tsc --noEmit` — the only automated check (TypeScript 7.0.2). Without `--noEmit` it emits to `dist/`.
- `npm test` is a stub that exits 1; there is no test runner or single-test command.

## Environment
- `.env` is gitignored and holds real credentials; copy `.env.example` to create it.
- `src/config/index.ts` reads `PORT`, `API_VERSION`, `DATABASE_URL`, and `JWT_SECRET`; `DATABASE_URL_POOLED` exists in env files but is unused. `API_VERSION` is the path prefix without a leading slash (e.g. `api/v1`); `app.ts` adds the slash. Config is a default-exported object; only `JWT_SECRET` is validated, so a missing value throws at startup and the other values may be `undefined`.
- Env is loaded via dotenv from `process.cwd()/.env` at import time: run from the repo root and restart `npm run dev` after editing `.env`.
- A missing/unreachable DB is non-fatal: startup logs the failure and HTTP still serves.

## Architecture
- Request flow: `app.ts` → `<domain>.route.ts` → `<domain>.controller.ts` → `<domain>.service.ts` → `<domain>.repository.ts` → shared `pool`. Routes never contain SQL; controllers never query directly; services never contain SQL.
- Route files create an `express.Router()`, bind paths to controller methods, and export a named router (`userRoute`, `profileRoute`). `app.ts` mounts them with ``app.use(`/${config.apiVersion}/<domain>`, ...)``.
- Controllers are inline `async (req, res)` + `try/catch`; they read `req.body`/`req.params` directly (no validation), send the JSON envelope, and never call `next`. There is no centralized error middleware.
- Services are singleton objects (`userService`, `profileService`) that take plain arguments, apply business rules, and delegate persistence to their module's repository. Repositories are singleton objects (`userRepository`, `profileRepository`) that run parameterized SQL (`$1`, `$2`, ...) and return raw `pg` `QueryResult`s.
- `profileService` returns `null` when `user_id` does not exist; `profileController` maps that to a 404. It uses `profileRepository.userExists()` rather than importing the user module.
- To add a module: create the five files under `src/modules/<domain>/`, export the router, and mount it in `app.ts`. Keep relative, extensionless imports.

## Database
- `src/db/index.ts` creates the shared `Pool` and exports `initNeonDB()`.
- `initNeonDB()` is called without `await` in `server.ts`, so HTTP can accept requests before `CREATE TABLE IF NOT EXISTS users` and `profile` finish. Success logs `Database connected!`; failure logs `Database <error>`.
- There are no migrations: changing the schema means editing that SQL and applying it to existing databases by hand.
- `users` columns: `id, name, age, email` (unique), `password, is_active, created_at, updated_at`. Passwords are stored in plain text; no hashing.
- `profile` columns: `id, user_id` (unique FK to `users.id`, `ON DELETE CASCADE`), `bio, address, phone, gender, created_at, updated_at`.
- Repository queries: `INSERT ... RETURNING *`, `SELECT *`, `UPDATE` with `COALESCE` and `updated_at = NOW()`, `DELETE` without `RETURNING`. Controllers read `result.rows[0]` and `result.rowCount`.

## API conventions
- Routes: `GET /` (plain text `Home`, outside `/api/v1`), `POST|GET /api/v1/user`, `GET|PUT|DELETE /api/v1/user/:id`, and `POST /api/v1/profile`. Resource paths are singular (`/user`, `/profile`).
- Success shape: `{ success, message, data }`; errors: 500 `{ success, message, error }` forwarding `DatabaseError.message` and otherwise `"Internal Server Error!"`. `error` is the raw thrown value and JSON-serializes to `{}` for `Error` instances.
- Status quirks: create returns 201, update returns 201 (not 200), delete returns 200 with no `data`, and get-by-id returns 200 even when no row exists (its `data` key is then omitted from the JSON). Profile creation returns 201, or 404 `{ success: false, message: "User not exists!" }` when the user is missing.
- Create uses only `name, age, email, password` and ignores `is_active`; update changes only `name, age, password, is_active` (email is not updatable).
- Known double-response bug: `getUsers` sends 404 when the list is empty and then unconditionally sends 200; `deleteUserById` does the same when no row matches. Express logs "headers already sent" and keeps the 404. If touching either handler, add `return`s instead of copying the pattern.
- Keep SQL parameterized (`$1`, `$2`, ...) and confined to `<domain>.repository.ts`; nothing interpolates request data.

## TypeScript quirks
- `verbatimModuleSyntax` is on: type-only imports must use `import type` (e.g. `Request`, `Response`, `Router`).
- Imports are extensionless with `moduleResolution: "bundler"`; `tsx` handles them at runtime.
- `strict`, `exactOptionalPropertyTypes`, and `noUncheckedIndexedAccess` are enabled; `result.rows[0]` is possibly `undefined`.
- `IUser` requires `name`, `email`, and `password`, has `age?: number | null`, and types `is_active` as the literal `true`, so passing `false` is a type error even though the update service reads it.
- Controllers cast `req.params.id as string`; the cast is redundant with the current Express 5 types.
- `.vscode/settings.json` pins VS Code to the workspace TypeScript version.
