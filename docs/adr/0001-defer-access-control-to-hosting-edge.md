# 0001: Defer access control to the hosting edge

## Status

Accepted (partially superseded for user data by [ADR 0003](./0003-in-app-authentication-for-user-data.md))

## Context

Spenny needs protection against malicious or abusive access. At initial scaffold, the API exposed only a liveness probe while the SPA had no accounts. **In-app authentication and domain authorization** now apply to user and Spending data (ADR 0003). Edge protection remains relevant for anonymous routes and deployment hardening.

Microsoft Entra ID was evaluated and rejected for now because it adds a full login flow before there is anything to protect. A shared access token inside the SPA was also rejected: it gives little real protection and would be replaced once real users exist.

## Decision

- `GET /api/health` is deliberately anonymous (liveness for dev, CI, and operators).
- Auth routes under `/api/auth/*` and domain routes enforce per-user access (ADR 0003).
- The API applies a per-IP rate limit on `/api` to bound abuse.
- Access control and bot protection are applied at the hosting edge at deployment (WAF/CDN, Cloudflare Access, basic auth, or Static Web Apps auth, depending on the host chosen).

## Consequences

- Do not deploy publicly until edge protection is configured and auth is enabled for domain data.
- The rate limiter keys on remote IP, so forwarded-headers handling must be configured when the API runs behind a proxy.
- Bill and personal data must not be stored or served without the controls in ADR 0003.
