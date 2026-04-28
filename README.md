# SEO Planner

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Skill](https://img.shields.io/badge/Skill-v1.2.0-green.svg)](VERSION)

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill that turns SEO from guesswork into a system. It runs structured 90-day sprints — audit the site, plan the strategy, execute changes, measure results, and pivot based on data. Everything gets written to disk. The AI doesn't forget what it found, what it tried, or what worked.

Install it once. Use it on every website you touch.

---

## The Problem

Most SEO work looks like this: publish some blog posts, fix a meta tag, buy a few backlinks, check rankings in three months, wonder why nothing moved. There's no structure. No memory. No system.

SEO Planner fixes this by enforcing a cycle:

```
AUDIT → STRATEGIZE → PLAN → EXECUTE → MEASURE → CLOSE
                       ↑                  ↓
                       └─── PIVOT ←───────┘
```

Each sprint produces a structured directory of findings, decisions, and metrics. When the sprint closes, those lessons merge into consolidated files. The next sprint reads them. Over time, the system learns what works *for your specific site*.

**v1.2 highlights**: a dedicated **STRATEGIZE** phase between AUDIT and PLAN forces strategy decisions (especially programmatic page volume) to be derived from adversarial competitor evidence rather than templates. Strategy Gates authored during STRATEGIZE become binding falsification signals — when a gate fails during MEASURE, PIVOT is automatic, not a recommendation. PIVOT routes back to STRATEGIZE so strategy is re-derived from new evidence, not just re-planned with the same assumptions.

---

## Quick Start

**Requires**: Node.js 18+

```bash
# 1. Clone and install the skill
git clone https://github.com/drixzor/seo-planner.git
cp -r seo-planner/src ~/.claude/skills/seo-planner

# 2. (Optional) Install sub-agents for parallel audits
mkdir -p ~/.claude/agents
cp seo-planner/src/agents/*.md ~/.claude/agents/

# 3. Open Claude Code in any website project
cd your-website/
# Just say: "optimize this site's SEO"
```

That's it. The planner activates, creates a `plans/` directory in your project, and starts with a full audit.

---

## What Happens in a Sprint

### AUDIT — understand what you're working with

The system runs four structured audits before doing anything:

- **Technical**: page speed, Core Web Vitals, crawlability, indexation, schema, mobile, HTTPS, redirects
- **Content**: existing pages, keyword coverage, topical gaps, internal linking, content quality
- **Backlinks**: domain rating, referring domains, anchor text, toxic links, competitor link gap
- **Competitors (adversarial)**: top 3 competitors run through an 8-item adversarial checklist with evidence tier labels — sitemap classification, traffic-per-page signals, dead-page detection, **failed templates** (archive.org checks), anchor profile, SERP feature ownership, moat quantification with time-cost-to-replicate, what we have they don't

All four must be complete before moving to STRATEGIZE. No skipping straight to "let's write some content." If the competitor audit lacks evidence tier labels, STRATEGIZE rejects it and routes back to AUDIT.

### STRATEGIZE — derive evidence-bound strategy (v1.2)

Strategy is its own phase. Output is `strategy.md`, an 8-section document where every claim cites an audit finding:

- **Wedge thesis**: where in this niche we attack, why now, why us (3 sentences max, fully cited)
- **SCORE assessment**: 1-10 scoring per dimension with evidence
- **Adversarial competitor synthesis**: per-competitor moat, weakness, failed templates, relevance to wedge
- **Moat analysis**: theirs (time-to-match) and ours (top 5 unfair advantages)
- **Programmatic volume decision**: explicit choice between zero / bounded with gate / aggressive with gate — with cited audit reasoning
- **KD gating decision**: per-DR-band keyword difficulty thresholds
- **Channel bets**: commit/ignore decisions per channel (ignores are as load-bearing as commits)
- **Strategy Gates**: 3-7 binding falsification signals as table rows. Each gate has a measurement window and a `Mandated action: PIVOT / DOCUMENT / EXTEND`

Strategy without binding gates is unfalsifiable, so the orchestrator rejects it. You review and approve the strategy before PLAN.

### PLAN — translate strategy into tactics

The PLAN phase reads `strategy.md` (binding) and produces `plan.md` plus `verification.md`:

- **Topical map**: pillar pages, content clusters, internal linking architecture (citing strategy.md sections)
- **Content calendar**: what to create, in what order, with deadlines — programmatic volume matches strategy.md exactly (no soft rounding)
- **Technical fix list**: ordered by impact, from the audit findings
- **Link building strategy**: tactics translated from strategy.md → Channel Bets
- **KPI targets**: baseline vs 30/60/90-day goals
- **Strategy Gates copied verbatim** into `verification.md` so the measurer can evaluate them

If feedback during plan review is strategic (rather than tactical), the orchestrator routes back to STRATEGIZE. You can't override strategy by editing the plan.

### EXECUTE — implement step by step

One task at a time. Content creation, technical fixes, schema markup, internal linking. Each change gets committed. If something breaks, the agent gets two fix attempts — then it stops and asks you instead of spiraling.

### MEASURE — check the numbers (binding gates included)

Rankings, traffic, indexation, Core Web Vitals, conversions, **and Strategy Gates**. The measurer evaluates each gate row against its threshold within its measurement window. When a gate with `Mandated action: PIVOT` fails, the measurer writes `MANDATED: PIVOT` to the verdict — the orchestrator then transitions to PIVOT automatically, with no user menu. This is the only signal in the system the measurer carries enforcement authority on.

The SCORE framework evaluates progress across five dimensions:

| | Dimension | What it covers |
|-|-----------|---------------|
| **S** | Site Optimization | Technical SEO, page speed, mobile, crawlability |
| **C** | Content Production | Topical authority, content quality, publishing cadence |
| **O** | Outside Signals | Backlinks, brand mentions, digital PR |
| **R** | Rank Enhancement | Growth experiments, content refresh, featured snippets |
| **E** | Evaluate Results | Analytics, tracking, KPIs, ROI |

If targets aren't met, the system pivots — and PIVOT routes back to **STRATEGIZE**, not PLAN, so strategy is re-derived from new evidence rather than re-applied with the same assumptions.

### CLOSE — document and learn

Sprint results, SCORE change, key decisions, and lessons all get written to a summary. Lessons merge into `plans/LESSONS.md` — a file that persists across sprints and makes the system smarter about *your specific site* over time.

---

## Cross-Sprint Learning

This is the part that matters most. When a sprint closes:

1. Audit findings merge to `plans/FINDINGS.md`
2. Decisions merge to `plans/DECISIONS.md`
3. `plans/LESSONS.md` gets rewritten with what actually works for this site

Sprint 2 reads all of this before starting. Sprint 3 reads the accumulated knowledge of sprints 1 and 2. Failed keyword strategies, content types that performed well, technical patterns — it all carries forward. The system gets better at optimizing *your* site specifically, not just "SEO in general."

---

## Using It Across Projects

Install once, use everywhere:

```
~/.claude/skills/seo-planner/     ← Installed ONCE
~/.claude/agents/seo-*.md         ← Installed ONCE

project-a/plans/                  ← Created per-project (auto)
project-b/plans/                  ← Created per-project (auto)
project-c/plans/                  ← Created per-project (auto)
```

Each project builds its own `plans/` directory with its own LESSONS.md. What works for an e-commerce site won't be applied to a SaaS blog — the learning is per-site.

---

## Sprint Management

```bash
node <skill-path>/scripts/bootstrap.mjs new "goal"           # Start a sprint
node <skill-path>/scripts/bootstrap.mjs new --force "goal"   # Close current, start new
node <skill-path>/scripts/bootstrap.mjs resume               # Resume after context loss
node <skill-path>/scripts/bootstrap.mjs status               # One-line status
node <skill-path>/scripts/bootstrap.mjs close                # Close sprint
node <skill-path>/scripts/bootstrap.mjs list                 # List all sprints
node <skill-path>/scripts/bootstrap.mjs migrate-v12 [path]   # Backfill strategy.md for v1.1 sprints (v1.2+)
```

`plans/` is automatically added to `.gitignore`. One active sprint per project at a time.

---

## Sub-Agents

Optional specialized agents that run in parallel during specific phases:

| Agent | Phase | What it does |
|-------|-------|-------------|
| `seo-auditor` | AUDIT | Runs one of the four audits (can run 4 in parallel) — competitors audit is the adversarial 8-item version |
| `seo-strategist` | STRATEGIZE | Derives evidence-bound wedge thesis, programmatic volume decision, and binding Strategy Gates. Writes strategy.md only. |
| `seo-planner-agent` | PLAN | Translates strategy into plan.md (topical map, calendar, KPIs, steps) and verification.md (Strategy Gates copied verbatim) |
| `seo-executor` | EXECUTE | Implements one task at a time |
| `seo-measurer` | MEASURE | Collects metrics, runs verification checks, evaluates Strategy Gates with binding `MANDATED: PIVOT` verdicts |
| `seo-reviewer` | MEASURE | Adversarial review — challenges the strategy (sprint 2+) |
| `seo-archivist` | CLOSE | Writes the sprint summary and updates lessons |

Without sub-agents installed, the main agent handles everything. With them, audits run 4x faster.

---

## What's Included

```
src/
+-- SKILL.md                        # Core protocol — the state machine and all rules
+-- agents/                         # 7 sub-agent definitions
+-- scripts/
|   +-- bootstrap.mjs               # Sprint directory management
|   +-- bootstrap.test.mjs          # Test suite
|   +-- validate-plan.mjs           # Protocol compliance validator
+-- references/
    +-- technical-seo.md            # Technical audit checklist (CWV, crawl, schema, mobile)
    +-- content-strategy.md         # Topical maps, pillar-cluster architecture, pSEO
    +-- backlink-strategy.md        # Link building frameworks, digital PR, anchor text
    +-- on-page-seo.md              # 45-point on-page optimization checklist
    +-- scoring-framework.md        # SCORE evaluation rubric and sprint milestones
    +-- competitive-intelligence.md # Adversarial competitor methodology (v1.2): sitemap classification, traffic-per-page proxies, archive.org workflow, moat quantification
    +-- measurement-framework.md    # 5-Why root cause analysis, classifications (incl. STRATEGY_FALSIFIED), convergence scoring
    +-- geo-optimization.md         # Generative Engine Optimization (AI citations)
    +-- local-seo.md                # Local SEO (GBP, citations, map pack)
    +-- ecommerce-seo.md            # E-commerce SEO (product schema, faceted nav)
    +-- file-formats.md             # Templates for all plan directory files
```

---

## FAQ

**What SEO tools does it need?**
None. It works with whatever's in your project (HTML files, sitemap, robots.txt). For richer analysis, provide data from Google Search Console, Ahrefs, or SEMrush.

**Can I have multiple sprints running?**
One per project. Close the current one before starting the next.

**What if the context window resets mid-sprint?**
Run `bootstrap.mjs resume`. Everything is on disk — the agent picks up exactly where it left off.

**What happens at sprint 4?**
Mandatory decomposition. The system identifies 2-3 independent workstreams that should be separate sprints. At sprint 5+, it stops and makes you break things up.

**I have a v1.1 sprint in flight — do I need to restart?**
No. Run `node <skill-path>/scripts/bootstrap.mjs migrate-v12` against the sprint directory. It extracts strategy-flavored sections (SCORE, target state, topical map, backlink strategy, pre-mortem signals) from your existing plan.md and writes a `strategy.md` stub with TODO markers. Complete the TODOs to bring the sprint forward to v1.2 conventions, then resume normally. `bootstrap.mjs resume` continues to work on un-migrated v1.1 sprints — it just shows a hint to run migrate-v12.

---

## Acknowledgements

This project was inspired by [Iterative Planner](https://github.com/NikolasMarkou/iterative-planner) by [Nikolas Markou](https://github.com/NikolasMarkou). We used his iterative planner extensively for our coding work and loved how it brought structure to complex tasks — the state machine, filesystem persistence, and cross-plan intelligence were exactly the kind of thinking we wanted to bring to SEO. His architecture is the foundation this project is built on.

---

## License

[GNU General Public License v3.0](LICENSE)
