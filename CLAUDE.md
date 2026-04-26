# SEO Planner — Claude Code Reference

## What This Is
State-machine driven SEO optimization system. Clone into any website repo, run 90-day sprints.

## Running It
```bash
# From the website repo root:
node .seo-planner/src/scripts/bootstrap.mjs new "goal"
node .seo-planner/src/scripts/bootstrap.mjs resume
node .seo-planner/src/scripts/bootstrap.mjs close
```

## State Machine
AUDIT → PLAN → EXECUTE → MEASURE → CLOSE (with PIVOT loop from MEASURE back to PLAN).

## Key Files
1. `src/SKILL.md` — master protocol (load this as the skill)
2. `src/references/` — SEO frameworks, checklists, templates
3. `src/agents/` — sub-agent definitions
4. `src/scripts/bootstrap.mjs` — sprint directory management

## Architecture
- Filesystem = persistent memory. Context window = RAM.
- `plans/` directory holds all sprint data (gitignored).
- Cross-sprint learning via FINDINGS.md, DECISIONS.md, LESSONS.md.
- LESSONS.md ≤200 lines, rewritten each sprint close.
