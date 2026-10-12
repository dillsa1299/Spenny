# Docker Compose

Hybrid layout: **PostgreSQL in Compose** for local dev; **API + client + Postgres** in CI. Apps stay on the host for day-to-day debugging (Visual Studio **Spenny (API + Client)**). **F5 in Visual Studio** runs `scripts/ensure-postgres.ps1` before build so Postgres starts automatically (Docker Desktop must be running).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows: WSL2 backend recommended)
- A free host port for Postgres (default **`POSTGRES_PORT=5433`** in `.env.example` so it does not fight a local PostgreSQL on 5432)

## Local dev (database only)

```bash
cp compose/.env.example compose/.env   # Windows: copy compose\.env.example compose\.env
docker compose -f compose/docker-compose.yml --env-file compose/.env up -d
```

Stop:

```bash
docker compose -f compose/docker-compose.yml --env-file compose/.env down
```

Run the API and client on the host as described in the [root README](../README.md). Point `ConnectionStrings:Default` at `localhost` and your `POSTGRES_PORT` (see below) so the API applies EF migrations on startup.

## CI full stack (same files, CI overlay)

GitHub Actions merges the base file with [`docker-compose.ci.yml`](docker-compose.ci.yml):

```bash
cp compose/.env.example compose/.env
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file compose/.env up -d --build
```

- API: `http://localhost:5050/api/health`
- Client (nginx): `http://localhost:8080/`

Tear down:

```bash
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file compose/.env down -v
```

You can run the CI merge locally to reproduce the pipeline; it is **not** the default local debug workflow (no native F5 / Vite HMR).

## Connection string

```bash
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5433;Database=spenny;Username=spenny;Password=YOUR_PASSWORD_FROM_ENV" --project src/Spenny.Api
```

Inside the **api** container (CI), use host `postgres` and port **5432** (Docker network), with credentials from `compose/.env`, e.g. `Host=postgres;Port=5432;...`.

On the **host** (F5 / `dotnet run`), use `Host=localhost` and **`Port` = `POSTGRES_PORT`** from `compose/.env` (often `5433`).

## Explicit deferrals

- No container registry push from this repo yet.
- No Testcontainers in `dotnet test`; CI compose smoke applies migrations when the API container starts.

See [ADR 0002](../docs/adr/0002-dev-database-in-docker-compose.md).
