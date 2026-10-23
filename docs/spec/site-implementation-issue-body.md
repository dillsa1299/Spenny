Part of #3. Product behaviour is defined in `docs/spec/site-functional.md`.

## Problem Statement

Younger users struggle to see, at a glance, how much of their money is still committed to bills and planned spending for the rest of the month. Spreadsheets and bank apps feel heavy or “too bank-y.” Spenny needs a simple, mobile-first experience: scheduled **Spending** (outflows), a month **burndown** view, and clear “what’s still ahead” — without manual payment tracking or overdue anxiety.

The codebase today is a React client and ASP.NET Core API (health, auth, and domain routes) with PostgreSQL and in-app authentication (ADR 0003). Issue #3 produced the functional spec; this ticket implements v1.

## Solution

Deliver the full v1 site described in `docs/spec/site-functional.md`:

- Public marketing landing with demo data
- Google and local authentication (verified email for local)
- Dashboard with month burndown and coming-up list
- Spending management (series, exceptions, categories)
- Profile and account deletion
- Admin-only aggregate statistics
- Dark, Apple-inspired UI with green/red accents
- PostgreSQL persistence

Spending is auto-settled on its effective date (no mark-paid). All amounts in GBP. Time in Europe/London.

## User Stories

1. As a visitor, I want to read what Spenny does on the home page without signing in, so that I can decide whether to join.
2. As a visitor, I want to see a sample burndown chart and coming-up list with fake data, so that I understand the product before creating an account.
3. As a visitor, I want clear **Join now** and **Sign in** actions, so that I can start registration or return to my account.
4. As a new user, I want to sign up with Google, so that I can start quickly without a new password.
5. As a new user, I want to sign up with email, password, and display name, so that I can use Spenny without a Google account.
6. As a local user who has not verified email, I want to receive a verification message, so that I know how to activate my account.
7. As a local user who has not verified email, I want sign-in to fail with a clear message on the sign-in screen, so that I am not confused by partial access.
8. As a local user, I want to resend the verification email, so that I can complete activation if the first message was lost.
9. As a verified or Google user, I want to land on the Dashboard for the current month after sign-in, so that I immediately see my month picture.
10. As a signed-in user, I want the Dashboard to show a burndown of total scheduled Spending for the selected month, so that I see how much is left as the month progresses.
11. As a signed-in user, I want the burndown to step down on each Spending’s effective date, so that the chart reflects auto-settlement without manual actions.
12. As a signed-in user viewing the current month, I want a vertical marker for today on the chart, so that I can relate the line to “now.”
13. As a signed-in user viewing a past or future month, I want the today marker hidden, so that the chart is not misleading.
14. As a signed-in user, I want a **Coming up** list of Spending occurrences strictly after today in the selected month, so that I know what is still ahead this month.
15. As a signed-in user viewing a past month, I want coming-up copy or an empty state that reflects the month is complete, so that I am not shown fake “future” items.
16. As a signed-in user, I want to change the displayed month forward and backward without limit, so that I can plan other months.
17. As a signed-in user, I want Dashboard and Spending views to share the same selected month, so that navigation feels consistent.
18. As a signed-in user, I want to open a Spending list for the month that includes past and future dates, so that I can review everything in that month.
19. As a signed-in user, I want to add a one-off Spending with name, amount, date, and category, so that I can track a single bill.
20. As a signed-in user, I want to add recurring Spending (weekly, monthly, yearly), so that subscriptions and regular bills are modeled once.
21. As a signed-in user, I want to optionally round weekend dates to the previous Friday, so that my chart matches when money actually leaves.
22. As a signed-in user, I want to pick a category from the fixed Spenny list, so that spending is grouped consistently.
23. As a signed-in user, I want an optional description on Spending, so that I can add notes without cluttering lists.
24. As a signed-in user, I want to backfill Spending on past dates in a month, so that I can set up my account mid-month accurately.
25. As a signed-in user, I want to edit a single occurrence of a series, so that one month can differ without changing the whole series.
26. As a signed-in user, I want to edit the series template, so that future occurrences update from a single place.
27. As a signed-in user, I want to delete a single occurrence or an entire series, with confirmation when many dates are affected, so that I avoid mistakes.
28. As a signed-in user, I want Spending forms in a sheet-style UI with inline validation, so that mistakes are caught before save.
29. As a signed-in user, I want press feedback on taps and fluid sheet motion (with reduced-motion alternatives), so that the app feels responsive and polished.
30. As a signed-in user, I want an Income nav entry that clearly says coming soon, so that I know money-in tracking is planned.
31. As a signed-in user, I want to view and edit my display name in Profile, so that the app shows how I want to be addressed.
32. As a signed-in user with a local account, I want to change my password, so that I can maintain account security.
33. As a signed-in user, I want to request a password reset via email, so that I can recover access if I forget my password.
34. As a signed-in user, I want to delete my account with explicit confirmation, so that I can leave and remove my data.
35. As a signed-in user, I want all monetary amounts shown in GBP, so that formatting is consistent.
36. As an admin, I want an Admin tab visible only to me, so that regular users do not see operator tools.
37. As an admin, I want to see aggregate counts (users, sign-ups, logins, provider split, Spending rows), so that I can monitor site health without seeing PII.
38. As a non-admin, I want admin routes and APIs to be inaccessible and hidden, so that operator surfaces are not discoverable.
39. As a signed-in user, I want my Spending data isolated to my account, so that no other user can read or change it.
40. As a mobile user, I want primary navigation via a bottom tab bar with translucent chrome, so that content uses the screen well.
41. As a user who prefers reduced motion, I want charts and navigation to remain usable without large motion, so that I am not excluded.
42. As a user who prefers higher contrast or less transparency, I want the UI to adapt, so that text and controls stay readable.

