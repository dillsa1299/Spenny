# 0002: Dev database in Docker Compose; CI full stack

## Status

Accepted

## Context

Spenny will use PostgreSQL for bill data. Developers need a consistent database without installing Postgres on every machine. CI needs to verify that containerized API and client images run together with the database.

Running the entire stack in Compose for local debugging is possible but trades away fast API breakpoints (Visual Studio F5) and Vite HMR on Windows.

## Decision

- **Local dev (default):** only `postgres` runs in [`compose/docker-compose.yml`](../../compose/docker-compose.yml). The API and React client run on the host.
- **CI:** merge [`compose/docker-compose.ci.yml`](../../compose/docker-compose.ci.yml) to build and run `api`, `client` (nginx), and `postgres` for smoke tests in GitHub Actions.
- **Optional:** developers may run the CI compose merge locally to match the pipeline; this is not the documented default workflow.

API and client Dockerfiles exist for CI and future deploy; they do not replace host-based debugging.

## Consequences

- `compose/.env` holds database credentials and must not be committed.
- When EF Core is introduced, connection strings differ for host (`localhost`) vs in-container (`postgres` service name).
- Edge access control ([ADR 0001](0001-defer-access-control-to-hosting-edge.md)) still applies before public deploy with real data.
