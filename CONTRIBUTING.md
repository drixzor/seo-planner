# Contributing to SEO Planner

Thank you for your interest in contributing. This guide covers the development workflow, project conventions, and how to make changes to different parts of the system.

## Development Setup

**Requirements**: Node.js 18+, Make

```bash
git clone https://github.com/drixzor/seo-planner.git
cd seo-planner

# Verify everything works
make lint       # syntax-check all .mjs files
make validate   # check required files, cross-references, agent frontmatter
make test       # run test suite
```

`make all` runs build, validate, and test in sequence.

## Running Tests

```bash
# Run the full test suite
node --test src/scripts/bootstrap.test.mjs

# Or via Make
make test
```

## Validation

The `make validate` target checks three things:

1. All required files exist (SKILL.md, agents, references, scripts)
2. Cross-references in SKILL.md point to real files
3. Agent files have required YAML frontmatter fields

Always run `make validate` before submitting a PR.

## Project Structure

```
src/
  SKILL.md              # Main protocol (state machine, rules, transitions)
  agents/               # Sub-agent definitions (Markdown with YAML frontmatter)
  references/           # Domain knowledge files (technical SEO, content, backlinks, etc.)
  scripts/              # Node.js ESM scripts (bootstrap, validation, tests)
```

See the [README](README.md) for a detailed walkthrough of each component.

## How to Add a New Reference File

1. Create the file in `src/references/` (e.g., `src/references/local-seo.md`)
2. Add a reference to it in `src/SKILL.md` under the references section
3. Update `CHANGELOG.md` with the addition
4. Run `make validate` to confirm cross-references resolve

## How to Modify an Agent

Agent files live in `src/agents/` and are Markdown files with YAML frontmatter. Every agent must include these frontmatter fields:

```yaml
---
name: agent-name
description: What this agent does
tools: [tool1, tool2]
disallowedTools: [tool3]
model: claude-sonnet-4-20250514
---
```

After modifying an agent:

1. Run `make validate` to confirm frontmatter is intact
2. Run `make test` to catch any regressions
3. Document the change in `CHANGELOG.md`

## How to Modify the State Machine

The sprint state machine (AUDIT -> STRATEGIZE -> PLAN -> EXECUTE -> MEASURE -> CLOSE, with PIVOT looping back to STRATEGIZE) is defined in multiple places that must stay in sync:

1. **`src/SKILL.md`** -- the authoritative protocol definition. Update transition rules, state table, file lifecycle matrix, auto-persistence, and per-state rules here first.
2. **`src/agents/orchestrator.md`** -- the runtime control plane. Add per-phase blocks with entry conditions, gate checks, and dispatch targets. Critical Rules section enumerates invariants.
3. **`src/scripts/validate-plan.mjs`** -- validation logic. Update `VALID_STATES` and `VALID_TRANSITIONS` to match any new or changed states (keep older transitions for backward compat with sprints created on prior versions).
4. **`src/scripts/bootstrap.mjs`** -- if the new state requires files to be created at sprint start, add them in `cmdNew`. If it changes the recovery file list, update `cmdResume`.
5. **`README.md`** and **`CLAUDE.md`** -- update the state diagram and prose so users see the protocol they'll experience.

Always run `make validate && make test` after modifying the state machine. The CI workflow runs both gates on every PR to main.

## Code Style

- **Protocols and references**: Markdown. Use headers, lists, and code blocks. Keep them readable for both humans and LLMs.
- **Scripts**: Node.js ESM (`.mjs` extension). Use `import`/`export`, not `require`.
- **No external dependencies**: Scripts use only Node.js built-in modules.

## Commit Messages

Use clear, imperative-mood messages that describe what the commit does:

```
Add local SEO reference file
Fix bootstrap crash when plans/ directory is missing
Update scoring framework with conversion metrics
```

Prefix with the area of change when helpful:

```
agents: add seo-measurer retry logic
references: expand technical SEO with Core Web Vitals thresholds
protocol: allow PIVOT from EXECUTE state
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `make lint && make validate && make test`
4. Update `CHANGELOG.md`
5. Open a PR against `main`
6. Fill out the PR template (summary, type, checklist)

All PRs must pass CI (lint, validate, test) before merging.
