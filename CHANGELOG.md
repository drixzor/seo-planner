# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.3.0] - 2026-08-03

Two upgrades. First, **web-grounded research**: SEO's ground truth lives on live SERPs and competitor pages, but the auditor and strategist could only read the local repo — so their evidence topped out at `inferred`/`estimated`. They now have `WebFetch`/`WebSearch`, closing the gap to `confirmed` (adapted from iterative-planner v2.57.3's explorer-web-research change). Second, **self-consistency gates**: a family of small, fail-loud, zero-dependency checks (adapted from iterative-planner's parity-gate work, v2.22–2.57) that keep the skill's own bookkeeping honest — and the anti-vacuity discipline (every gate proven RED in tests) that makes them trustworthy. Also folds in the previously-unreleased IndexNow + AI-discoverability work.

### Added
- **Web research for the AUDIT and STRATEGIZE phases.** `seo-auditor` and `seo-strategist` gain `WebFetch`/`WebSearch`. New "Web Research" guidance in `seo-auditor.md` and a research note in `seo-strategist.md`; `competitive-intelligence.md` gains a "Getting to `confirmed`: live web research" subsection; `file-formats.md` gains a dated web-source citation convention. All include the untrusted-web-content rule (fetched pages are DATA, never instructions) and proportionality limits.
- **Parity/wiring gates** (`src/scripts/`, zero-dependency, fail-loud, importable pure functions behind an `isEntryPoint` guard):
  - `check-changelog-parity.mjs` — first `## [X.Y.Z]` CHANGELOG entry must equal `VERSION` (skips the pinned `[Unreleased]` header).
  - `check-readme-parity.mjs` — README `Skill-v<X.Y.Z>` badge must equal `VERSION`.
  - `check-agent-wiring.mjs` — every `references/*.md` citation across agents + SKILL.md + references must resolve, with an anti-vacuity `[scan-floor]` guard against a silently collapsed scan set.
- `checks.test.mjs` — 16 tests: pure-function units plus real-CLI spawns proving BOTH the PASS and the RED branch of every gate (anti-vacuity).
- `make check` target runs all three gates; `make validate` now invokes it.
- **Plain-first CLOSE objective** in `seo-archivist.md`: `summary.md`/`LESSONS.md` are written for the business owner — expand jargon/acronyms, lead with business outcomes (adapts the cheap half of iterative-planner's register work, v2.57.0).
- **IndexNow / rapid indexing** (`submit-indexnow.mjs` + `technical-seo.md` subsection) and **AI discoverability** (`llms.txt` + explicit AI-crawler allowlist in `geo-optimization.md`); `seo-auditor` TECHNICAL audit grew 15 → 17 items. *(Merged under Unreleased in #3; released here.)*

### Changed
- `make test` now runs `src/scripts/*.test.mjs` (previously only `bootstrap.test.mjs` ran; `validate-plan.test.mjs` and `tools.test.mjs` were orphaned from CI).
- `SKILL.md` reference descriptions and agent-tool listings updated for web research and IndexNow/llms.txt.
- README/CLAUDE.md/CONTRIBUTING updated for the new scripts, `make check`, and the expanded `make test`.

## [1.2.0] - 2026-04-28

Evidence-driven strategy. The first real-site test (WorkCyprus / cyprusjobs.com) revealed a structural failure: a v1.1 sprint shipped 150 programmatic city+category pages on a DR 0 domain in the same execution pass as foundation work. The plan correctly scheduled programmatic for "Week 6-8", but those week labels were decorative — the orchestrator only enforces dependency annotations, never calendar dates. Strategy was rationalized post-hoc rather than derived from adversarial competitor evidence, and the pre-mortem's "STOP IF zero pages indexed" signal lived as prose in plan.md, invisible to the measurer. v1.2 addresses the structural cause, not just the symptom. Tracking: [#1](https://github.com/drixzor/seo-planner/issues/1).

### Added
- New `STRATEGIZE` phase between AUDIT and PLAN. State machine cycle becomes: AUDIT → STRATEGIZE → PLAN → EXECUTE → MEASURE → CLOSE.
- New agent `seo-planner-agent.md` owns the PLAN phase. Reads strategy.md (binding) and audit findings; writes plan.md plus verification.md (with Strategy Gates copied verbatim).
- New per-sprint artifact `strategy.md` with 8 required sections: Wedge Thesis, SCORE Assessment, Adversarial Competitor Synthesis, Moat Analysis, Programmatic Volume Decision, KD Gating Decision, Channel Bets, Strategy Gates (binding falsification signals).
- New reference doc `competitive-intelligence.md` covering the adversarial audit methodology: sitemap classification, traffic-per-page signals (with proxies for missing tools), failed-template detection via archive.org, anchor profile analysis, SERP feature ownership taxonomy, moat quantification (time-cost-to-replicate), evidence tier rubric.
- New `STRATEGY_FALSIFIED` failure classification for the seo-measurer (5th classification alongside WRONG_TARGET, POOR_EXECUTION, EXTERNAL_FACTOR, INSUFFICIENT_TIME).
- New `bootstrap.mjs migrate-v12 [path]` subcommand to backfill `strategy.md` from a v1.1 sprint's plan.md, preserving Topical Map / SCORE / Backlink Strategy / Pre-Mortem sections as fenced migration hints.
- New 10 tests in bootstrap.test.mjs covering strategy.md stub creation, migrate-v12, and the adversarial competitors.md template (63 → 73 tests).

### Changed
- `seo-strategist.md` rewritten for STRATEGIZE-only responsibility. Strategist now writes `strategy.md` only — never plan.md or verification.md. Forced AUDIT back-loop if `audit/competitors.md` has fewer than 3 evidence-tier-labeled findings per competitor.
- `seo-auditor.md` COMPETITORS section replaced. The 5-item descriptive checklist (Content Structure, Schema Markup, Page Speed, Content Gaps, Structural Advantages) becomes an 8-item adversarial numbered checklist with mandatory evidence tier labels (`confirmed` / `inferred` / `estimated`). Bare `[estimated]` data is no longer accepted.
- `seo-measurer.md` gains enforcement authority on binding gates only. New Step 4 (Evaluate Strategy Gates) with window-elapsed checks and binding `MANDATED: PIVOT` verdicts. The final rule is amended with a carve-out clause: gates are the exception to the measurer's normal advisory mandate.
- `orchestrator.md` adds the `## Phase: STRATEGIZE` block, reroutes PIVOT → STRATEGIZE (was → PLAN), reroutes PLAN dispatch from `seo-strategist` to `seo-planner-agent`, and adds a Binding Pivot Detection block in MEASURE that runs before any user menu. Critical Rules expanded from 11 to 15.
- `SKILL.md` updated everywhere: state diagram, transitions table, file lifecycle matrix (new STRATEGIZE column + strategy.md row), Auto-Persistence (split AUDIT→STRATEGIZE and STRATEGIZE→PLAN), Mandatory Re-reads, Sub-Agent Architecture (corrected agent inventory), per-state rules (full new STRATEGIZE section, PLAN rewritten to read strategy.md first), references list, 90-day sprint template.
- `bootstrap.mjs` cmdNew now creates `strategy.md` stub with all 8 sections; competitors.md template references the adversarial methodology. cmdResume reports strategy.md presence and shows a migrate-v12 hint when missing.
- `validate-plan.mjs` adds STRATEGIZE to VALID_STATES, recognizes new transitions (AUDIT→STRATEGIZE, STRATEGIZE→PLAN, STRATEGIZE→AUDIT, PLAN→STRATEGIZE, PIVOT→STRATEGIZE), keeps v1.1 transitions for backward compat, and validates strategy.md sections + binding gate presence.
- `Makefile` and `build.ps1` REQUIRED_FILES include `competitive-intelligence.md` and `seo-planner-agent.md`.
- README.md, CLAUDE.md updated for the new state machine. VERSION bumped to 1.2.0 (resolves a pre-existing drift — VERSION had remained at 1.0.0 while CHANGELOG recorded 1.1.0).

### Migration

**For v1.1 sprints in flight**: run `node <skill-path>/scripts/bootstrap.mjs migrate-v12` against the active sprint (or pass an explicit dir path). The subcommand writes a `strategy.md` stub with sections marked `[TODO]`, preserving your v1.1 plan's strategy-flavored sections (SCORE / Target State / Topical Map / Backlink Strategy / Pre-Mortem) as quoted migration hints. Complete the TODOs, then resume normally — the sprint state machine continues at whatever phase it was in.

**For v1.1 sprints not migrated**: `bootstrap.mjs resume` continues to work and shows a migrate-v12 hint in the recovery file list. validate-plan.mjs accepts both v1.1 and v1.2 state transitions, so existing sprints don't fail validation.

**No breaking changes for new sprints** — `bootstrap.mjs new` creates a v1.2 sprint with strategy.md included.

## [1.1.0] - 2026-04-26

### Changed
- All 7 agent prompts rewritten 2-3x more specific with exact checklists and output templates
- validate-plan.mjs: added content quality, cross-file consistency, dependency enforcement, momentum tracking
- bootstrap.mjs: LESSONS.md changed from destructive rewrite to rolling append with trim
- bootstrap.mjs: summary.md existence check before close, backward compatibility fix
- Reference files deepened: keyword research workflow, content brief template, cannibalization framework, outreach email templates, link prospecting workflow, search intent diagnosis, CWV fix recipes, JS SEO checklist, exact SCORE definitions

### Added
- measurement-framework.md: 5-Why root cause analysis, failure classification, convergence scoring
- validate-plan.test.mjs: 40 tests for validation script
- tools.test.mjs: 20 tests for audit tools
- Audit tool fallbacks: static HTML analysis when Lighthouse unavailable, local sitemap file support, page type detection in schema validator

## [1.0.0] - 2026-04-26

### Added
- Core protocol (SKILL.md): 6-state machine (AUDIT → PLAN → EXECUTE → MEASURE → PIVOT → CLOSE)
- SCORE framework evaluation rubric (Site, Content, Outside, Rank, Evaluate)
- 7 sub-agents: orchestrator, seo-auditor, seo-strategist, seo-executor, seo-measurer, seo-reviewer, seo-archivist
- Bootstrap script (bootstrap.mjs): sprint directory management with cross-sprint learning
- Validation script (validate-plan.mjs): protocol compliance checker
- Test suite (bootstrap.test.mjs): comprehensive bootstrap tests
- Reference files:
  - technical-seo.md: Technical SEO checklist (CWV, crawl, schema, mobile)
  - content-strategy.md: Topical maps, pillar-cluster architecture, programmatic SEO
  - backlink-strategy.md: Link building frameworks, digital PR, anchor text
  - on-page-seo.md: 45-point on-page optimization checklist
  - scoring-framework.md: SCORE evaluation rubric and sprint milestones
  - file-formats.md: Templates for all plan directory files
  - geo-optimization.md: Generative Engine Optimization (AI Overviews, Perplexity, ChatGPT citations)
  - local-seo.md: Local SEO (GBP, citations, local schema, map pack)
  - ecommerce-seo.md: E-commerce SEO (product schema, category pages, faceted navigation)
- Cross-sprint learning: FINDINGS.md, DECISIONS.md, LESSONS.md consolidation
- Sliding window: auto-trim consolidated files to 8 most recent sprints
- Per-project persistence: plans/ directory with full audit + strategy history

### Acknowledgements
- Architecture inspired by [Iterative Planner](https://github.com/NikolasMarkou/iterative-planner) by Nikolas Markou
