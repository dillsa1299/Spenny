# Spenny client

React + Vite + TypeScript SPA with **MUI**, **GSAP**, **Lenis**, and **React Bits**–style components (`BlurText`).

## Setup

1. Create repo-root `.env` from [`.env.example`](../../.env.example) (shared with the API and Docker).
2. `npm install`
3. `npm run dev` — `http://localhost:5173`

From Visual Studio, use the solution profile **`Spenny (API + Client)`** on [`Spenny.slnx`](../../Spenny.slnx) instead of running npm manually.

The `.vscode/launch.json` in this folder is **required by Visual Studio** for `.esproj` startup (it is not a VS Code–only dependency). Do not delete it when cloning the repo.

Vite loads environment variables from the **repository root** (`envDir` in `vite.config.ts`). Leave `VITE_API_BASE_URL` empty to use the `/api` dev proxy to `SPENNY_API_HTTP_URL`.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing (guests) |
| `/dashboard` | Signed-in home (after email verification) |
| `/sign-in`, `/sign-up` | Local and Google sign-in (Google when API credentials are configured) |

Auth uses cookie sessions against `/api/auth/*` when the API has PostgreSQL configured — see [ADR 0003](../../docs/adr/0003-in-app-authentication-for-user-data.md).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — oxlint

## React Bits

`components.json` registers the `@react-bits` shadcn registry. Add components with the shadcn CLI from the `src/Spenny.Client/` directory, e.g.:

```bash
npx shadcn@latest add @react-bits/blur-text
```
