# Issue #1 — Application stack (archived body)

Establish the Spenny application stack: a **React** frontend (**MUI**, **GSAP**, **Lenis**, **React Bits**) and a **.NET** backend.

## Delivered (historical)

- **React Router** — public `/` (landing) and authenticated `/dashboard` (see later issues).
- **ASP.NET Core API** — `GET /api/health` (liveness), rate limiting, PostgreSQL + Identity (later issues).
- **Docker Compose** — PostgreSQL for local dev; CI full-stack smoke.

## Acceptance (at close)

- [x] .NET API runs locally; `GET /api/health` returns **200**.
- [x] Vite client builds and serves the landing page.
- [x] CI runs `dotnet test` and client build.

_Note: Early scaffold acceptance criteria were superseded by `/api/health` liveness checks and product auth flows._
