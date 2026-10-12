## Summary

Establish the Spenny application stack: a **React** frontend ( **MUI**, **GSAP**, **Lenis**, **React Bits** ) and a **.NET** backend, with a **server time test page** that proves the two talk to each other end to end.

## Goals

- React client in `src/Spenny.Client/` (Vite + TypeScript + MUI).
- ASP.NET Core Web API in `src/Spenny.Api/`.
- Motion stack: GSAP, Lenis smooth scroll, React Bits components via shadcn registry.
- One-click run/debug of API + client from Visual Studio.

## Frontend (React)

- **MUI** as the primary component library (`@mui/material` + Emotion).
- **GSAP** / **Lenis** wired via app providers.
- **React Bits** — install components from `@react-bits` registry ([reactbits.dev](https://reactbits.dev)).
- **React Router** — public `/` (landing) and `/time` (server time test).
- Env: `VITE_API_BASE_URL`.

## Backend (.NET)

- `GET /api/time` — ISO 8601 server time JSON; deliberately anonymous.
- Per-IP rate limit on `/api` (HTTP 429 when exceeded).
- CORS: trusted dev origin (`http://localhost:5173`) in Development.

## Access control

No in-app authentication for now. Protection against malicious access is deferred to the hosting edge at deployment (WAF/CDN rate limiting and bot protection, Cloudflare Access, basic auth, or Static Web Apps auth, depending on the host). Real user authentication must be added before any bill data is stored. See `docs/adr/0001-defer-access-control-to-hosting-edge.md`.

## Acceptance criteria

- [ ] .NET API runs locally; `GET /api/time` returns **200** and time JSON.
- [ ] Requests beyond the rate limit return **429**.
- [ ] Public landing loads; `/time` displays server time from the API.
- [ ] README documents env vars and how to run API + client (including Visual Studio).
- [ ] `dotnet test` and `src/Spenny.Client` production build succeed.

## Out of scope

- Authentication and access control (deferred to the hosting edge), bill-tracking domain, production hosting.
