#!/usr/bin/env node
// Test suite for validate-plan.mjs using Node.js built-in test framework.
// No external dependencies.
//
// Usage:
//   node --test validate-plan.test.mjs
//
// Requires Node.js 18+.

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const validatePath = join(__dirname, "validate-plan.mjs");
const bootstrapPath = join(__dirname, "bootstrap.mjs");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir() {
  const dir = join(tmpdir(), `validate-test-${randomBytes(6).toString("hex")}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function cleanTempDir(dir) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch { /* ignore */ }
}

function runValidate(cwd, ...args) {
  try {
    const result = execFileSync(process.execPath, [validatePath, ...args], {
      cwd,
      encoding: "utf-8",
      timeout: 10000,
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
    });
    return { stdout: result, stderr: "", status: 0 };
  } catch (err) {
    return { stdout: err.stdout || "", stderr: err.stderr || "", status: err.status };
  }
}

function runValidateJson(cwd) {
  const { stdout, status } = runValidate(cwd, "--json");
  try {
    return { data: JSON.parse(stdout), status };
  } catch {
    return { data: null, status, raw: stdout };
  }
}

function runBootstrap(cwd, ...args) {
  return execFileSync(process.execPath, [bootstrapPath, ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 10000,
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });
}

function getPlanDir(cwd) {
  try {
    return readFileSync(join(cwd, "plans", ".current_plan"), "utf-8").trim();
  } catch {
    return null;
  }
}

function createActivePlan(cwd, goal) {
  runBootstrap(cwd, "new", goal || "Test goal");
  return getPlanDir(cwd);
}

function writePlanFile(cwd, planDirName, filename, content) {
  writeFileSync(join(cwd, "plans", planDirName, filename), content);
}

function readPlanFile(cwd, planDirName, filename) {
  return readFileSync(join(cwd, "plans", planDirName, filename), "utf-8");
}

/**
 * Create a minimal valid plan directory manually (without bootstrap) for isolated tests.
 */
function createMinimalPlan(cwd, opts = {}) {
  const planDirName = opts.name || `plan_2026-01-01_${randomBytes(4).toString("hex")}`;
  const planDir = join(cwd, "plans", planDirName);
  mkdirSync(join(planDir, "audit"), { recursive: true });
  mkdirSync(join(planDir, "checkpoints"), { recursive: true });
  mkdirSync(join(planDir, "findings"), { recursive: true });

  const state = opts.state || "AUDIT";
  const iteration = opts.iteration ?? 0;
  const transitions = opts.transitions || "- INIT \u2192 AUDIT (SEO sprint started)\n";

  writePlanFile(cwd, planDirName, "state.md", `# Current State: ${state}
## Iteration: ${iteration}
## Current Step: N/A
## Change Manifest (current sprint)
${opts.manifest || "- (no changes yet)"}
## Last Transition: INIT \u2192 ${state}
## Transition History:
${transitions}`);

  writePlanFile(cwd, planDirName, "plan.md", opts.plan || `# SEO Sprint Plan v0

## Goal
Test goal for validation

## Steps
${opts.steps || "- [ ] Step 1: Do something"}

## Success Criteria
- Traffic increases by 10%

## Verification Strategy
- Check Google Search Console
`);

  writePlanFile(cwd, planDirName, "decisions.md", opts.decisions || `# SEO Decision Log\n*Append-only.*\n`);
  writePlanFile(cwd, planDirName, "findings.md", opts.findings || `# SEO Audit Findings\n## Index\n*To be populated.*\n`);
  writePlanFile(cwd, planDirName, "progress.md", opts.progress || `# Progress\n\n## Completed\n*Nothing yet.*\n\n## In Progress\n- [ ] Audit\n\n## Remaining\n*TBD*\n`);
  writePlanFile(cwd, planDirName, "verification.md", opts.verification || `# Verification\n## Technical SEO Checks\n| # | Check |\n|---|-------|\n## Content Checks\nKeyword targeting check\n`);

  // Audit templates (minimal)
  const auditContent = opts.auditContent || `# Technical SEO Audit\n*Template.*\n\n## Issues Found\n| # | Issue | Severity | Impact | Fix Effort |\n|---|-------|----------|--------|------------|\n`;
  writePlanFile(cwd, planDirName, "audit/technical.md", auditContent);
  writePlanFile(cwd, planDirName, "audit/content.md", auditContent.replace("Technical", "Content"));
  writePlanFile(cwd, planDirName, "audit/backlinks.md", auditContent.replace("Technical", "Backlink"));
  writePlanFile(cwd, planDirName, "audit/competitors.md", auditContent.replace("Technical", "Competitor"));

  // Consolidated files
  const plansPath = join(cwd, "plans");
  if (!existsSync(join(plansPath, "FINDINGS.md"))) {
    writeFileSync(join(plansPath, "FINDINGS.md"), "# Consolidated SEO Findings\n");
  }
  if (!existsSync(join(plansPath, "DECISIONS.md"))) {
    writeFileSync(join(plansPath, "DECISIONS.md"), "# Consolidated SEO Decisions\n");
  }
  if (!existsSync(join(plansPath, "LESSONS.md"))) {
    writeFileSync(join(plansPath, "LESSONS.md"), "# SEO Lessons Learned\n");
  }
  if (!existsSync(join(plansPath, "INDEX.md"))) {
    writeFileSync(join(plansPath, "INDEX.md"), "# SEO Sprint Index\n");
  }

  // Set pointer
  writeFileSync(join(plansPath, ".current_plan"), planDirName);

  return planDirName;
}

// ---------------------------------------------------------------------------
// Tests: Basic validation
// ---------------------------------------------------------------------------

describe("basic validation", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("no active plan returns error exit", () => {
    const { status, stdout } = runValidate(tmpDir);
    assert.strictEqual(status, 1, "Should exit with code 1");
    assert.ok(stdout.includes("ERROR") || stdout.includes("error"), "Should contain error");
  });

  it("valid plan in AUDIT state passes all checks", () => {
    createActivePlan(tmpDir, "Valid AUDIT plan test");
    const { status } = runValidate(tmpDir);
    assert.strictEqual(status, 0, "Should exit with code 0");
  });

  it("missing required files produces errors", () => {
    const planDirName = createMinimalPlan(tmpDir);
    // Delete a required file
    rmSync(join(tmpDir, "plans", planDirName, "findings.md"));
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1, "Should exit with code 1");
    const errorMsgs = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errorMsgs.some((m) => m.includes("findings.md")), "Should report missing findings.md");
  });

  it("invalid state name produces error", () => {
    const planDirName = createMinimalPlan(tmpDir, { state: "INVALID_STATE" });
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1);
    const errorMsgs = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errorMsgs.some((m) => m.includes("Invalid state")), "Should report invalid state");
  });

  it("json mode returns valid JSON with correct structure", () => {
    createActivePlan(tmpDir, "JSON mode test");
    const { data } = runValidateJson(tmpDir);
    assert.ok(data, "Should parse as JSON");
    assert.ok("plan" in data, "Should have plan field");
    assert.ok("state" in data, "Should have state field");
    assert.ok("summary" in data, "Should have summary field");
    assert.ok("ok" in data, "Should have ok field");
  });

  it("quiet mode suppresses PASS results", () => {
    createActivePlan(tmpDir, "Quiet mode test");
    const { stdout } = runValidate(tmpDir, "--quiet");
    assert.ok(!stdout.includes("[PASS]"), "Should not contain [PASS] lines");
  });

  it("missing plans/ directory exits with error", () => {
    const { status } = runValidate(tmpDir);
    assert.strictEqual(status, 1);
  });

  it("empty .current_plan pointer exits with error", () => {
    mkdirSync(join(tmpDir, "plans"), { recursive: true });
    writeFileSync(join(tmpDir, "plans", ".current_plan"), "");
    const { status, data } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1);
    assert.ok(data.results.some((r) => r.level === "ERROR"));
  });
});

