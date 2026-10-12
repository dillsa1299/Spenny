# Docker Compose

Hybrid layout: **PostgreSQL in Compose** for local dev; **API + client + Postgres** in CI. Apps stay on the host for day-to-day debugging (Visual Studio **Spenny (API + Client)**).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows: WSL2 backend recommended)
- Port **5432** free on the host (change the published port if another Postgres is installed)

## Local dev (database only)

```bash
cp compose/.env.example compose/.env   # Windows: copy compose\.env.example compose\.env
docker compose -f compose/docker-compose.yml --env-file compose/.env up -d
```

Stop:

```bash
docker compose -f compose/docker-compose.yml --env-file compose/.env down
```

Run the API and client on the host as described in the [root README](../README.md). When EF Core is added, point `ConnectionStrings:Default` at `localhost:5432` (see below).

## CI full stack (same files, CI overlay)

GitHub Actions merges the base file with [`docker-compose.ci.yml`](docker-compose.ci.yml):

```bash
cp compose/.env.example compose/.env
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file compose/.env up -d --build
```

- API: `http://localhost:5050/api/time`
- Client (nginx): `http://localhost:8080/`

Tear down:

```bash
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file compose/.env down -v
```

You can run the CI merge locally to reproduce the pipeline; it is **not** the default local debug workflow (no native F5 / Vite HMR).

## Connection string (when persistence is added)

```bash
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=spenny;Username=spenny;Password=YOUR_PASSWORD_FROM_ENV" --project src/Spenny.Api
```

Inside the **api** container (CI), use host `postgres` and the same credentials from `compose/.env`, e.g. `Host=postgres;Port=5432;...`.

## Explicit deferrals

- No Visual Studio **Docker Compose** startup project (keep `Spenny.slnLaunch` for F5).
- No container registry push from this repo yet.
- No Testcontainers / EF migrations in the compose setup alone.

See [ADR 0002](../docs/adr/0002-dev-database-in-docker-compose.md).
