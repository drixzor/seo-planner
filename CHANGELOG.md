# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — Notes from first real-site test (WorkCyprus)

### Observations (to address in v1.2)
- AUDIT phase worked well with parallel agents — 4 audits completed independently with no conflicts
- Bootstrap plan.md template is too generic for job boards — consider industry-specific templates
- Backlink audit is thin when site has zero backlinks — auditor should auto-expand into "link building strategy" mode
- Content auditor produced excellent 549-line report — the 200-line limit was correctly removed in v1.1
- Competitor audit can't access live competitor sites — should document this limitation more clearly in the agent prompt
- PLAN phase requires reading ALL 4 audit files + cross-referencing — context window gets large. Consider having strategist agent summarize findings first
- Missing: GA4/GSC setup instructions in reference files — the "Evaluate Results" dimension of SCORE has no reference guide for implementation
- Missing: programmatic SEO specific reference for generating city+category combo pages in Next.js/React frameworks

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