## Implementation Decisions

- **Supersedes ADR 0001 for stored data:** Introduce in-app authentication and authorization before persisting Spending or profile data in production. Edge rate limiting remains; per-user auth replaces anonymous access for domain APIs.
- **Identity:** ASP.NET Core Identity (or equivalent) with Google OAuth external login and local email/password. No account linking between Google and local in v1. Local accounts require verified email before any domain API access. Unverified login attempts return a user-safe error without issuing a session.
- **Admin:** Boolean `IsAdmin` on user; set only via operations/DB. Admin-only endpoints return 403 for non-admins; client hides Admin nav and shows not-found for admin routes.
- **Persistence:** PostgreSQL via EF Core (align with ADR 0002). Entities at minimum: User (profile fields, auth provider type, admin flag), Spending series (template fields), Spending exceptions (per-occurrence overrides/cancellations), login audit events for admin “unique logins in 24h” (store timestamp + user id, no PII in admin aggregates).
- **Spending model:** Series holds name, amount, frequency, category, weekend-round flag, optional description, anchor date. Exceptions override or suppress a single calendar occurrence. Occurrences for a month are **derived** at read time (or materialized with clear regeneration rules on series edit).
- **Calendar rules:** Europe/London for month boundaries, “today,” and admin windows. UK working-day adjustment when flag enabled: walk back to previous weekday that is not a UK public holiday (Nager.Date GB).
- **Settlement semantics:** No paid/unpaid flags. Burndown and lists are computed from effective dates vs “as of” today. “Coming up” = effective date strictly after today in selected month.
- **Categories:** Closed enum matching functional spec list (including `Income` as a Spending category until Income feature ships).
- **Month API shape:** Authenticated endpoints return a month bundle: burndown points (start-of-month total, step downs per date, remaining-at-today for current month), occurrences for Spending screen, upcoming subset for Dashboard. Client may compute burndown only if server is source of truth for occurrence expansion — **server must own occurrence expansion** so web and future clients agree.
- **Landing:** Static/demo dataset embedded in client; no API. Post-auth redirect to Dashboard current month.
- **Client:** Extend React Router with public landing, auth routes, authenticated shell (Dashboard, Spending, Profile, Admin). MUI theme dark + green/red accents. Sheets for create/edit; follow apple-design skill for motion and materials. Lenis/GSAP must not break `prefers-reduced-motion`.
- **Email:** Transactional provider for verification and password reset (configuration via secrets, not committed).
- **Delete account:** Cascading delete of series, exceptions, and audit rows for that user.

### Prototype-grade decision (occurrence expansion)

Occurrence generation for a `(year, month)` from series + exceptions should behave as:

```text
for each series owned by user
  expand raw occurrence dates into [month] per frequency
  apply weekend-to-Friday if flagged
  apply exception: skip, replace fields, or add one-off
dedupe by (seriesId, effectiveDate) with exception winning
sort by effectiveDate
```

Burndown: start at sum(amounts); for each effective date in month ascending, subtract that day’s total amount; value at today = sum(amounts where effectiveDate > today) for current month view.

## Testing Decisions

**Primary test seam (proposed):** `SpendingMonthProjection` — a single domain module that takes series + exceptions + `(year, month)` + `asOfDate` + time zone and returns occurrences, burndown steps, and upcoming ids. Pure logic, no HTTP or database.

- **What makes a good test:** Assert inputs/outputs only (dates, amounts, lists). Use fixed `asOfDate` and fixture series/exception graphs. Cover weekend rounding, weekly/monthly/yearly spanning month edges, exceptions (edit one, delete one), backfill in past dates, empty month, and burndown/today marker preconditions.
- **Modules tested:** Projection module first and exhaustively; thin API integration tests afterward for auth (401/403), tenant isolation (user A cannot read user B), and one happy-path CRUD smoke per endpoint group (pattern from existing `HealthEndpointTests` + `SpennyWebApplicationFactory`).
- **Prior art:** `Spenny.Api.Tests` integration style with factory and HTTP assertions; CI Postgres per ADR 0002 for migration/smoke when EF is wired.

Client UI and chart rendering are out of scope for unit tests in v1 except optional snapshot/smoke; correctness lives in projection + API contract tests.

## Out of Scope

- Income CRUD and burndown impact (teaser nav only)
- Bank holiday adjustment
- Multi-currency
- Household sharing
- Google/local account linking
- Manual mark paid, overdue, partial payments
- Bank feeds and transaction import
- Push/email due-date notifications
- Per-user timezone
- In-app admin promotion UI
- Admin site configuration (stats only)
- Public production deploy without auth + edge hardening

## Further Notes

- Functional acceptance themes: `docs/spec/site-functional.md` §15.
- ADR 0001 remains relevant for **anonymous** routes (e.g. health, OAuth callbacks); domain routes require authentication.
- Confirm testing seam with implementer: if projection seam is rejected, fall back to **authenticated API integration tests** as the single seam (heavier, slower).
