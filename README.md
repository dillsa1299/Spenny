# Spenny

Spenny — a simple, quirky bill tracker. This repository contains the **React** client (`src/Spenny.Client/`) and the **ASP.NET Core** API (`src/Spenny.Api/`).

**Local accounts** (register, email verification, sign-in, password reset) use ASP.NET Core Identity with cookie sessions when PostgreSQL is configured — see [ADR 0003](docs/adr/0003-in-app-authentication-for-user-data.md). Domain APIs (Dashboard, Spending) require a verified session. [ADR 0001](docs/adr/0001-defer-access-control-to-hosting-edge.md) still applies to anonymous routes and edge rate limiting.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) 10+
- [Node.js](https://nodejs.org/) 20+ (for the Vite client)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for PostgreSQL via Compose)

## Configuration

All local settings live in one **repo-root** file:

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

| Consumer | How it reads `.env` |
|----------|---------------------|
| **API** | Loaded at startup (`EnvFileBootstrap`) into environment variables (`ConnectionStrings__Default`, `Auth__*`, `Authentication__Google__*`, `Email__*`, …) |
| **Vite client** | `envDir` points at the repo root (`VITE_*`, `SPENNY_API_HTTP_URL` for the dev proxy) |
| **Docker Compose** | `docker compose … --env-file .env` (Postgres credentials and port) |

Do not commit `.env`. Use `.env.local` for optional personal overrides (gitignored).

## Visual Studio (one-click run/debug)

1. Open **`Spenny.slnx`** or **`Spenny.sln`** from the repo root in Visual Studio 2022 (17.11+ recommended for shared multi-project launch). If the solution looks empty, you opened a broken copy — use the files from this repo (see `Spenny.slnx` lists three projects under `/src/` and `/tests/`).
2. In Solution Explorer, expand **`Spenny.Api`**: **`Auth`** (`Identity`, `Endpoints`, `Google`, …) and **`Domain`** (`Spending`, `Scheduling`, `Projection`).
3. In the toolbar startup dropdown, choose **`Spenny (API + Client)`**.
4. Press **F5** — ensures **PostgreSQL** is running in Docker (Compose), then starts the Vite dev server and the API (debugger attaches to **Spenny.Api**). The client's `.vscode/launch.json` opens `http://localhost:5173` in Chrome or Edge, depending on the browser selected in the toolbar.

Requires **Docker Desktop** running and a repo-root **`.env`** (F5 copies from `.env.example` when Postgres is started if `.env` is missing). Postgres host port defaults to **5433** (`POSTGRES_PORT`).

If the profile is missing, enable **Tools → Options → Preview Features → Enable Multi Launch Profiles**, then reopen the solution. The shared profile is in [`Spenny.slnLaunch`](Spenny.slnLaunch).

Requires the **Node.js development** / JavaScript project workload so `Spenny.Client.esproj` is recognized. The client includes `.vscode/launch.json` for that tooling (commit it; Visual Studio reads it even though the path says `.vscode`).

## Quick start

### API

```bash
dotnet run --project src/Spenny.Api
```

HTTP: `http://localhost:5050` — `GET /api/health` for liveness. With Postgres configured, auth routes live under `/api/auth/*` (see `Auth` and `Email` in `appsettings.json`; verification links are logged to the API console when SMTP is unset). With **Mailpit** and `Email__SmtpHost` set (see below), open **http://localhost:8025** to read verification and reset mail instead of scraping logs. Requests are rate limited per IP (HTTP 429 when exceeded; see `RateLimit` in `appsettings.json`).

### Client

```bash
cd src/Spenny.Client
npm install
npm run dev
```

Open `http://localhost:5173` (landing). With an empty `VITE_API_BASE_URL` in `.env`, the dev server proxies `/api` to `SPENNY_API_HTTP_URL` (default `http://127.0.0.1:5050`).

### Database (PostgreSQL)

Start Postgres in Docker (API and Vite still run on the host):

```bash
docker compose -f compose/docker-compose.yml --env-file .env up -d
```

**Google sign-in** (optional): set in `.env`:

```env
Authentication__Google__ClientId=your-client-id
Authentication__Google__ClientSecret=your-client-secret
```

Register an OAuth client in [Google Cloud Console](https://console.cloud.google.com/) with redirect URI `http://localhost:5173/api/auth/google/callback` (Vite dev proxy origin).

The API builds `ConnectionStrings__Default` from `POSTGRES_*` when that connection string is not set explicitly. On startup the API applies pending EF Core migrations when the connection string is configured. See [compose/README.md](compose/README.md). CI builds the **full stack** (API + client + Postgres) via `docker-compose.ci.yml`; see [.github/workflows/ci.yml](.github/workflows/ci.yml).

### Transactional email (local)

[Mailpit](https://github.com/axllent/mailpit) ships in the dev Compose file. Start it with Postgres (or alone):

```bash
docker compose -f compose/docker-compose.yml --env-file .env up -d
```

In `.env`, point the API at Mailpit (see commented block in `.env.example`):

```env
Email__SmtpHost=localhost
Email__SmtpPort=1025
Email__UseSsl=false
Email__FromAddress=noreply@localhost
```

Open **http://localhost:8025** after register, resend verification, or forgot-password.

**Defaults:** In **Development**, the API uses Mailpit via [`appsettings.Development.json`](src/Spenny.Api/appsettings.Development.json) and [`.env.example`](.env.example) (`localhost:1025`). To log links only (no Mailpit), remove or comment out `Email__SmtpHost` in `.env` and clear `Email:SmtpHost` in `appsettings.Development.json`.

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
