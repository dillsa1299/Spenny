# Agent Skills (Spenny)

This repository uses the open [Agent Skills](https://agentskills.io/home) format. Each skill is a folder with a `SKILL.md` file (YAML frontmatter + instructions). Optional subfolders: `scripts/`, `references/`, `assets/`.

## Where skills live

| Location | Use |
| -------- | --- |
| `.cursor/skills/` | Project skills (this directory; committed to git) |
| `~/.cursor/skills/` | Personal skills (machine-local) |

Cursor also discovers `.agents/skills/`; this repo standardizes on **`.cursor/skills/`** for project skills.

## Add or change a skill

1. Create `<skill-name>/SKILL.md` with `name` (matches folder) and `description` (what it does and when to use it).
2. Follow the [specification](https://agentskills.io/specification) and [best practices](https://agentskills.io/skill-creation/best-practices).
3. Invoke in Agent chat with `/skill-name` or let the agent pick it from the description.

Use the **`author-agent-skills`** skill in this folder for step-by-step authoring in Cursor.

## Install skills from elsewhere

- [skills.sh](https://skills.sh): `npx skills add <owner/repo> -a cursor -s <skill> -y`
- Graphify: `graphify install --platform agents --project`
- Copy a skill folder into `.cursor/skills/` and commit.

## Docs index

Full documentation index: https://agentskills.io/llms.txt
