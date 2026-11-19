# Scalable Backend Architecture & Clean Code

A REST API built with **Express 5**, **TypeScript**, and **PostgreSQL**, created as a hands-on project for writing backend code that stays maintainable as it grows.

## Tech Stack

- **Node.js + TypeScript** — strict mode, ESM, and type-only imports
- **Express 5** — HTTP routing and middleware
- **PostgreSQL** — accessed through `pg` with a connection pool and parameterized SQL
- **tsx** — TypeScript execution and hot reload in development
- **dotenv** — environment-based configuration

## Features

- Full CRUD REST API for users
- `users` table created automatically on startup
- Connection pooling with parameterized queries (no SQL string interpolation)
- Centralized environment configuration
- Strict TypeScript with a fast typecheck via the native `tsc`
- Hot-reloading development server

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

| Variable              | Required | Description                                                        |
| --------------------- | -------- | ------------------------------------------------------------------ |
| `PORT`                | Yes      | Port the HTTP server listens on                                    |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string used by the app                       |
| `DATABASE_URL_POOLED` | No       | Reserved for a pooled connection string; not read by the app yet   |

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method   | Endpoint       | Description         |
| -------- | -------------- | ------------------- |
| `GET`    | `/`            | Health check        |
| `POST`   | `/users`       | Create a user       |
| `GET`    | `/users`       | List all users      |
| `GET`    | `/users/:id`   | Get a user by ID    |
| `PUT`    | `/users/:id`   | Update a user       |
| `DELETE` | `/users/:id`   | Delete a user       |

### Example

```bash
curl -X POST http://localhost:3000/api/v1/users \
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
    "password": "secret",
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
  "message": "Internal Server Error!",
  "error": {}
}
```

## Project Structure

```text
src/
├── config/
│   └── index.ts   # Loads .env and exposes typed config
└── server.ts      # Express app, database pool, routes, startup logic
```

The project currently keeps routes and SQL inline in `server.ts`. As it grows, the code is intended to be split into routes, controllers, services, and repositories.

## Scripts

| Command               | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Start the server with hot reload                |
| `npx tsc --noEmit`    | Typecheck the project without emitting files    |
| `npm test`            | Placeholder — no test suite is configured yet   |

## Roadmap

- [ ] Split `server.ts` into routes, controllers, services, and repositories
- [ ] Add request validation and centralized error handling
- [ ] Hash passwords before storing them
- [ ] Add migrations instead of startup-created schema
- [ ] Add automated tests
- [ ] Add authentication and authorization
- [ ] Add pagination and filtering

> **Note:** This is a learning project, not production-ready software. In particular, passwords are currently stored in plain text.

## License

[MIT](./LICENSE) © 2026 Shahadat Himel