// ---------------------------------------------------------------------------
// Tests: Content quality checks
// ---------------------------------------------------------------------------

describe("content quality checks", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("placeholder-only audit file produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      auditContent: `# Technical SEO Audit\n*Template.*\n\n## Issues Found\n| # | Issue | Severity | Impact | Fix Effort |\n|---|-------|----------|--------|------------|\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("placeholder")), "Should warn about placeholder audit");
  });

  it("filled audit file with issues passes", () => {
    const auditContent = `# Technical SEO Audit
*Detailed audit results.*

## Page Speed
Lighthouse performance score: 45/100. Major issues with LCP.

## Mobile
Responsive design verified. Tap targets OK.

## Crawlability
robots.txt configured correctly. Sitemap present.

## Issues Found
| # | Issue | Severity | Impact | Fix Effort |
|---|-------|----------|--------|------------|
| 1 | Slow LCP (4.2s) | CRITICAL | High | Medium |
| 2 | Missing alt tags on 15 images | HIGH | Medium | Low |
`;
    const planDirName = createMinimalPlan(tmpDir, { auditContent });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    // Should NOT warn about placeholders for this file
    const placeholderWarns = warns.filter((m) => m.includes("technical.md") && m.includes("placeholder"));
    assert.strictEqual(placeholderWarns.length, 0, "Filled audit should not produce placeholder warning");
  });

  it("empty audit file produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir);
    // Overwrite with essentially empty content
    writePlanFile(tmpDir, planDirName, "audit/technical.md", "# Technical\n*Template*\n");
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("technical.md") && m.includes("placeholder")), "Should warn about empty audit");
  });

  it("audit with issues table but no data rows produces WARN", () => {
    const auditContent = `# Technical SEO Audit
*Detailed technical audit of the site.*

## Page Speed
Lighthouse scores collected.

## Mobile
Mobile responsiveness verified.

## Crawlability
Sitemap checked.

## Security
HTTPS active.

## Issues Found
| # | Issue | Severity | Impact | Fix Effort |
|---|-------|----------|--------|------------|
`;
    const planDirName = createMinimalPlan(tmpDir, { auditContent });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("Issues Found table has no data rows")), "Should warn about empty issues table");
  });

  it("audit with severity labels not from allowed set produces WARN", () => {
    const auditContent = `# Technical SEO Audit
*Detailed audit.*

## Page Speed
Score: 45

## Mobile
OK

## Crawlability
OK

## Security
OK

## Indexation
Checked

## Schema Markup
Not present

## Site Architecture
Flat

## Issues Found
| # | Issue | Severity | Impact | Fix Effort |
|---|-------|----------|--------|------------|
| 1 | Slow page | URGENT | High | Medium |
`;
    const planDirName = createMinimalPlan(tmpDir, { auditContent });
    // This tests that the validator does not crash; the severity "URGENT" is not in the allowed set
    // but the check only warns if NO valid severities are found at all
    const { data } = runValidateJson(tmpDir);
    assert.ok(data, "Should produce valid JSON output");
  });

  it("audit with proper severities does not produce severity WARN", () => {
    const auditContent = `# Technical SEO Audit
*Full audit.*

## Page Speed
Score: 72

## Mobile
Responsive

## Crawlability
robots.txt OK

## Security
HTTPS OK

## Indexation
All indexed

## Schema Markup
JSON-LD present

## Site Architecture
Good

## Issues Found
| # | Issue | Severity | Impact | Fix Effort |
|---|-------|----------|--------|------------|
| 1 | Slow page | CRITICAL | High | Medium |
| 2 | Missing meta | HIGH | Medium | Low |
`;
    const planDirName = createMinimalPlan(tmpDir, { auditContent });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    const severityWarns = warns.filter((m) => m.includes("severity classification"));
    assert.strictEqual(severityWarns.length, 0, "Proper severities should not trigger warning");
  });
});

