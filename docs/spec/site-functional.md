# Spenny — site functional specification

**Status:** Draft (product / functionality)  
**Audience:** Design, engineering, QA  
**Issue:** [GitHub #3 — Create In-Depth Spec](https://github.com/dillsa1299/Spenny/issues/3)  
**Persistence (decided):** PostgreSQL for user and Spending data  

This document describes **what the product does** for end users and administrators. It intentionally avoids implementation detail (API shapes, frameworks) except where a decision affects behaviour.

---

## 1. Product summary

Spenny is a **mobile-first** web app that helps users see **how much scheduled spending remains for a chosen calendar month**. Users define **Spending** items (scheduled outflows — bills, subscriptions, planned payments). The app assumes each item is **settled on its scheduled date** (no manual “mark paid”, no overdue state).

**Income** (money in) is **out of scope for v1** except for navigation placeholders and category naming; a future release will add Income tracking with amount, date, frequency, and category.

**Money:** All amounts are **GBP** (£). No multi-currency support or conversion in v1.

**Time:** Calendar months, “today”, burndown, and admin rolling windows use **Europe/London**.

**Tenancy:** **Single user** per account. No households or sharing.

---

## 2. Terminology

| Term | Meaning |
|------|--------|
| **Spending** | A scheduled outflow: name, amount, date(s), frequency, category, optional description. Not a bank transaction feed. |
| **Occurrence** | One dated instance of a Spending in a given calendar month (after weekend adjustment). |
| **Series** | A recurring Spending template that generates occurrences. |
| **Exception** | A one-off override for a single occurrence (“edit this one”) without changing the rest of the series. |
| **Income** (future) | Planned inflows; v1 UI may tease only. |
| **Dashboard** | Month burndown chart + “coming up” list. |
| **Admin** | User with an `Admin` flag; sees an extra navigation area for site-wide statistics. |

User-facing copy should prefer **Spending** / **Income** over bank terms (deposits, withdrawals).

---

## 3. Visual and experience direction (Apple-inspired)

Spenny should feel **fluid and physical on the web**: immediate response, motion that starts from where things are on screen, and calm craft—not decorative animation bolted on afterward. Implementation should follow the project [**apple-design** skill](../../.cursor/skills/apple-design/SKILL.md) (WWDC *Designing Fluid Interfaces* and related guidance, translated for the browser).

### 3.1 Brand and colour

- **Theme:** Dark-first UI with **green** (money in / positive) and **red** (money out / spending) as semantic accents—not neon; must pass contrast needs on real backgrounds.
- **Motif:** Stock-market / financial chart aesthetic (burndown line, restrained grid, clear axes). The chart is a **hero** surface: legible at a glance, not cluttered.
- **Simplicity:** Show the common path first (month view, coming up, add Spending). Advanced recurrence options stay one level deeper.

### 3.2 Materials, depth, and layout

- **Floating chrome:** Primary navigation (tab bar on mobile; equivalent on desktop) reads as a **translucent layer** over scrolling content—content moves underneath, not only beside opaque bars.
- **Hierarchy:** Heavier blur/material for structural chrome; lighter treatment for chips and secondary controls. Avoid stacking light translucent surfaces on each other (legibility breaks).
- **Scroll edges:** Prefer soft fade/blur where content meets floating headers—not harsh 1px dividers everywhere.
- **Modals and sheets:** Create/edit Spending, confirmations, and month context use **sheet-style** presentation on mobile (anchored from the action that opened them). Destructive flows (delete account, delete series) pair the sheet/dialog with a **dimming scrim**; parallel browsing (e.g. month change) does not.

### 3.3 Motion and interaction

- **Response:** Interactive controls show **press feedback on pointer-down**, not only after release. No perceptible tap delay on primary actions.
- **Springs:** UI transitions use **spring-based** motion (critically damped by default—no bounce on menus and fades). **Momentum-driven** interactions (month carousel flick, sheet dismiss drag) may use slight overshoot only when the gesture carried velocity.
- **Interruptibility:** Any animation the user might reverse (sheet drag, month scrub) must be **grabbable mid-flight** and retarget from the **current on-screen** position—never jump from a stale target value.
- **Direct manipulation:** Drags track **1:1** with the pointer; respect grab offset. At release, hand off **velocity** into the settling animation so drag and animate feel like one motion.
- **Spatial consistency:** Screens and sheets **enter and exit on the same path** (e.g. sheet dismissed downward returns from the same edge). Popovers and menus originate from their **trigger** (transform origin / spatial relationship obvious).
- **Boundaries:** Rubber-band resistance at scroll/sheet limits—not hard frozen stops.
- **Chart:** Burndown updates feel **continuous** when changing month or when data loads; avoid jarring redraws. Optional: scrub or crosshair on the today marker should track smoothly (reduced-motion alternative: static crosshair, no parallax).

Existing client motion stack (e.g. Lenis smooth scroll, GSAP where appropriate) must **honour** `prefers-reduced-motion` and not fight spring-driven gesture UI.

### 3.4 Typography and type hierarchy

- **System-first:** Prefer the platform system font stack unless a deliberate brand face is chosen later.
- **Optical sizing:** Large dashboard numbers/headlines use **tighter tracking and leading**; body and list rows use comfortable leading; small labels may use slightly **positive** tracking.
- **Hierarchy:** Emphasize with **weight + size**, not size alone. Amounts and dates must remain scannable in lists.
- **User text size:** Layout scales with user font preferences (`rem`/`em` spacing)—no broken tab bar when text size increases.

### 3.5 Feedback, agency, and wayfinding

- **Four feedback types:** Status (loading month data), completion (Spending saved), warning (series edit affects multiple dates), error (validation, unverified login)—each with distinct, accessible treatment.
- **Agency:** Easy **undo** where cheap (e.g. dismiss sheet without saving); **confirm** only for irreversible or wide-impact actions (account delete, delete series)—already required in §5.6 and §7.6.
- **Wayfinding:** Every screen answers where the user is (selected month visible on Dashboard/Spending), how to add Spending, and how to reach Profile/sign out. Nav labels are **specific** (“Spending”, “Dashboard”) not vague (“Home”).
- **Income teaser:** Disabled/coming-soon Income nav must look intentional (not broken)—clear copy, no dead tap without feedback.

### 3.6 Accessibility (experience requirements)

- **`prefers-reduced-motion`:** Replace large slides/springs with short **opacity** transitions; keep state changes understandable without vestibular motion.
- **`prefers-reduced-transparency`:** Chrome becomes **more opaque**; reduce or remove blur.
- **`prefers-contrast: more`:** Stronger separation for text and controls on dark backgrounds.
- **Chart:** Do not rely on green vs red alone; use labels, position, or pattern for critical distinctions.
- **Sound/haptics:** Optional on web; if used, only on meaningful commits (snap, success)—never on every tap.

### 3.7 Surfaces checklist (v1)

| Surface | Apple-inspired expectation |
|--------|----------------------------|
| Landing | Calm hero + demo chart; CTA press feedback; scroll under translucent top bar if present |
| Dashboard | Burndown hero; month control feels physical; coming-up list scrolls under chrome |
| Spending list | Rows with clear press state; add opens sheet |
| Create/edit Spending | Sheet form; inline validation; category picker native-feeling |
| Profile / Admin | Clear hierarchy; stats read as cards on material backgrounds |
| Auth | Errors inline on sign-in (unverified local); no navigation flicker |

---

## 4. Public (unauthenticated) experience

### 4.1 Landing / home

- Fully **public**; no login required to view.
- **Marketing-first:** mottos, value proposition, feature highlights, **Join now** (sign-up) and **Sign in**.
- **Demonstration:** illustrative **fake** burndown and sample “coming up” data (static or lightly animated). Not backed by real user data; not a full second product surface.
- Fake data does not carry over after registration; after first successful auth, user lands on the **real Dashboard** for the **current** month.

### 4.2 Auth entry points

- Sign-up and sign-in accessible from landing CTAs and standard routes.

---

## 5. Authentication and accounts

### 5.1 Methods

- **Sign in with Google** (OAuth).
- **Local account:** email + password + **display name** (required at sign-up).

**No account linking** in v1: a Google identity and a local identity are separate accounts even if the email matches.

### 5.2 Local email verification

- Local accounts must **verify email** before using the app (no Dashboard, no Spending CRUD).
- **Unverified local login:** authentication **fails** with a clear, user-safe message (e.g. verify your email); user **stays on the sign-in screen** (no redirect into the app).
- Resend verification email available from the verification / sign-in flow as appropriate.

### 5.3 Google accounts

- No separate email verification step; after successful Google sign-in, user may use the app immediately.
- Display name initially from Google; **editable in Profile**.

### 5.4 Password (local)

- Minimum **8 characters**; no additional complexity rules in v1.
- **Forgot password** → email reset link flow.

### 5.5 Profile (authenticated)

- View **email** (not editable in v1).
- Edit **display name**.
- Change **password** (local accounts only).
- **Delete account** (see §5.6).

### 5.6 Delete account

- User must complete an explicit confirmation (e.g. type `DELETE` or confirm email).
- **Hard delete:** user record and **all** Spending data removed promptly; no grace-period restore in v1.

### 5.7 Security posture (product)

- Do not expose real user data on a public deployment until authentication and persistence are in place (see ADR 0001 in repo).

---

## 6. Navigation (authenticated)

Mobile-first primary navigation:

| Area | Purpose |
|------|--------|
| **Dashboard** | Burndown + coming up for selected month |
| **Spending** | Manage all occurrences in selected month |
| **Income** | **Coming soon** — visible as teaser or disabled; no real Income CRUD in v1 |
| **Profile** | Identity, password, delete account |
| **Admin** | **Only if user has Admin flag** — site statistics (see §10) |

Non-admin users: **Admin** tab **hidden** (not shown disabled). Direct navigation to admin URLs returns **not found** or equivalent non-revealing UX; server must reject admin actions for non-admins.

---

## 7. Spending — data and rules

### 7.1 Fields (v1)

| Field | Required | Notes |
|-------|----------|--------|
| Name | Yes | Short label |
| Amount | Yes | Positive number; GBP |
| Date | Yes | Scheduled date for occurrence or series anchor |
| Frequency | Yes | One-off, weekly, monthly, yearly |
| Category | Yes | From fixed list (§7.2) |
| Round weekend to previous Friday | No | Default off; see §7.4 |
| Description | No | Plain text, max **500** characters; detail/edit views only |

### 7.2 Categories (fixed list)

User must choose **one** category per Spending:

`Bills`, `Charity`, `Eating Out`, `Entertainment`, `Expenses`, `Family`, `Finances`, `General`, `Gifts`, `Groceries`, `Holidays`, `Income`, `Personal Care`, `Savings`, `Shopping`, `Transfers`, `Transport`

(No free-text “Other” in v1.)

### 7.3 Occurrences in a month

- For the **selected calendar month**, include only occurrences whose **adjusted** scheduled date falls in that month.
- **Weekly / monthly / yearly** series generate occurrences accordingly; **one-off** appears once.

### 7.4 Weekend adjustment

If **round weekend to previous Friday** is enabled and the raw date is **Saturday or Sunday**, the effective date is the **immediately preceding Friday**.

- **Bank holidays:** not adjusted in v1 (future enhancement).

### 7.5 Settlement model (no manual paid state)

- Each occurrence is treated as **settled on its effective scheduled date**.
- There is **no** “mark as paid”, **no** partial payment, **no** overdue bucket.
- **Backfill:** user may create or edit occurrences on **past dates within the current month** (and when viewing other months, dates in that month); burndown reflects them as already applied on or before that date.

### 7.6 Recurrence editing and deletion

When user edits or deletes from a recurring Spending, offer:

- **Edit this one / Delete this one** — creates or removes an **exception** for that occurrence; series unchanged elsewhere.
- **Edit series / Delete series** — changes or removes the **template** and affects generated occurrences per product rules.

**Confirmation** required when a series change affects **multiple** future dates (edit or delete).

(Exact regeneration rules for “edit series” in the current month are an implementation detail; behaviour must match user expectation: series changes apply to the template and remaining generated instances, exceptions preserved where applicable.)

---

## 8. Dashboard

### 8.1 Month selection

- User can move **backward and forward** across calendar months **without an artificial limit**.
- Empty month: burndown and lists show appropriate **empty states**.

### 8.2 Burndown chart

For the **selected month**:

1. **Month total** at the start of the month equals the sum of all occurrence amounts in that month (after weekend adjustment).
2. The burndown **steps down** on each occurrence’s effective date by that amount (auto-settled).
3. **Today marker:** a vertical indicator at **today’s date** on the chart **only when the selected month is the current calendar month**; hidden for past/future months.
4. At the today marker, the line value represents **remaining scheduled spending from today through month-end** (occurrences with effective date **after** today).

### 8.3 “Coming up” list (Dashboard)

- Shows occurrences in the **selected month** with effective date **strictly after today** (when selected month is current month).
- When viewing a **past** month: nothing “coming up” (or copy that reflects that the month is complete).
- When viewing a **future** month: appropriate forward-looking list for that month.
- Sorted by date ascending.
- Compact rows (name, date, amount, category); **no** description on dashboard rows.

---

## 9. Spending screen

- Lists **every occurrence** in the **selected month** (including dates on or before today).
- Supports create, edit (this one / series), delete (this one / series), with confirmations where specified.
- Description visible in detail/edit.

Month selector behaviour aligned with Dashboard (same selected month context is ideal UX; may be shared app state).

---

## 10. Admin

### 10.1 Granting Admin

- `Admin` flag set **only via operations / database** in v1 — **no** in-app promotion UI.

### 10.2 Admin page (v1)

Aggregated, **non-identifying** statistics only:

| Metric | Definition |
|--------|------------|
| Total registered users | Count of user accounts |
| New sign-ups | Count in last **24 hours** and last **7 days** |
| Logins (last 24 hours) | **Unique users** with at least one successful authentication in rolling 24h (Europe/London) |
| Auth provider split | Count Google vs local accounts |
| Total Spending records | Count of stored Spending rows (all users) |

No per-user drill-down, emails, or names on this page in v1.

**Future:** site configuration on the same Admin area (out of v1 scope except placeholder copy if desired).

---

## 11. Income (future — not v1)

Placeholder navigation and/or copy only. When implemented, Income entries are expected to support **amount, date, frequency, category** (aligned with Spending patterns). v1 **does not** include Income CRUD or burndown impact from income.

---

## 12. Non-functional expectations (lightweight)

- **Mobile-first** layouts; usable on desktop (pointer-precision affordances where appropriate).
- **Experience:** Meets §3 (Apple-inspired fluid UI); engineering reviews against [apple-design](../../.cursor/skills/apple-design/SKILL.md).
- **Accessibility:** §3.6 plus WCAG-oriented contrast on dark theme.
- **Privacy:** admin sees aggregates only; users see only their own data.
- **Performance:** Input path stays snappy (§3.3); month views remain responsive for typical personal volumes (dozens of series, hundreds of occurrences). Animate `transform` / `opacity` where possible.

---

## 13. Out of scope (v1)

- Income tracking (except teaser)
- Bank holiday adjustment for weekend rule
- Multi-currency
- Household / shared accounts
- Google ↔ local account linking
- Manual paid / unpaid workflow, overdue, partial payments
- Bank feed / transaction import
- Notifications (email/push) for due dates
- Per-user timezone
- In-app admin promotion
- Site configuration UI (admin stats only)

---

## 14. Open follow-ups (optional later specs)

- Exact copy for landing mottos and empty states
- Chart library and accessibility labelling
- Series regeneration edge cases (exception + edit series interaction) — document acceptance examples in QA scenarios
- Whether category `Income` on Spending rows is intentional for v1 or relabelled when Income ships

---

## 15. Acceptance themes (for QA)

- Unverified local user cannot access Dashboard; login shows error without navigation away.
- Google user reaches Dashboard after sign-in.
- Burndown for current month matches hand-calculated totals for a fixture month with weekend rounding.
- “Coming up” excludes today and past dates in current month; Spending list includes them.
- Month picker shows past/future months; today line only on current month.
- Edit/delete this one vs series behaves with confirmation on multi-date series impact.
- Admin tab visible only for admin; metrics match backend aggregates.
- Delete account removes user data.
- All amounts display as GBP.
- With `prefers-reduced-motion: reduce`, no essential information is lost (sheet/auth/chart still usable).
- Primary buttons and list rows show visible press feedback without waiting for click completion.
