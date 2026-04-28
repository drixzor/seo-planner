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

## State Machine (v1.2)
AUDIT → STRATEGIZE → PLAN → EXECUTE → MEASURE → CLOSE (with PIVOT loop from MEASURE back to STRATEGIZE).

STRATEGIZE produces `strategy.md` with binding Strategy Gates. The measurer enforces gates with `Mandated action: PIVOT` as automatic state transitions (no user menu). PIVOT routes back to STRATEGIZE so strategy is re-derived from new evidence — not just re-planned with the same assumptions.

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

## v1.2 Migration
v1.1 sprints in flight need a `strategy.md` backfilled before resuming. Run:
```bash
node <skill-path>/scripts/bootstrap.mjs migrate-v12 [path]
```
Without `[path]`, uses the current pointer. Outputs a `strategy.md` stub with v1.1 plan sections quoted as TODOs for manual completion.
