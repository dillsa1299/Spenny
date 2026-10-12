# 0001: Defer access control to the hosting edge

## Status

Accepted

## Context

Spenny needs protection against malicious or abusive access, but it has no user accounts and stores no user data yet. The only API route returns the server time.

Microsoft Entra ID was evaluated and rejected for now because it adds a full login flow before there is anything to protect. A shared access token inside the SPA was also rejected: it gives little real protection and would be replaced once real users exist.

## Decision

- The API and pages carry no in-app authentication. `GET /api/time` is deliberately anonymous.
- The API applies a per-IP rate limit to bound abuse.
- Access control and bot protection are applied at the hosting edge at deployment (WAF/CDN, Cloudflare Access, basic auth, or Static Web Apps auth, depending on the host chosen).

## Consequences

- Do not deploy publicly until edge protection is configured.
- The rate limiter keys on remote IP, so forwarded-headers handling must be configured when the API runs behind a proxy.
- Real user authentication (an OIDC identity provider) must be introduced before any bill or personal data is stored.