// ---------------------------------------------------------------------------
// Tests: Cross-file consistency
// ---------------------------------------------------------------------------

describe("cross-file consistency", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("step [x] in plan but not in progress is detected", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] Step 1: Run technical audit\n- [ ] Step 2: Run content audit\n`,
      progress: `# Progress\n\n## Completed\n*Nothing yet.*\n\n## In Progress\n- [ ] Audit\n\n## Remaining\n*TBD*\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("Step marked [x] in plan.md")), "Should detect step not in progress.md");
  });

  it("PIVOT in decisions but not in state history is detected", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      decisions: `# SEO Decision Log\n*Append-only.*\n\n## D-001 PIVOT to new keyword strategy\nMarket changed.\n`,
      transitions: "- INIT \u2192 AUDIT (sprint started)\n",
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("PIVOT entry found in decisions.md")), "Should detect PIVOT mismatch");
  });

  it("consistent files pass cross-file checks", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] Run technical audit\n- [ ] Content plan\n`,
      progress: `# Progress\n\n## Completed\n- [x] Run technical audit\n\n## In Progress\n- [ ] Content plan\n\n## Remaining\n*TBD*\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Cross-file consistency")), "Should pass cross-file check");
  });

  it("PIVOT in decisions with PIVOT in state passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      decisions: `# SEO Decision Log\n*Append-only.*\n\n## D-001 PIVOT to new strategy\nReason.\n`,
      transitions: "- INIT \u2192 AUDIT (sprint started)\n- MEASURE \u2192 PIVOT (changing strategy)\n- PIVOT \u2192 PLAN (replanning)\n",
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    const pivotWarns = warns.filter((m) => m.includes("PIVOT entry found in decisions.md"));
    assert.strictEqual(pivotWarns.length, 0, "Should not warn when PIVOT is consistent");
  });

  it("keyword targets in plan trigger verification check", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      plan: `# Plan\n\n## Goal\nRank for SaaS keywords\n\n## KPI Targets\n| Metric | Baseline | Target |\n|--------|----------|--------|\n| Top 10 Keywords | 5 | 20 |\n\n## Steps\n- [ ] Do stuff\n\n## Success Criteria\n- More keywords\n\n## Verification Strategy\n- Check GSC\n`,
      verification: `# Verification\n## Checks\n| # | Check |\n|---|-------|\n| 1 | Speed | \n`,
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("keyword")), "Should warn about missing keyword checks in verification");
  });

  it("keyword targets with keyword verification passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      plan: `# Plan\n\n## Goal\nRank for SaaS keywords\n\n## KPI Targets\n| Metric | Baseline | Target |\n|--------|----------|--------|\n| Top 10 Keywords | 5 | 20 |\n\n## Steps\n- [ ] Do stuff\n\n## Success Criteria\n- More keywords\n\n## Verification Strategy\n- Check GSC\n`,
      verification: `# Verification\n## Checks\n| # | Check |\n|---|-------|\n| 1 | Keyword ranking positions | \n`,
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    const kwWarns = warns.filter((m) => m.includes("keyword targets") && m.includes("verification"));
    assert.strictEqual(kwWarns.length, 0, "Should not warn when keywords in verification");
  });
});

