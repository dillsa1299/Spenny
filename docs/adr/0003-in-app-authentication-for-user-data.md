# 0003: In-app authentication for user data

## Status

Accepted

## Context

[ADR 0001](./0001-defer-access-control-to-hosting-edge.md) deferred authentication while the API exposed only anonymous routes and stored no user data. Site v1 persists accounts, Spending, and profile data in PostgreSQL ([ADR 0002](./0002-dev-database-in-docker-compose.md)).

## Decision

- **ASP.NET Core Identity** backs local email/password accounts with cookie sessions for the SPA.
- **Local accounts** must confirm email before any **domain** API (Dashboard, Spending, etc.) is available. Unverified sign-in attempts fail on the sign-in screen without issuing a session.
- **Google OAuth** (separate issue) will use the same cookie session model; Google users are treated as verified at first sign-in.
- **Edge rate limiting** remains on `/api`; it does not replace per-user authorization on domain routes.
- Transactional email (verification, password reset) is configured via secrets (`Email` section / environment), not committed credentials.
- Successful sign-ins append **login audit** rows (user id + UTC timestamp) for admin aggregates.

## Consequences

- ADR 0001 still applies to intentionally anonymous routes (`GET /api/health`, OAuth callbacks). Domain routes require authentication and the `DomainAccess` policy (verified local or Google).
- The SPA must call the API with **credentials** (cookies) on the dev proxy origin.
- Production deployments must configure SMTP (or an equivalent provider) for local account email flows.

## Supersedes (partial)

ADR 0001’s “no in-app authentication” stance is **superseded for stored user and Spending data paths** once this decision is deployed. Anonymous public marketing routes remain edge-rate-limited only until additional hardening is chosen for production.
