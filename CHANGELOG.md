# Changelog

All notable changes to this project will be documented in this file.

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