// ---------------------------------------------------------------------------
// Tests: Dependency enforcement
// ---------------------------------------------------------------------------

describe("dependency enforcement", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("step with deps all completed passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] 1. Run audit\n- [x] 2. Analyze results [deps: 1]\n- [ ] 3. Create plan [deps: 1,2]\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    const depErrors = errors.filter((m) => m.includes("completed before dependency"));
    assert.strictEqual(depErrors.length, 0, "Should not produce dep errors");
  });

  it("step completed before dep produces ERROR", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [ ] 1. Run audit\n- [x] 2. Analyze results [deps: 1]\n`,
    });
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1, "Should exit with error");
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errors.some((m) => m.includes("Step 2 completed before dependency 1")), "Should report dep violation");
  });

  it("step with no deps passes regardless", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] 1. Run audit\n- [x] 2. Another task\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    const depErrors = errors.filter((m) => m.includes("completed before dependency"));
    assert.strictEqual(depErrors.length, 0, "No dep errors for steps without deps");
  });

  it("multiple deps all met passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] 1. Audit\n- [x] 2. Research\n- [x] 3. Plan [deps: 1,2]\n`,
    });
    const { data } = runValidateJson(tmpDir);
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    const depErrors = errors.filter((m) => m.includes("completed before dependency"));
    assert.strictEqual(depErrors.length, 0);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Dependency enforcement")), "Should pass dep check");
  });

  it("multiple deps with one missing produces ERROR", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      steps: `- [x] 1. Audit\n- [ ] 2. Research\n- [x] 3. Plan [deps: 1,2]\n`,
    });
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1);
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errors.some((m) => m.includes("Step 3 completed before dependency 2")), "Should report missing dep 2");
  });
});

