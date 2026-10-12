# Spenny — agent context

Spenny is a simple bill tracker for monthly bills and what is left to pay. See [README.md](./README.md).

## Agent Skills

This repo uses the open [Agent Skills](https://agentskills.io/home) standard. Project skills are in [`.cursor/skills/`](./.cursor/skills/README.md). Use **`author-agent-skills`** when creating new skills.

Installed third-party skills (also under `.cursor/skills/`): **apple-design**, **graphify**, **ponytail** (+ audit, review, debt, gain, help). Update skills.sh packages with `npx skills@latest update` where `skills-lock.json` applies.

### Graphify

Always-on rule: `.cursor/rules/graphify.mdc`. CLI: `pip install graphifyy`. Build with `/graphify .` → `graphify-out/`.

### Ponytail

Always-on rule: `.cursor/rules/ponytail.mdc`. Modes and reviews via ponytail skills in `.cursor/skills/`.
