# Scalable Backend Architecture & Clean Code

A REST API built with **Express 5**, **TypeScript**, and **PostgreSQL**, created as a hands-on project for writing backend code that stays maintainable as it grows. The codebase uses a **feature-based modular architecture**: each domain owns its routes, HTTP handlers, data access, and types.

## Tech Stack

- **Node.js + TypeScript** — strict mode, ESM, and type-only imports
- **Express 5** — HTTP routing and middleware
- **PostgreSQL** — accessed through `pg` with a connection pool and parameterized SQL
- **tsx** — TypeScript execution and hot reload in development
- **dotenv** — environment-based configuration

## Features

- Full CRUD REST API for users and profile creation
- Feature modules under `src/modules/<domain>/` with route → controller → service → repository layers
- `users` and `profile` tables created automatically on startup
- Connection pooling with parameterized queries (no SQL string interpolation)
- Centralized environment configuration
- Strict TypeScript with a fast typecheck via the native `tsc`
- Hot-reloading development server

## Architecture

Requests flow through one direction only:

```text
HTTP request
  → src/app.ts                     middleware + feature router mounting
  → modules/<domain>/<domain>.route.ts        URL → controller mapping
  → modules/<domain>/<domain>.controller.ts   HTTP status, envelopes, error handling
  → modules/<domain>/<domain>.service.ts      business logic
  → modules/<domain>/<domain>.repository.ts   SQL through the shared pool
  → src/db/index.ts                shared pg Pool + schema bootstrap
```

- **`src/server.ts`** — process entry point. Starts the database bootstrap and the HTTP listener.
- **`src/app.ts`** — builds the Express app, registers middleware, and mounts feature routers. It knows nothing about SQL.
- **`src/middleware/global-error-handler.ts`** — maps application, authentication, and database failures to safe HTTP responses and logs server-side diagnostics.
- **`src/utils/custom-response.ts`** — shared success response envelope used by controllers.
- **`src/config/index.ts`** — loads `.env` and exposes the typed config object.
- **`src/db/index.ts`** — creates the shared `pg` `Pool` and defines `initNeonDB()`, which creates the `users` and `profile` tables at startup.
- **`src/modules/user/`** — the user feature. Routes wire URLs to controllers, controllers own HTTP concerns, the service owns business logic, the repository owns queries, and the interface holds payload types.
- **`src/modules/profile/`** — the profile feature. Its service checks whether the user exists before asking the repository to insert the profile.

Services depend on their module's repository, and only repositories import the shared pool. Routes and controllers never contain SQL.

### Adding a module

1. Create `src/modules/<domain>/` with `<domain>.route.ts`, `<domain>.controller.ts`, `<domain>.service.ts`, `<domain>.repository.ts`, and `<domain>.interface.ts`.
2. Export the router from the route file and mount it in `src/app.ts` with ``app.use(`/${config.apiVersion}/<domain>`, ...)``.
3. Import the shared pool from `src/db` in the repository; keep SQL parameterized and out of services and controllers.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (Neon or any standard Postgres instance)

### Installation

```bash
git clone https://github.com/dev-himel-0o0/scalable-backend-architecture---clean-code.git
cd scalable-backend-architecture---clean-code
npm install
cp .env.example .env
```

Edit `.env` with your database connection string, then start the server:

```bash
npm run dev
```

The API is available at **http://localhost:3000**.

## Environment Variables

| Variable              | Required | Description                                                      |
| --------------------- | -------- | ---------------------------------------------------------------- |
| `PORT`                | Yes      | Port the HTTP server listens on                                  |
| `API_VERSION`         | Yes      | API path prefix without a leading slash, e.g. `api/v1`           |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string used by the app                     |
| `DATABASE_URL_POOLED` | No       | Reserved for a pooled connection string; not read by the app yet |
| `JWT_SECRET`          | Yes      | Secret used to sign access tokens                                 |
| `REFRESH_TOKEN_SECRET` | Yes      | Separate secret used to sign refresh tokens                       |

Generate each authentication secret with `openssl rand -hex 32`. Keep the two secrets different.

## API Endpoints

Base URL for all API resources: `http://localhost:3000/api/v1`

| Method   | Endpoint       | Description                                  |
| -------- | -------------- | -------------------------------------------- |
| `GET`    | `/` (root)     | Health check — returns the plain text `Home` |
| `POST`   | `/user`        | Create a user                                |
| `GET`    | `/user`        | List all users                               |
| `GET`    | `/user/:id`    | Get a user by ID                             |
| `PUT`    | `/user/:id`    | Update a user                                |
| `DELETE` | `/user/:id`    | Delete a user                                |
| `POST`   | `/profile`     | Create a profile for an existing user        |

> The health check lives at the root (`http://localhost:3000/`), outside `/api/v1`. Resource paths are singular (`/user`, `/profile`). `POST /profile` returns `404` with `{ "success": false, "message": "User not exists!" }` when `user_id` does not exist.

### Example

```bash
curl -X POST http://localhost:3000/api/v1/user \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "age": 28, "email": "jane@example.com", "password": "secret"}'
```

```json
{
  "success": true,
  "message": "User created successfully!",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "age": 28,
    "email": "jane@example.com",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Errors follow the same envelope:

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "error": {
    "code": "INTERNAL_SERVER_ERROR"
  }
}
```

Error responses include a stable public `error.code`; database messages, stack traces, and other internal diagnostics are written to server logs and are not returned to clients. Known PostgreSQL constraint errors map to safe client-facing statuses/messages; unexpected database or server failures return a generic 500 response. The database schema bootstrap completes before the HTTP server starts, and startup fails if the database is unavailable.

## Project Structure

```text
src/
├── server.ts                      # Entry point: DB bootstrap + HTTP listener
├── app.ts                         # Express app, middleware, feature router mounting
├── config/
│   └── index.ts                   # Loads .env and exposes typed config
├── db/
│   └── index.ts                   # Shared pg Pool + schema bootstrap
└── modules/
    ├── user/
    │   ├── user.route.ts          # URL → controller mapping
    │   ├── user.controller.ts     # HTTP handlers, status codes, response envelopes
    │   ├── user.service.ts        # Business logic
    │   ├── user.repository.ts     # SQL queries through the pool
    │   └── user.interface.ts      # IUser payload types
    └── profile/
        ├── profile.route.ts       # URL → controller mapping
        ├── profile.controller.ts  # HTTP handlers, status codes, response envelopes
        ├── profile.service.ts     # Business logic
        ├── profile.repository.ts  # SQL queries through the pool
        └── profile.interface.ts   # IProfile payload types
```

Each domain is self-contained. Cross-module code lives only in `config` and `db`; modules do not import each other.

## Scripts

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Start the server with hot reload                |
| `npx tsc --noEmit`    | Typecheck the project without emitting files    |
| `npm test`            | Placeholder — no test suite is configured yet   |

## Roadmap

- [x] Split the server into app wiring, routes, controllers, and services
- [x] Extract SQL from services into a repository layer
- [ ] Add request validation
- [x] Add centralized error handling
- [x] Fix handlers that send a 404 and then a second response
- [x] Hash passwords before storing them
- [ ] Add migrations instead of startup-created schema
- [ ] Add automated tests
- [ ] Add authentication and authorization
- [ ] Add pagination and filtering

> **Note:** This is a learning project, not production-ready software. Request validation, migrations, and automated tests are not yet configured.

## License

[MIT](./LICENSE) © 2026 Shahadat Himel