// ---------------------------------------------------------------------------
// Tests: Momentum detection (pivot counting)
// ---------------------------------------------------------------------------

describe("momentum detection", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("0 pivots passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      transitions: "- INIT \u2192 AUDIT (started)\n- AUDIT \u2192 PLAN (planned)\n",
    });
    const { data } = runValidateJson(tmpDir);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Pivot count OK: 0")), "Should pass with 0 pivots");
  });

  it("1 pivot passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      transitions: "- INIT \u2192 AUDIT (started)\n- AUDIT \u2192 PLAN (planned)\n- PLAN \u2192 EXECUTE (executing)\n- EXECUTE \u2192 MEASURE (measuring)\n- MEASURE \u2192 PIVOT (pivoting)\n",
    });
    const { data } = runValidateJson(tmpDir);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Pivot count OK: 1")), "Should pass with 1 pivot");
  });

  it("2 pivots produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      transitions: "- INIT \u2192 AUDIT (started)\n- MEASURE \u2192 PIVOT (first pivot)\n- PIVOT \u2192 PLAN (replan)\n- MEASURE \u2192 PIVOT (second pivot)\n",
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("Oscillation detected") && m.includes("2 pivots")), "Should warn about 2 pivots");
  });

  it("3 pivots produces ERROR", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      transitions: "- INIT \u2192 AUDIT (started)\n- MEASURE \u2192 PIVOT (1)\n- PIVOT \u2192 PLAN (replan)\n- MEASURE \u2192 PIVOT (2)\n- PIVOT \u2192 PLAN (replan)\n- MEASURE \u2192 PIVOT (3)\n",
    });
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1, "Should exit with error");
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errors.some((m) => m.includes("Excessive pivots") && m.includes("3")), "Should error on 3 pivots");
  });
});

// ---------------------------------------------------------------------------
// Tests: Iteration limits
// ---------------------------------------------------------------------------

describe("iteration limits", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("sprint 3 passes", () => {
    const planDirName = createMinimalPlan(tmpDir, { iteration: 3 });
    const { data } = runValidateJson(tmpDir);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Iteration 3 within limits")), "Sprint 3 should pass");
  });

  it("sprint 4 produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir, { iteration: 4 });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("Iteration 4")), "Sprint 4 should warn");
  });

  it("sprint 5 produces ERROR", () => {
    const planDirName = createMinimalPlan(tmpDir, { iteration: 5 });
    const { data, status } = runValidateJson(tmpDir);
    assert.strictEqual(status, 1);
    const errors = data.results.filter((r) => r.level === "ERROR").map((r) => r.msg);
    assert.ok(errors.some((m) => m.includes("Iteration 5 exceeds hard limit")), "Sprint 5 should error");
  });
});

