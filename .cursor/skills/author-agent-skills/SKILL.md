---
name: author-agent-skills
description: Create or edit Agent Skills in this repo per agentskills.io. Use when adding a project skill, writing SKILL.md frontmatter, scoping skills with paths, or asking how Cursor discovers skills in .cursor/skills/.
license: MIT
metadata:
  standard: https://agentskills.io/specification
---

# Author Agent Skills (Spenny)

Follow the [Agent Skills specification](https://agentskills.io/specification). Project skills live under `.cursor/skills/<name>/SKILL.md`.

## Required frontmatter

```yaml
---
name: my-skill          # lowercase, hyphens; must match folder name
description: What it does and when to use it (include trigger phrases).
---
```

Optional: `license`, `compatibility`, `metadata`, `paths` (Cursor: glob patterns to scope the skill to certain files), `disable-model-invocation: true` (slash-only, no auto-apply).

## Authoring rules

- Keep `SKILL.md` focused; move long reference material to `references/`.
- Put runnable helpers in `scripts/` and reference them with relative paths.
- Descriptions should name concrete tasks and keywords so the agent activates reliably ([optimizing descriptions](https://agentskills.io/skill-creation/optimizing-descriptions)).
- Do not create skills under `~/.cursor/skills-cursor/` (reserved for Cursor built-ins).

## Cursor-specific

- Discover skills: **Customize → Skills**, or type `/` in Agent chat.
- Repo layout and nested skills: [Cursor skills docs](https://cursor.com/docs/context/skills).
- Convert old rules: `/migrate-to-skills` in Agent when appropriate.

## After adding a skill

Commit the new folder under `.cursor/skills/`. If installed via `npx skills`, update `skills-lock.json` with `npx skills update`.
