# Spenny

Spenny — a simple, quirky bill tracker. This repository contains the **React** client (`src/Spenny.Client/`) and the **ASP.NET Core** API (`src/Spenny.Api/`).

There is no in-app authentication yet. Access control is deferred to the hosting edge at deployment — see [ADR 0001](docs/adr/0001-defer-access-control-to-hosting-edge.md). Do not deploy publicly with real data until that is in place.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) 10+
- [Node.js](https://nodejs.org/) 20+ (for the Vite client)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for PostgreSQL via Compose)

## Visual Studio (one-click run/debug)

1. Open **`Spenny.slnx`** in Visual Studio 2022 (17.11+ recommended for shared multi-project launch).
2. In the toolbar startup dropdown, choose **`Spenny (API + Client)`**.
3. Press **F5** — starts the Vite dev server and the API (debugger attaches to **Spenny.Api**). The client's `.vscode/launch.json` opens `http://localhost:5173` in Chrome or Edge, depending on the browser selected in the toolbar.

If the profile is missing, enable **Tools → Options → Preview Features → Enable Multi Launch Profiles**, then reopen the solution. The shared profile is in [`Spenny.slnLaunch`](Spenny.slnLaunch).

Requires the **Node.js development** / JavaScript project workload so `Spenny.Client.esproj` is recognized. The client includes `.vscode/launch.json` for that tooling (commit it; Visual Studio reads it even though the path says `.vscode`).

## Quick start

### API

```bash
dotnet run --project src/Spenny.Api
```

HTTP: `http://localhost:5050` — `GET /api/time` returns the server time. Requests are rate limited per IP (HTTP 429 when exceeded; see `RateLimit` in `appsettings.json`).

### Client

```bash
cd src/Spenny.Client
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:5173` (landing). Server time test: `http://localhost:5173/time`.

### Database (PostgreSQL)

For future persistence, start Postgres in Docker (apps still run on the host):

```bash
cp compose/.env.example compose/.env
docker compose -f compose/docker-compose.yml --env-file compose/.env up -d
```

See [compose/README.md](compose/README.md). CI builds the **full stack** (API + client + Postgres) via `docker-compose.ci.yml`; see [.github/workflows/ci.yml](.github/workflows/ci.yml).

### Tests and build

```bash
dotnet test
cd src/Spenny.Client && npm run build
```

## Stack (issue #1)

| Layer | Technology |
|-------|------------|
| UI | React, Vite, MUI, GSAP, Lenis, React Bits registry |
| API | ASP.NET Core |

## Documentation

- [ADR 0001: defer access control to the hosting edge](docs/adr/0001-defer-access-control-to-hosting-edge.md)
- [ADR 0002: dev database in Docker Compose](docs/adr/0002-dev-database-in-docker-compose.md)
- [Compose (dev DB + CI full stack)](compose/README.md)
- [GitHub issue #1 body](docs/github/issue-1-body.md)
- [Client README](src/Spenny.Client/README.md)