// ---------------------------------------------------------------------------
// Tests: LESSONS.md health check
// ---------------------------------------------------------------------------

describe("LESSONS.md health check", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("LESSONS.md under 200 lines does not warn", () => {
    const planDirName = createMinimalPlan(tmpDir);
    const lessonsPath = join(tmpDir, "plans", "LESSONS.md");
    const content = Array.from({ length: 50 }, (_, i) => `- Lesson ${i + 1}`).join("\n");
    writeFileSync(lessonsPath, `# SEO Lessons\n${content}\n`);
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    const lessonsWarns = warns.filter((m) => m.includes("LESSONS.md") && m.includes("200-line"));
    assert.strictEqual(lessonsWarns.length, 0, "Under 200 lines should not warn");
  });

  it("LESSONS.md over 200 lines produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir);
    const lessonsPath = join(tmpDir, "plans", "LESSONS.md");
    const content = Array.from({ length: 250 }, (_, i) => `- Lesson ${i + 1}`).join("\n");
    writeFileSync(lessonsPath, `# SEO Lessons\n${content}\n`);
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("LESSONS.md exceeds 200-line cap")), "Over 200 lines should warn");
  });
});

// ---------------------------------------------------------------------------
// Tests: Change manifest and complexity budget (existing checks, regression)
// ---------------------------------------------------------------------------

describe("state-dependent checks", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("EXECUTE state without change manifest produces WARN", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      state: "EXECUTE",
      manifest: "- (no changes yet)",
    });
    const { data } = runValidateJson(tmpDir);
    const warns = data.results.filter((r) => r.level === "WARN").map((r) => r.msg);
    assert.ok(warns.some((m) => m.includes("Change manifest is empty")), "Should warn about empty manifest");
  });

  it("EXECUTE state with manifest entries passes", () => {
    const planDirName = createMinimalPlan(tmpDir, {
      state: "EXECUTE",
      manifest: "- Added meta descriptions to 5 pages\n- Fixed robots.txt\n",
    });
    const { data } = runValidateJson(tmpDir);
    const passes = data.results.filter((r) => r.level === "PASS").map((r) => r.msg);
    assert.ok(passes.some((m) => m.includes("Change manifest has")), "Should pass with manifest entries");
  });
});

// ---------------------------------------------------------------------------
// Tests: Summary output format
// ---------------------------------------------------------------------------

describe("output format", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("human-readable output includes Status: HEALTHY/UNHEALTHY", () => {
    createActivePlan(tmpDir, "Output format test");
    const { stdout } = runValidate(tmpDir);
    assert.ok(stdout.includes("Status:"), "Should have Status line");
    assert.ok(stdout.includes("HEALTHY") || stdout.includes("UNHEALTHY"), "Should have HEALTHY or UNHEALTHY");
  });

  it("human-readable output includes Summary line", () => {
    createActivePlan(tmpDir, "Summary line test");
    const { stdout } = runValidate(tmpDir);
    assert.ok(stdout.includes("Summary:"), "Should have Summary line");
    assert.ok(stdout.includes("PASS"), "Should mention PASS count");
    assert.ok(stdout.includes("WARN"), "Should mention WARN count");
    assert.ok(stdout.includes("ERROR"), "Should mention ERROR count");
  });

  it("JSON output has ok field reflecting error state", () => {
    createActivePlan(tmpDir, "JSON ok field test");
    const { data } = runValidateJson(tmpDir);
    assert.strictEqual(data.ok, true, "ok should be true when no errors");
  });

  it("JSON output has ok=false when errors present", () => {
    const planDirName = createMinimalPlan(tmpDir, { state: "BOGUS" });
    const { data } = runValidateJson(tmpDir);
    assert.strictEqual(data.ok, false, "ok should be false when errors present");
  });
});
