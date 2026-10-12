# Spenny — agent context

Spenny is a simple bill tracker for monthly bills and what is left to pay. See [README.md](./README.md).

## Agent Skills

This repo uses the open [Agent Skills](https://agentskills.io/home) standard. Project skills are in [`.cursor/skills/`](./.cursor/skills/README.md). Use **`author-agent-skills`** when creating new skills.

Installed third-party skills (also under `.cursor/skills/`): **mattpocock/skills** (engineering workflow: `triage`, `to-spec`, `implement`, `pr`, and others), **apple-design**, **graphify**, **ponytail** (+ audit, review, debt, gain, help). Update skills.sh packages with `npx skills@latest update` where `skills-lock.json` applies.

### Issue tracker

GitHub Issues on **dillsa1299/Spenny** (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: optional root `GLOSSARY.md`, ADRs under `docs/adr/`. See `docs/agents/domain.md`.

### Graphify

Always-on rule: `.cursor/rules/graphify.mdc`. CLI: `pip install graphifyy`. Build with `/graphify .` → `graphify-out/`.

### Ponytail

Always-on rule: `.cursor/rules/ponytail.mdc`. Modes and reviews via ponytail skills in `.cursor/skills/`.
