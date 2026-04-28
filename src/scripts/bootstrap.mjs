#!/usr/bin/env node
// SEO Planner — Bootstrap and manage SEO sprint directories under plans/ in the current working directory.
//
// Usage:
//   node bootstrap.mjs "goal"                  Create a new sprint (backward-compatible)
//   node bootstrap.mjs new "goal"              Create a new sprint
//   node bootstrap.mjs new --force "goal"      Close active sprint and create a new one
//   node bootstrap.mjs resume                  Output current sprint state for re-entry
//   node bootstrap.mjs status                  One-line state summary
//   node bootstrap.mjs close                   Close active sprint (preserves directory)
//   node bootstrap.mjs list                    Show all sprint directories (active and closed)
//   node bootstrap.mjs migrate-v12 [dir]       Backfill strategy.md stub for v1.1 sprint (uses current pointer if [dir] omitted)
//
// Creates plans/plan_YYYY-MM-DD_XXXXXXXX/ (date + 8-char hex seed) in cwd.
// Writes plans/.current_plan with the directory name for discovery.
// Requires Node.js 18+.

import { mkdirSync, writeFileSync, readFileSync, readdirSync, renameSync, unlinkSync, existsSync, rmSync, copyFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

const cwd = process.cwd();
const plansDir = join(cwd, "plans");
const pointerFile = join(plansDir, ".current_plan");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureGitignore() {
  const gitignorePath = join(cwd, ".gitignore");
  const patterns = ["plans/"];
  let content = "";
  try {
    content = readFileSync(gitignorePath, "utf-8");
  } catch { /* No .gitignore yet */ }
  const missing = patterns.filter((p) => !content.split("\n").some((line) => line.trim() === p));
  if (missing.length === 0) return;
  const suffix = (content && !content.endsWith("\n") ? "\n" : "") + missing.join("\n") + "\n";
  writeFileSync(gitignorePath + ".tmp", content + suffix);
  renameSync(gitignorePath + ".tmp", gitignorePath);
}

function readPointer() {
  try {
    const name = readFileSync(pointerFile, "utf-8").trim();
    if (name && existsSync(join(plansDir, name))) return name;
    return null;
  } catch { return null; }
}

function readPlanFile(planDirName, filename) {
  try { return readFileSync(join(plansDir, planDirName, filename), "utf-8"); } catch { return null; }
}

function extractField(content, pattern) {
  if (!content) return null;
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function ensureConsolidatedFiles() {
  const findingsPath = join(plansDir, "FINDINGS.md");
  const decisionsPath = join(plansDir, "DECISIONS.md");
  const lessonsPath = join(plansDir, "LESSONS.md");
  if (!existsSync(findingsPath)) {
    writeFileSync(findingsPath, `# Consolidated SEO Findings\n*Cross-sprint audit findings archive. Entries merged from per-sprint findings.md on close. Newest first.*\n`);
  }
  if (!existsSync(decisionsPath)) {
    writeFileSync(decisionsPath, `# Consolidated SEO Decisions\n*Cross-sprint decision archive. Entries merged from per-sprint decisions.md on close. Newest first.*\n`);
  }
  if (!existsSync(lessonsPath)) {
    writeFileSync(lessonsPath, `# SEO Lessons Learned\n*Cross-sprint lessons. Updated and consolidated on close. Max 200 lines — rewrite, don't append forever.*\n*Read before any PLAN state. This is institutional memory about what works for this site.*\n`);
  }
  const indexPath = join(plansDir, "INDEX.md");
  if (!existsSync(indexPath)) {
    writeFileSync(indexPath, `# SEO Sprint Index\n*Sprint-to-directory mapping. Updated on close.*\n\n| Sprint | Date | Goal | Key Topics |\n|--------|------|------|------------|\n`);
  }
}

const CONSOLIDATED_COMPRESS_THRESHOLD = 500;
const MAX_CONSOLIDATED_PLANS = 8;
const COMPRESSED_SUMMARY_OPEN = "<!-- COMPRESSED-SUMMARY -->";
const COMPRESSED_SUMMARY_CLOSE = "<!-- /COMPRESSED-SUMMARY -->";

function prependToConsolidated(filePath, planDirName, newSection) {
  let existing = "";
  try { existing = readFileSync(filePath, "utf-8"); } catch {}
  if (existing.includes(`\n## ${planDirName}\n`)) return;
  const closeMarker = existing.indexOf(COMPRESSED_SUMMARY_CLOSE);
  const searchFrom = closeMarker >= 0 ? existing.indexOf("\n", closeMarker + COMPRESSED_SUMMARY_CLOSE.length) : 0;
  const firstH2 = searchFrom >= 0 ? existing.indexOf("\n## ", searchFrom) : -1;
  let header, body;
  if (firstH2 >= 0) { header = existing.slice(0, firstH2).trimEnd(); body = existing.slice(firstH2); }
  else { header = existing.trimEnd(); body = ""; }
  const merged = header + `\n\n## ${planDirName}\n${newSection}\n` + body;
  writeFileSync(filePath + ".tmp", merged);
  renameSync(filePath + ".tmp", filePath);
}

function stripHeader(content) {
  const firstH2 = content.search(/^## /m);
  return firstH2 >= 0 ? content.slice(firstH2) : "";
}

function stripCrossPlanNote(content) {
  return content.replace(/\n?\*Cross-sprint context:[^*]*\*\n?/g, "\n");
}

function checkConsolidatedSize(filePath, label) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    if (lineCount > CONSOLIDATED_COMPRESS_THRESHOLD) {
      const hasSummary = content.includes(COMPRESSED_SUMMARY_OPEN);
      console.log(`  ACTION NEEDED: ${label} is ${lineCount} lines (>${CONSOLIDATED_COMPRESS_THRESHOLD}). ${hasSummary ? "Update" : "Create"} compressed summary.`);
    }
  } catch {}
}

function trimConsolidatedWindow(filePath) {
  let content;
  try { content = readFileSync(filePath, "utf-8"); } catch { return; }
  const positions = [];
  const re = /\n## plan_/g;
  let match;
  while ((match = re.exec(content)) !== null) positions.push(match.index);
  if (positions.length <= MAX_CONSOLIDATED_PLANS) return;
  const cutoff = positions[MAX_CONSOLIDATED_PLANS];
  writeFileSync(filePath + ".tmp", content.slice(0, cutoff).trimEnd() + "\n");
  renameSync(filePath + ".tmp", filePath);
}

function mergeToConsolidated(planDirName) {
  const findingsContent = readPlanFile(planDirName, "findings.md");
  if (findingsContent) {
    let stripped = stripCrossPlanNote(stripHeader(findingsContent));
    stripped = stripped.replace(/^## /gm, "### ");
    stripped = stripped.replace(/\(findings\//g, `(${planDirName}/findings/`);
    stripped = stripped.replace(/\(audit\//g, `(${planDirName}/audit/`);
    stripped = stripped.trim();
    if (stripped) prependToConsolidated(join(plansDir, "FINDINGS.md"), planDirName, stripped);
  }
  const decisionsContent = readPlanFile(planDirName, "decisions.md");
  if (decisionsContent) {
    let stripped = stripCrossPlanNote(stripHeader(decisionsContent));
    stripped = stripped.replace(/^## /gm, "### ");
    stripped = stripped.trim();
    if (stripped) prependToConsolidated(join(plansDir, "DECISIONS.md"), planDirName, stripped);
  }
}

function appendToIndex(planDirName) {
  const indexPath = join(plansDir, "INDEX.md");
  ensureConsolidatedFiles();
  let existing = "";
  try { existing = readFileSync(indexPath, "utf-8"); } catch {}
  if (existing.includes(`| ${planDirName} |`)) return;
  const plan = readPlanFile(planDirName, "plan.md");
  const goal = extractField(plan, /\n## Goal\s*\n([\s\S]+?)(?=\n## |$)/) || "No goal";
  const goalOneLine = goal.split("\n")[0].slice(0, 60);
  const dateMatch = planDirName.match(/plan_(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : "unknown";
  const findings = readPlanFile(planDirName, "findings.md");
  let topics = "";
  if (findings) {
    const indexStart = findings.indexOf("\n## Index");
    if (indexStart >= 0) {
      const afterIndex = findings.indexOf("\n## ", indexStart + 1);
      const indexBody = afterIndex >= 0 ? findings.slice(indexStart, afterIndex) : findings.slice(indexStart);
      const topicMatches = indexBody.match(/\[([^\]]+)\]/g);
      if (topicMatches) topics = topicMatches.slice(0, 3).map((t) => t.replace(/[[\]]/g, "").toLowerCase()).join(", ");
    }
  }
  const safeGoal = goalOneLine.replace(/\|/g, "\\|");
  const row = `| ${planDirName} | ${date} | ${safeGoal} | ${topics} |\n`;
  writeFileSync(indexPath + ".tmp", existing.trimEnd() + "\n" + row);
  renameSync(indexPath + ".tmp", indexPath);
}

function snapshotLessons(planDirName) {
  const lessonsPath = join(plansDir, "LESSONS.md");
  const snapshotPath = join(plansDir, planDirName, "lessons_snapshot.md");
  try { if (existsSync(lessonsPath)) copyFileSync(lessonsPath, snapshotPath); } catch {}
}

function trimLessons() {
  const lessonsPath = join(plansDir, "LESSONS.md");
  let content;
  try { content = readFileSync(lessonsPath, "utf-8"); } catch { return; }
  const lines = content.split("\n");
  if (lines.length <= 200) return;
  // Keep the newest 200 lines (trim from the bottom = oldest entries removed).
  // Since LESSONS.md is newest-first, the bottom is the oldest.
  const trimmed = lines.slice(0, 200);
  // Ensure it ends with a newline
  const result = trimmed.join("\n") + (trimmed[trimmed.length - 1] === "" ? "" : "\n");
  writeFileSync(lessonsPath + ".tmp", result);
  renameSync(lessonsPath + ".tmp", lessonsPath);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdNew(goal, force) {
  mkdirSync(plansDir, { recursive: true });

  const existing = readPointer();
  if (existing && !force) {
    console.error(`ERROR: Active sprint exists: plans/${existing}`);
    console.error(`  To resume:   node ${process.argv[1]} resume`);
    console.error(`  To close:    node ${process.argv[1]} close`);
    console.error(`  To force:    node ${process.argv[1]} new --force "goal"`);
    process.exit(1);
  }
  if (existing && force) cmdClose({ silent: true });
  const previousPlan = force ? existing : null;

  const now = new Date();
  const timestamp = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const dateStr = now.toISOString().slice(0, 10);
  const hexStr = randomBytes(4).toString("hex");
  const planDirName = `plan_${dateStr}_${hexStr}`;
  const planDir = join(plansDir, planDirName);

  const hasConsolidated = existsSync(join(plansDir, "FINDINGS.md")) || existsSync(join(plansDir, "LESSONS.md"));
  const crossNote = hasConsolidated ? "\n*Cross-sprint context: see plans/FINDINGS.md, plans/DECISIONS.md, and plans/LESSONS.md*\n" : "";

  try {
    mkdirSync(join(planDir, "checkpoints"), { recursive: true });
    mkdirSync(join(planDir, "findings"), { recursive: true });
    mkdirSync(join(planDir, "audit"), { recursive: true });

    writeFileSync(join(planDir, "state.md"), `# Current State: AUDIT
## Iteration: 0
## Current Step: N/A
## Pre-Step Checklist (reset before each EXECUTE step)
- [ ] Re-read state.md (this file)
- [ ] Re-read plan.md
- [ ] Re-read progress.md
- [ ] Re-read decisions.md (if fix attempt)
- [ ] Checkpoint created (if risky step)
## Fix Attempts (resets per step)
- (none yet)
## Change Manifest (current sprint)
- (no changes yet)
## Last Transition: INIT → AUDIT (${timestamp})
## Transition History:
- INIT → AUDIT (SEO sprint started)
`);

    writeFileSync(join(planDir, "plan.md"), `# SEO Sprint Plan v0

## Goal
${goal}

## Current State Assessment
*To be populated from AUDIT findings. Technical health, content gaps, backlink profile, competitor landscape.*

## Target State
*Where we want to be at end of sprint. Traffic targets, ranking goals, conversion improvements.*

## Topical Map
*Content architecture. Pillar pages → content clusters → internal linking map.*

## Content Calendar
*What to create/update, in what order, with deadlines.*

| Priority | Type | Topic/Keyword | Intent | Status | Deadline |
|----------|------|---------------|--------|--------|----------|
| *To be populated during PLAN* | | | | | |

## Technical Fix Priority List
*Ordered by impact. From AUDIT/technical findings.*

| Priority | Issue | Impact | Effort | Status |
|----------|-------|--------|--------|--------|
| *To be populated during PLAN* | | | | |

## Internal Linking Architecture
*Hub-spoke structure, orphan pages, link equity flow.*

## Backlink Strategy
*Link building approach for this sprint. Tactics, targets, timeline.*

## KPI Targets
| Metric | Baseline | 30-Day Target | 60-Day Target | 90-Day Target |
|--------|----------|---------------|---------------|---------------|
| Organic Traffic | | | | |
| Indexed Pages | | | | |
| Avg Position | | | | |
| Domain Rating | | | | |
| Core Web Vitals | | | | |

## Steps
*Ordered execution plan. Annotate each with [RISK: low/medium/high] and [deps: N,M] for dependencies. Executor will enforce these.*

## Assumptions
*What you assume, which finding grounds it, which steps depend on it.*

## Failure Modes
*What if: content doesn't rank? Technical fixes break something? Link building fails?*

## Pre-Mortem & Falsification Signals
*Assume sprint failed — 2-3 scenarios with concrete STOP IF triggers.*

## Success Criteria
*Testable criteria for this sprint.*

## Verification Strategy
*For each success criterion: what to check, how to measure, what "pass" means.*

## Resource Requirements
*Time, tools, budget, content writers, etc.*

## Complexity Budget
- Pages created: 0/target
- Technical fixes: 0/target
- Backlinks acquired: 0/target
`);

    writeFileSync(join(planDir, "decisions.md"), `# SEO Decision Log\n*Append-only. Never edit past entries.*\n${crossNote}`);

    writeFileSync(join(planDir, "findings.md"), `# SEO Audit Findings\n*Summary and index of all audit findings. Detailed reports in audit/ and findings/ directories.*\n${crossNote}
## Index
*To be populated during AUDIT.*

## Audit Reports
- [ ] [Technical Audit](audit/technical.md)
- [ ] [Content Audit](audit/content.md)
- [ ] [Backlink Audit](audit/backlinks.md)
- [ ] [Competitor Audit](audit/competitors.md)

## Key Constraints
*Classified as HARD (non-negotiable), SOFT (preferences), or GHOST (no longer apply).*
`);

    writeFileSync(join(planDir, "progress.md"), `# SEO Sprint Progress

## Completed
*Nothing yet.*

## In Progress
- [ ] AUDIT: Technical audit
- [ ] AUDIT: Content audit
- [ ] AUDIT: Backlink audit
- [ ] AUDIT: Competitor analysis

## Remaining
*To be populated from plan.md after PLAN phase.*

## Blocked
*Nothing currently.*
`);

    writeFileSync(join(planDir, "verification.md"), `# SEO Verification Results
*Populated during PLAN (template), updated during EXECUTE (per-step), completed during MEASURE (full evaluation).*

## Technical SEO Checks
| # | Check | Target | Current | Result | Evidence |
|---|-------|--------|---------|--------|----------|
| 1 | Lighthouse Performance | ≥90 | PENDING | PENDING | - |
| 2 | Lighthouse SEO | ≥90 | PENDING | PENDING | - |
| 3 | Core Web Vitals (LCP) | <2.5s | PENDING | PENDING | - |
| 4 | Core Web Vitals (CLS) | <0.1 | PENDING | PENDING | - |
| 5 | Mobile Usability | Pass | PENDING | PENDING | - |
| 6 | Crawl Errors | 0 | PENDING | PENDING | - |
| 7 | XML Sitemap | Valid | PENDING | PENDING | - |
| 8 | robots.txt | Correct | PENDING | PENDING | - |
| 9 | Schema Markup | Valid | PENDING | PENDING | - |
| 10 | HTTPS/SSL | Active | PENDING | PENDING | - |

## Content Checks
| # | Check | Target | Current | Result | Evidence |
|---|-------|--------|---------|--------|----------|
| 1 | Topical Map Coverage | 100% | PENDING | PENDING | - |
| 2 | Pillar Pages Created | per plan | PENDING | PENDING | - |
| 3 | Cluster Articles | per plan | PENDING | PENDING | - |
| 4 | Internal Links/Page | ≥3 | PENDING | PENDING | - |
| 5 | Orphan Pages | 0 | PENDING | PENDING | - |
| 6 | Keyword Targeting | per brief | PENDING | PENDING | - |
| 7 | Search Intent Match | per brief | PENDING | PENDING | - |

## Rankings & Traffic
| # | Metric | Baseline | Current | Target | Result |
|---|--------|----------|---------|--------|--------|
| 1 | Organic Sessions/mo | PENDING | PENDING | PENDING | PENDING |
| 2 | Indexed Pages | PENDING | PENDING | PENDING | PENDING |
| 3 | Avg Position | PENDING | PENDING | PENDING | PENDING |
| 4 | CTR | PENDING | PENDING | PENDING | PENDING |
| 5 | Top 10 Keywords | PENDING | PENDING | PENDING | PENDING |

## Backlink Profile
| # | Metric | Baseline | Current | Target | Result |
|---|--------|----------|---------|--------|--------|
| 1 | Domain Rating | PENDING | PENDING | PENDING | PENDING |
| 2 | Referring Domains | PENDING | PENDING | PENDING | PENDING |
| 3 | Backlinks Total | PENDING | PENDING | PENDING | PENDING |

## Not Verified
| What | Why |
|------|-----|
| *To be populated during MEASURE* | - |

## Convergence Metrics
*Sprint 2+. First sprint: write "N/A — first sprint."*

| Metric | Previous | Current | Delta |
|--------|----------|---------|-------|
| Rankings improved | - | - | - |
| Traffic growth % | - | - | - |
| Content published | - | - | - |
| Technical fixes | - | - | - |
| **Sprint score** | - | - | - |

## Verdict
*To be completed during MEASURE.*
`);

    // SEO-specific audit templates
    writeFileSync(join(planDir, "audit", "technical.md"), `# Technical SEO Audit\n*Run during AUDIT state. Classify issues as CRITICAL/HIGH/MEDIUM/LOW.*\n\n## Page Speed\n*Lighthouse scores, Core Web Vitals*\n\n## Mobile\n*Responsiveness, tap targets, font sizes*\n\n## Crawlability\n*robots.txt, XML sitemap, crawl budget*\n\n## Indexation\n*Canonicals, noindex, indexed vs submitted*\n\n## Schema Markup\n*Structured data validation*\n\n## Site Architecture\n*URL structure, breadcrumbs, pagination*\n\n## Security\n*HTTPS, mixed content*\n\n## Issues Found\n| # | Issue | Severity | Impact | Fix Effort |\n|---|-------|----------|--------|------------|\n`);

    writeFileSync(join(planDir, "audit", "content.md"), `# Content SEO Audit\n*Run during AUDIT state.*\n\n## Existing Content Inventory\n*Pages, word count, keywords, last updated*\n\n## Content Gaps\n*Topics competitors cover that we don't*\n\n## Keyword Coverage\n*Target keywords vs current rankings*\n\n## Search Intent Alignment\n*Are pages matching user intent?*\n\n## Internal Linking\n*Link structure, orphan pages, hub pages*\n\n## Content Quality\n*E-E-A-T signals, depth, freshness*\n\n## Issues Found\n| # | Issue | Severity | Impact | Fix Effort |\n|---|-------|----------|--------|------------|\n`);

    writeFileSync(join(planDir, "audit", "backlinks.md"), `# Backlink Audit\n*Run during AUDIT state.*\n\n## Current Profile\n*Domain Rating, referring domains, backlink count*\n\n## Link Quality\n*DR distribution, follow/nofollow ratio, anchor text*\n\n## Toxic Links\n*Spammy referring domains*\n\n## Competitor Comparison\n*Our profile vs top 3 competitors*\n\n## Link Gap\n*Sites linking to competitors but not us*\n\n## Opportunities\n*Low-hanging fruit for link acquisition*\n\n## Issues Found\n| # | Issue | Severity | Impact | Fix Effort |\n|---|-------|----------|--------|------------|\n`);

    writeFileSync(join(planDir, "audit", "competitors.md"), `# Competitor Analysis\n*Run during AUDIT state. Adversarial 8-item checklist per competitor with evidence tier labels (confirmed/inferred/estimated). See references/competitive-intelligence.md for methodology.*\n\n## Competitors Identified\n| # | Domain | DR | Traffic | Top Keywords |\n|---|--------|----|---------|--------------|\n\n## Per-Competitor Adversarial Audit\n*For each top-3 competitor, run all 8 checks (sitemap classification, traffic-per-page, dead-page detection, failed templates, anchor profile, SERP feature ownership, moat quantification, what-we-have-they-don't). Every numeric claim gets confirmed/inferred/estimated label.*\n\n## Synthesis\n*The wedge, no-compete moats, niche-fail patterns, our exploitable advantages, replicable wins. Strategist (in STRATEGIZE phase) reads this section directly.*\n`);

    writeFileSync(join(planDir, "strategy.md"), `# SEO Strategy\n*Authored by seo-strategist during STRATEGIZE phase. Every claim cites an audit finding. No template fallback.*\n\n## 1. Wedge Thesis\n*One paragraph, three sentences max. Where in this niche we attack, why now, why us. Cite findings.*\n\n## 2. SCORE Assessment\n| Dimension | Score (1-10) | Key Evidence (cited) |\n|-----------|-------------|----------------------|\n| **S**ite Optimization | | |\n| **C**ontent Production | | |\n| **O**utside Signals | | |\n| **R**ank Enhancement | | |\n| **E**valuate Results | | |\n| **Total** | /50 | |\n\n## 3. Adversarial Competitor Synthesis\n*Per-competitor paragraph: their moat, weakness, failed templates, relevance to our wedge.*\n\n## 4. Moat Analysis\n*Theirs (with time-to-match) and ours (top 5 unfair advantages with replication time).*\n\n## 5. Programmatic Volume Decision\n*Choose exactly one: Decision A: Zero programmatic | Decision B: Bounded with measurement gate | Decision C: Aggressive with gate. Cite at least one audit finding.*\n\n## 6. KD Gating Decision\n*Per-DR-band keyword difficulty thresholds with rationale.*\n\n## 7. Channel Bets\n| Channel | Bet | Rationale (cite audit finding) |\n|---------|-----|-------------------------------|\n| Programmatic content | commit / bounded / ignore | |\n| Editorial content (depth) | commit / ignore | |\n| Directory submission | commit / ignore | |\n| Digital PR | commit / ignore | |\n| Partnerships / integrations | commit / ignore | |\n| GBP / local | commit / ignore | |\n| Schema / SERP feature targeting | commit / ignore | |\n\n## 8. Strategy Gates (binding falsification signals)\n*3-7 rows. At least one with Mandated action: PIVOT. The measurer evaluates these and triggers binding state transitions on failure.*\n\n| Gate ID | Signal | Threshold | Measurement window | Status | Mandated action on FAIL |\n|---------|--------|-----------|--------------------|--------|------------------------ |\n| G-1 | | | | PENDING | |\n`);

    ensureConsolidatedFiles();

    writeFileSync(pointerFile + ".tmp", planDirName);
    renameSync(pointerFile + ".tmp", pointerFile);
  } catch (err) {
    try { rmSync(planDir, { recursive: true, force: true }); } catch {}
    try { if (existsSync(pointerFile + ".tmp")) unlinkSync(pointerFile + ".tmp"); } catch {}
    if (previousPlan) {
      try { writeFileSync(pointerFile, previousPlan); } catch {}
    }
    console.error(`ERROR: Failed to create sprint: ${err.message}`);
    process.exit(1);
  }

  try { ensureGitignore(); } catch (err) {
    console.error(`WARNING: Sprint created but .gitignore update failed. Manually add plans/`);
  }

  console.log(`Initialized SEO Sprint: plans/${planDirName}/`);
  console.log(`  Pointer: plans/.current_plan → ${planDirName}`);
  console.log(`  Goal: ${goal}`);
  console.log(`  State: AUDIT (iteration 0)`);
  console.log(`  Cross-sprint context: plans/FINDINGS.md, plans/DECISIONS.md, plans/LESSONS.md`);
  console.log(`  Next: Run technical, content, backlink, and competitor audits.`);
}

function cmdResume() {
  const planDirName = readPointer();
  if (!planDirName) { console.error("ERROR: No active sprint. Use `new` to create one."); process.exit(1); }

  const state = readPlanFile(planDirName, "state.md");
  const plan = readPlanFile(planDirName, "plan.md");
  const progress = readPlanFile(planDirName, "progress.md");
  const decisions = readPlanFile(planDirName, "decisions.md");

  const currentState = extractField(state, /^# Current State:\s*(.+)$/m) || "UNKNOWN";
  const iteration = extractField(state, /^## Iteration:\s*(.+)$/m) || "?";
  const step = extractField(state, /^## Current Step:\s*(.+)$/m) || "N/A";
  const lastTransition = extractField(state, /^## Last Transition:\s*(.+)$/m) || "?";
  const goal = extractField(plan, /\n## Goal\s*\n([\s\S]+?)(?=\n## |$)/) || "No goal found";

  console.log(`Resuming SEO Sprint: plans/${planDirName}/`);
  console.log(`  State:      ${currentState}`);
  console.log(`  Iteration:  ${iteration}`);
  console.log(`  Step:       ${step}`);
  console.log(`  Goal:       ${goal.split("\n")[0]}`);
  console.log(`  Last:       ${lastTransition}`);
  console.log();

  if (progress) {
    const completed = (progress.match(/^- \[x\].+$/gm) || []).length;
    const remaining = (progress.match(/^- \[ \].+$/gm) || []).length;
    console.log(`  Progress:   ${completed} done, ${remaining} remaining`);
  }
  if (decisions) {
    const decisionCount = (decisions.match(/^## D-\d+/gm) || []).length;
    if (decisionCount > 0) console.log(`  Decisions:  ${decisionCount} logged`);
  }

  console.log();
  console.log(`  Recovery files:`);
  console.log(`    state.md       → plans/${planDirName}/state.md`);
  const strategyExists = existsSync(join(plansDir, planDirName, "strategy.md"));
  console.log(`    strategy.md    → plans/${planDirName}/strategy.md${strategyExists ? "" : " (missing — v1.1 sprint? run `migrate-v12` to backfill)"}`);
  console.log(`    plan.md        → plans/${planDirName}/plan.md`);
  console.log(`    decisions.md   → plans/${planDirName}/decisions.md`);
  console.log(`    progress.md    → plans/${planDirName}/progress.md`);
  console.log(`    findings.md    → plans/${planDirName}/findings.md`);
  console.log(`    verification.md → plans/${planDirName}/verification.md`);
  console.log(`    audit/         → plans/${planDirName}/audit/`);
  console.log();
  console.log(`  Consolidated context:`);
  console.log(`    plans/FINDINGS.md  — cross-sprint SEO findings`);
  console.log(`    plans/DECISIONS.md — cross-sprint SEO decisions`);
  console.log(`    plans/LESSONS.md   — what works for this site`);
}

function cmdStatus() {
  const planDirName = readPointer();
  if (!planDirName) { console.log("No active SEO sprint."); process.exit(0); }
  const state = readPlanFile(planDirName, "state.md");
  const plan = readPlanFile(planDirName, "plan.md");
  const currentState = extractField(state, /^# Current State:\s*(.+)$/m) || "UNKNOWN";
  const iteration = extractField(state, /^## Iteration:\s*(.+)$/m) || "?";
  const step = extractField(state, /^## Current Step:\s*(.+)$/m) || "N/A";
  const goal = extractField(plan, /\n## Goal\s*\n([\s\S]+?)(?=\n## |$)/) || "?";
  console.log(`[${currentState}] sprint=${iteration} step=${step} | ${goal.split("\n")[0].slice(0, 60)} | plans/${planDirName}`);
}

function cmdClose(opts = {}) {
  const planDirName = readPointer();
  if (!planDirName) { if (!opts.silent) { console.error("ERROR: No active sprint to close."); process.exit(1); } return; }

  try {
    const statePath = join(plansDir, planDirName, "state.md");
    const stateContent = readFileSync(statePath, "utf-8");
    const prevState = stateContent.match(/^# Current State:\s*(.+)$/m)?.[1] || "UNKNOWN";
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const updated = stateContent
      .replace(/^# Current State:\s*.+$/m, "# Current State: CLOSE")
      .replace(/^## Last Transition:\s*.+$/m, `## Last Transition: ${prevState} → CLOSE (${timestamp})`)
      + `${stateContent.endsWith("\n") ? "" : "\n"}- ${prevState} → CLOSE (sprint closed)\n`;
    writeFileSync(statePath, updated);
  } catch (err) {
    if (!opts.silent && err.code !== "ENOENT") console.error(`WARNING: state.md update failed: ${err.message}`);
  }

  try {
    ensureConsolidatedFiles();
    mergeToConsolidated(planDirName);
    trimConsolidatedWindow(join(plansDir, "FINDINGS.md"));
    trimConsolidatedWindow(join(plansDir, "DECISIONS.md"));
    checkConsolidatedSize(join(plansDir, "FINDINGS.md"), "plans/FINDINGS.md");
    checkConsolidatedSize(join(plansDir, "DECISIONS.md"), "plans/DECISIONS.md");
  } catch (err) {
    if (!opts.silent) console.error(`WARNING: Merge failed: ${err.message}. Per-sprint files remain at plans/${planDirName}/`);
  }

  try { appendToIndex(planDirName); } catch {}
  try { snapshotLessons(planDirName); } catch {}
  try { trimLessons(); } catch {}

  // Check for summary.md before removing pointer
  const summaryPath = join(plansDir, planDirName, "summary.md");
  if (!existsSync(summaryPath) && !opts.silent) {
    console.log(`WARNING: summary.md not found. The CLOSE protocol requires writing summary.md before running bootstrap close.`);
  }

  try { unlinkSync(pointerFile); } catch {}

  if (!opts.silent) {
    console.log(`Closed SEO Sprint: plans/${planDirName}`);
    console.log(`  Pointer removed. Directory preserved.`);
    console.log(`  Findings/decisions merged to consolidated files.`);
    console.log(`  Update plans/LESSONS.md with what worked for this site.`);
  } else {
    console.log(`  Closed previous sprint: plans/${planDirName}`);
  }
}

function cmdMigrateV12(targetPath) {
  // Resolve target sprint directory
  let planDirName;
  if (targetPath) {
    // Strip "plans/" prefix if present
    const cleaned = targetPath.replace(/^plans\//, "").replace(/\/$/, "");
    if (!existsSync(join(plansDir, cleaned))) {
      console.error(`ERROR: No sprint directory at plans/${cleaned}/`);
      process.exit(1);
    }
    planDirName = cleaned;
  } else {
    planDirName = readPointer();
    if (!planDirName) {
      console.error("ERROR: No active sprint and no path supplied. Usage: migrate-v12 [path]");
      process.exit(1);
    }
  }

  const planDir = join(plansDir, planDirName);
  const strategyPath = join(planDir, "strategy.md");

  if (existsSync(strategyPath)) {
    console.log(`strategy.md already exists at plans/${planDirName}/strategy.md — nothing to migrate.`);
    process.exit(0);
  }

  const planContent = readPlanFile(planDirName, "plan.md");
  if (!planContent) {
    console.error(`ERROR: plans/${planDirName}/plan.md not found. Cannot migrate without v1.1 plan.md.`);
    process.exit(1);
  }

  // Extract relevant sections from v1.1 plan.md
  function section(name) {
    const re = new RegExp(`\\n## ${name}\\s*\\n([\\s\\S]+?)(?=\\n## |$)`);
    const m = planContent.match(re);
    return m ? m[1].trim() : null;
  }

  const currentState = section("Current State Assessment");
  const targetState = section("Target State");
  const topicalMap = section("Topical Map");
  const backlinkStrategy = section("Backlink Strategy");
  const preMortem = section("Pre-Mortem & Falsification Signals");

  // Build strategy.md from extracted sections + TODOs for missing pieces
  const missingNotes = [];
  if (!currentState) missingNotes.push("SCORE Assessment (could not extract — fill in manually from audit/technical.md)");
  if (!topicalMap) missingNotes.push("Wedge Thesis (no Topical Map found in v1.1 plan — derive from audit/competitors.md)");
  if (!preMortem) missingNotes.push("Strategy Gates (no Pre-Mortem section in v1.1 plan — author 3-7 binding gates from scratch)");

  let strategyContent = `# SEO Strategy
*MIGRATED from v1.1 sprint plans/${planDirName}/plan.md on ${new Date().toISOString().slice(0, 10)}.*
*This is a STUB. Sections marked [TODO] need manual completion before resuming the sprint at STRATEGIZE phase.*
${missingNotes.length > 0 ? "\n*Could not auto-extract: " + missingNotes.join("; ") + ".*\n" : ""}

## 1. Wedge Thesis
[TODO] One paragraph, three sentences max. Where in this niche we attack, why now, why us. Cite findings from audit/.

${topicalMap ? `*Migration hint — v1.1 topical map (use as input to wedge derivation):*\n\`\`\`\n${topicalMap}\n\`\`\`\n` : ""}
## 2. SCORE Assessment
${currentState ? `*Migrated from v1.1 plan.md → Current State Assessment. Verify scores match audit findings.*\n\n${currentState}\n` : "[TODO] Score 1-10 per dimension with cited audit evidence.\n"}

## 3. Adversarial Competitor Synthesis
[TODO] Per-competitor paragraph from audit/competitors.md. v1.2 expects evidence tier labels (confirmed/inferred/estimated) — if your audit doesn't have them, run a fresh adversarial competitor audit before completing this section.

## 4. Moat Analysis
[TODO] Theirs (with time-to-match) and ours (top 5 unfair advantages with replication time). See references/competitive-intelligence.md §8.

## 5. Programmatic Volume Decision
[TODO] Choose exactly one: Decision A: Zero programmatic | Decision B: Bounded with gate | Decision C: Aggressive with gate. Cite audit finding.

${targetState ? `*Migration hint — v1.1 target state (may inform programmatic volume reasoning):*\n\`\`\`\n${targetState}\n\`\`\`\n` : ""}
## 6. KD Gating Decision
[TODO] Per-DR-band keyword difficulty thresholds with rationale.

## 7. Channel Bets
[TODO] Commit / ignore decisions per channel with rationale citing audit findings.

${backlinkStrategy ? `*Migration hint — v1.1 backlink strategy (informs channel bets):*\n\`\`\`\n${backlinkStrategy}\n\`\`\`\n` : ""}
## 8. Strategy Gates (binding falsification signals)
[TODO] 3-7 rows. At least one with Mandated action: PIVOT.

${preMortem ? `*Migration hint — v1.1 STOP IF prose (translate each into a structured gate row):*\n\`\`\`\n${preMortem}\n\`\`\`\n` : ""}
| Gate ID | Signal | Threshold | Measurement window | Status | Mandated action on FAIL |
|---------|--------|-----------|--------------------|--------|------------------------ |
| G-1 | | | | PENDING | |
`;

  writeFileSync(strategyPath, strategyContent);

  console.log(`Migrated to v1.2: plans/${planDirName}/strategy.md`);
  console.log(`  Source:  plans/${planDirName}/plan.md (v1.1 sprint)`);
  console.log(`  Status:  STUB — sections marked [TODO] need manual completion`);
  if (missingNotes.length > 0) {
    console.log(`  Could not auto-extract:`);
    for (const note of missingNotes) console.log(`    - ${note}`);
  }
  console.log(`  Next:    Open strategy.md, complete [TODO] sections, then resume at STRATEGIZE phase.`);
}

function cmdList() {
  if (!existsSync(plansDir)) { console.log("No plans/ directory found."); process.exit(0); }
  const activeName = readPointer();
  const entries = readdirSync(plansDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("plan_")).map((d) => d.name).sort();
  if (entries.length === 0) { console.log("No sprint directories found."); process.exit(0); }
  console.log(`SEO Sprints (${entries.length} total):`);
  for (const name of entries) {
    const marker = name === activeName ? " ← active" : "";
    const state = readPlanFile(name, "state.md");
    const plan = readPlanFile(name, "plan.md");
    const currentState = extractField(state, /^# Current State:\s*(.+)$/m) || "?";
    const goal = extractField(plan, /\n## Goal\s*\n([\s\S]+?)(?=\n## |$)/) || "?";
    console.log(`  ${name}  [${currentState}] ${goal.split("\n")[0].slice(0, 60)}${marker}`);
  }
}

function printUsage() {
  console.log(`SEO Planner — Sprint Management

Usage: node bootstrap.mjs <command> [options]

Commands:
  new "goal"              Start a new SEO sprint
  new --force "goal"      Close active sprint and start new one
  resume                  Resume current sprint (re-entry after context loss)
  status                  One-line sprint status
  close                   Close active sprint (preserves data)
  list                    Show all sprints
  migrate-v12 [path]      Backfill strategy.md stub for v1.1 sprint (uses current pointer if path omitted)

Example:
  node bootstrap.mjs new "Optimize acme.com for SaaS keywords — target 50K organic visits/mo"
  node bootstrap.mjs migrate-v12 plans/plan_2026-04-26_abc123ef`);
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const subcommands = new Set(["new", "resume", "status", "close", "list", "migrate-v12", "help"]);
if (args.length === 0) { printUsage(); process.exit(0); }
const cmd = args[0];
function looksLikeGoal(text) {
  // A goal should contain a space or be longer than 10 chars.
  // Single words that match subcommands or flags are not goals.
  if (subcommands.has(text)) return false;
  if (text.startsWith("-")) return false;
  return text.includes(" ") || text.length > 10;
}
if (!subcommands.has(cmd)) {
  if (cmd.startsWith("-")) { console.error(`ERROR: Unknown flag "${cmd}".`); process.exit(1); }
  if (!looksLikeGoal(args.join(" "))) {
    console.error(`ERROR: Unknown command "${cmd}". Run with no arguments for usage.`);
    process.exit(1);
  }
  cmdNew(args.join(" ") || "No goal specified", false);
} else if (cmd === "new") {
  const force = args.includes("--force");
  const goalArgs = args.slice(1).filter((a) => a !== "--force");
  cmdNew(goalArgs.join(" ") || "No goal specified", force);
} else if (cmd === "resume") { cmdResume(); }
else if (cmd === "status") { cmdStatus(); }
else if (cmd === "close") { cmdClose(); }
else if (cmd === "list") { cmdList(); }
else if (cmd === "migrate-v12") { cmdMigrateV12(args[1]); }
else if (cmd === "help") { printUsage(); }
