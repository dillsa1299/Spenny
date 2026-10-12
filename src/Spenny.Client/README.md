# Spenny client

React + Vite + TypeScript SPA with **MUI**, **GSAP**, **Lenis**, and **React Bits**–style components (`BlurText`).

## Setup

1. Optional: copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` if you are not using the dev proxy (default is same-origin `/api` → port 5050).
2. `npm install`
3. `npm run dev` — `http://localhost:5173`

From Visual Studio, use the solution profile **`Spenny (API + Client)`** on [`Spenny.slnx`](../../Spenny.slnx) instead of running npm manually.

The `.vscode/launch.json` in this folder is **required by Visual Studio** for `.esproj` startup (it is not a VS Code–only dependency). Do not delete it when cloning the repo.

Ensure the API is running at `VITE_API_BASE_URL` (default `http://localhost:5050`).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/time` | Calls `GET /api/time` and displays the server time |

There is no in-app login; access control is deferred to the hosting edge (see [ADR 0001](../../docs/adr/0001-defer-access-control-to-hosting-edge.md)).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — oxlint

## React Bits

`components.json` registers the `@react-bits` shadcn registry. Add components with the shadcn CLI from the `src/Spenny.Client/` directory, e.g.:

```bash
npx shadcn@latest add @react-bits/<ComponentName>
```

Components install under `src/components/` when aliases point at `@/components`.
