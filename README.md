# SEO Planner

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Skill](https://img.shields.io/badge/Skill-v1.0.0-green.svg)](VERSION)

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill that turns SEO from guesswork into a system. It runs structured 90-day sprints — audit the site, plan the strategy, execute changes, measure results, and pivot based on data. Everything gets written to disk. The AI doesn't forget what it found, what it tried, or what worked.

Install it once. Use it on every website you touch.

---

## The Problem

Most SEO work looks like this: publish some blog posts, fix a meta tag, buy a few backlinks, check rankings in three months, wonder why nothing moved. There's no structure. No memory. No system.

SEO Planner fixes this by enforcing a cycle:

```
AUDIT → PLAN → EXECUTE → MEASURE → CLOSE
          ↑                  ↓
          └──── PIVOT ←──────┘
```

Each sprint produces a structured directory of findings, decisions, and metrics. When the sprint closes, those lessons merge into consolidated files. The next sprint reads them. Over time, the system learns what works *for your specific site*.

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
- **Competitors**: top 3-5 competitors analyzed across content, technical, and backlink dimensions

All four must be complete before moving to PLAN. No skipping straight to "let's write some content."

### PLAN — build the strategy

The plan includes:
- **Topical map**: pillar pages, content clusters, internal linking architecture
- **Content calendar**: what to create, in what order, with deadlines
- **Technical fix list**: ordered by impact, from the audit findings
- **Link building strategy**: tactics, targets, timeline
- **KPI targets**: baseline vs 30/60/90-day goals for traffic, rankings, indexation

You review and approve the plan before anything gets implemented.

### EXECUTE — implement step by step

One task at a time. Content creation, technical fixes, schema markup, internal linking. Each change gets committed. If something breaks, the agent gets two fix attempts — then it stops and asks you instead of spiraling.

### MEASURE — check the numbers

Rankings, traffic, indexation, Core Web Vitals, conversions. All measured against the targets set in PLAN. The SCORE framework evaluates progress across five dimensions:

| | Dimension | What it covers |
|-|-----------|---------------|
| **S** | Site Optimization | Technical SEO, page speed, mobile, crawlability |
| **C** | Content Production | Topical authority, content quality, publishing cadence |
| **O** | Outside Signals | Backlinks, brand mentions, digital PR |
| **R** | Rank Enhancement | Growth experiments, content refresh, featured snippets |
| **E** | Evaluate Results | Analytics, tracking, KPIs, ROI |

If targets aren't met, the system pivots — it doesn't just keep doing more of what isn't working.

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
```

`plans/` is automatically added to `.gitignore`. One active sprint per project at a time.

---

## Sub-Agents

Optional specialized agents that run in parallel during specific phases:

| Agent | Phase | What it does |
|-------|-------|-------------|
| `seo-auditor` | AUDIT | Runs one of the four audits (can run 4 in parallel) |
| `seo-strategist` | PLAN | Generates the full strategy from audit findings |
| `seo-executor` | EXECUTE | Implements one task at a time |
| `seo-measurer` | MEASURE | Collects metrics and runs verification checks |
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

---

## Acknowledgements

This project was inspired by [Iterative Planner](https://github.com/NikolasMarkou/iterative-planner) by [Nikolas Markou](https://github.com/NikolasMarkou). We used his iterative planner extensively for our coding work and loved how it brought structure to complex tasks — the state machine, filesystem persistence, and cross-plan intelligence were exactly the kind of thinking we wanted to bring to SEO. His architecture is the foundation this project is built on.

---

## License

[GNU General Public License v3.0](LICENSE)
