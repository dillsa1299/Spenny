# Docker Compose

Hybrid layout: **PostgreSQL in Compose** for local dev; **API + client + Postgres** in CI. Apps stay on the host for day-to-day debugging (Visual Studio **Spenny (API + Client)**). **F5 in Visual Studio** runs `scripts/ensure-postgres.ps1` before build so Postgres starts automatically (Docker Desktop must be running).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows: WSL2 backend recommended)
- Repo-root [`.env`](../.env.example) (default **`POSTGRES_PORT=5433`** so it does not fight a local PostgreSQL on 5432)

## Local dev (database only)

From the **repository root**:

```bash
cp .env.example .env   # Windows: copy .env.example .env
docker compose -f compose/docker-compose.yml --env-file .env up -d
```

Stop:

```bash
docker compose -f compose/docker-compose.yml --env-file .env down
```

Run the API and client on the host as described in the [root README](../README.md). The API reads `POSTGRES_*` from `.env` and builds `ConnectionStrings__Default` for `localhost` and `POSTGRES_PORT`.

## CI full stack (same files, CI overlay)

GitHub Actions merges the base file with [`docker-compose.ci.yml`](docker-compose.ci.yml):

```bash
cp .env.example .env
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file .env up -d --build
```

- API: `http://localhost:5050/api/health`
- Client (nginx): `http://localhost:8080/`

Tear down:

```bash
docker compose -f compose/docker-compose.yml -f compose/docker-compose.ci.yml --env-file .env down -v
```

You can run the CI merge locally to reproduce the pipeline; it is **not** the default local debug workflow (no native F5 / Vite HMR).

## Self-hosted deploy (homeserver)

Production-style deploy uses [`docker-compose.deploy.yml`](docker-compose.deploy.yml): nginx serves the SPA and proxies `/api` to the API container; Postgres is not published to the host. Config template: [`.env.deploy.example`](../.env.deploy.example). Actions deploys use GitHub Environment secret **`SPENNY_DOTENV`** (see [docs/deploy/self-hosted.md](../docs/deploy/self-hosted.md)).

```bash
export SPENNY_ENV_FILE=/path/to/your.env
docker compose \
  -f compose/docker-compose.yml \
  -f compose/docker-compose.deploy.yml \
  --env-file "$SPENNY_ENV_FILE" \
  -p spenny-dev \
  up -d --build
```

GitHub Actions deploy workflows build on a **self-hosted runner** and stream logs to Actions.

## Connection string

Prefer repo-root `.env` (`POSTGRES_*` and optional `ConnectionStrings__Default`). Inside the **api** container (CI), Compose sets `ConnectionStrings__Default` to host `postgres` and port **5432** on the Docker network.

On the **host** (F5 / `dotnet run`), use `POSTGRES_HOST=localhost` and **`POSTGRES_PORT`** from `.env` (often `5433`).

## Explicit deferrals

- No container registry push from this repo yet (deploy builds images on the self-hosted runner).
- No Testcontainers in `dotnet test`; CI compose smoke applies migrations when the API container starts.

See [ADR 0002](../docs/adr/0002-dev-database-in-docker-compose.md).
