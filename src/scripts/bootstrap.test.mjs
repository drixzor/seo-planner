#!/usr/bin/env node
// Test suite for bootstrap.mjs using Node.js built-in test framework.
// No external dependencies.
//
// Usage:
//   node --test bootstrap.test.mjs
//
// Requires Node.js 18+.

import { describe, it, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const bootstrapPath = join(__dirname, "bootstrap.mjs");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir() {
  const dir = join(tmpdir(), `bootstrap-test-${randomBytes(6).toString("hex")}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function cleanTempDir(dir) {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch { /* ignore */ }
}

function run(cwd, ...args) {
  const result = execFileSync(process.execPath, [bootstrapPath, ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 10000,
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });
  return result;
}

function runExpectFail(cwd, ...args) {
  try {
    execFileSync(process.execPath, [bootstrapPath, ...args], {
      cwd,
      encoding: "utf-8",
      timeout: 10000,
      env: { ...process.env, NODE_NO_WARNINGS: "1" },
    });
    assert.fail("Expected command to fail but it succeeded");
  } catch (err) {
    return { stderr: err.stderr || "", stdout: err.stdout || "", status: err.status };
  }
}

function readPointer(cwd) {
  try {
    return readFileSync(join(cwd, "plans", ".current_plan"), "utf-8").trim();
  } catch {
    return null;
  }
}

function readPlanFile(cwd, planDirName, filename) {
  try {
    return readFileSync(join(cwd, "plans", planDirName, filename), "utf-8");
  } catch {
    return null;
  }
}

function getPlanDir(cwd) {
  const pointer = readPointer(cwd);
  if (!pointer) return null;
  return pointer;
}

function createActivePlan(cwd, goal) {
  run(cwd, "new", goal || "Test goal");
  return getPlanDir(cwd);
}

// ---------------------------------------------------------------------------
// Tests: New Plan Creation
// ---------------------------------------------------------------------------

describe("new plan creation", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("creates plan directory with correct name format", () => {
    run(tmpDir, "new", "Test SEO sprint goal");
    const planDirName = getPlanDir(tmpDir);
    assert.ok(planDirName, "Pointer should exist");
    // Format: plan_YYYY-MM-DD_XXXXXXXX
    assert.match(planDirName, /^plan_\d{4}-\d{2}-\d{2}_[0-9a-f]{8}$/);
    assert.ok(existsSync(join(tmpDir, "plans", planDirName)));
  });

  it("creates all required files", () => {
    run(tmpDir, "new", "Test goal");
    const planDirName = getPlanDir(tmpDir);
    const planDir = join(tmpDir, "plans", planDirName);
    const requiredFiles = [
      "state.md",
      "plan.md",
      "decisions.md",
      "findings.md",
      "progress.md",
      "verification.md",
    ];
    for (const file of requiredFiles) {
      assert.ok(existsSync(join(planDir, file)), `${file} should exist`);
    }
  });

  it("creates audit/ directory with 4 template files", () => {
    run(tmpDir, "new", "Audit test");
    const planDirName = getPlanDir(tmpDir);
    const auditDir = join(tmpDir, "plans", planDirName, "audit");
    assert.ok(existsSync(auditDir), "audit/ should exist");
    const auditFiles = ["technical.md", "content.md", "backlinks.md", "competitors.md"];
    for (const file of auditFiles) {
      assert.ok(existsSync(join(auditDir, file)), `audit/${file} should exist`);
    }
  });

  it("creates findings/ and checkpoints/ directories", () => {
    run(tmpDir, "new", "Dir test");
    const planDirName = getPlanDir(tmpDir);
    const planDir = join(tmpDir, "plans", planDirName);
    assert.ok(existsSync(join(planDir, "findings")), "findings/ should exist");
    assert.ok(existsSync(join(planDir, "checkpoints")), "checkpoints/ should exist");
  });

  it("state.md starts in AUDIT state at iteration 0", () => {
    run(tmpDir, "new", "State test");
    const planDirName = getPlanDir(tmpDir);
    const state = readPlanFile(tmpDir, planDirName, "state.md");
    assert.ok(state.includes("# Current State: AUDIT"), "Should start in AUDIT");
    assert.ok(state.includes("## Iteration: 0"), "Should start at iteration 0");
  });

  it("state.md contains INIT -> AUDIT transition in history", () => {
    run(tmpDir, "new", "Transition test");
    const planDirName = getPlanDir(tmpDir);
    const state = readPlanFile(tmpDir, planDirName, "state.md");
    assert.ok(state.includes("INIT"), "Should contain INIT");
    assert.ok(state.includes("AUDIT"), "Should contain AUDIT");
    assert.ok(
      /INIT\s*(?:->|-->|\u2192)\s*AUDIT/.test(state),
      "Should have INIT -> AUDIT transition"
    );
  });

  it("plan.md contains the goal text", () => {
    const goal = "Optimize example.com for SaaS keywords";
    run(tmpDir, "new", goal);
    const planDirName = getPlanDir(tmpDir);
    const plan = readPlanFile(tmpDir, planDirName, "plan.md");
    assert.ok(plan.includes(goal), "plan.md should contain the goal");
  });

  it(".current_plan pointer is set correctly", () => {
    run(tmpDir, "new", "Pointer test");
    const pointer = readPointer(tmpDir);
    assert.ok(pointer, "Pointer should exist");
    assert.ok(
      existsSync(join(tmpDir, "plans", pointer)),
      "Pointer should reference existing directory"
    );
  });

  it(".gitignore gets plans/ added", () => {
    run(tmpDir, "new", "Gitignore test");
    const gitignore = readFileSync(join(tmpDir, ".gitignore"), "utf-8");
    assert.ok(gitignore.includes("plans/"), ".gitignore should contain plans/");
  });

  it(".gitignore preserves existing content", () => {
    writeFileSync(join(tmpDir, ".gitignore"), "node_modules/\n.env\n");
    run(tmpDir, "new", "Gitignore preserve test");
    const gitignore = readFileSync(join(tmpDir, ".gitignore"), "utf-8");
    assert.ok(gitignore.includes("node_modules/"), "Existing entries should be preserved");
    assert.ok(gitignore.includes(".env"), "Existing entries should be preserved");
    assert.ok(gitignore.includes("plans/"), "plans/ should be added");
  });

  it("refuses to create if active plan exists (no --force)", () => {
    run(tmpDir, "new", "First plan");
    const { stderr } = runExpectFail(tmpDir, "new", "Second plan");
    assert.ok(
      stderr.includes("Active sprint exists") || stderr.includes("ERROR"),
      "Should refuse with error message"
    );
  });

  it("--force closes active plan then creates new one", () => {
    run(tmpDir, "new", "First plan");
    const firstPlan = getPlanDir(tmpDir);
    run(tmpDir, "new", "--force", "Second plan with force");
    const secondPlan = getPlanDir(tmpDir);
    assert.notStrictEqual(firstPlan, secondPlan, "Should create a different plan");
    assert.ok(
      existsSync(join(tmpDir, "plans", firstPlan)),
      "First plan directory should be preserved"
    );
    // First plan state.md should show CLOSE
    const firstState = readPlanFile(tmpDir, firstPlan, "state.md");
    assert.ok(firstState.includes("CLOSE"), "First plan should be closed");
  });

  it("consolidated files (FINDINGS, DECISIONS, LESSONS, INDEX) created if missing", () => {
    run(tmpDir, "new", "Consolidated test");
    const files = ["FINDINGS.md", "DECISIONS.md", "LESSONS.md", "INDEX.md"];
    for (const file of files) {
      assert.ok(
        existsSync(join(tmpDir, "plans", file)),
        `plans/${file} should exist`
      );
    }
  });

  it("backward-compatible goal-only syntax works", () => {
    run(tmpDir, "Test backward compat goal");
    const planDirName = getPlanDir(tmpDir);
    assert.ok(planDirName, "Plan should be created");
    const plan = readPlanFile(tmpDir, planDirName, "plan.md");
    assert.ok(plan.includes("Test backward compat goal"), "Goal should be in plan.md");
  });
});

// ---------------------------------------------------------------------------
// Tests: Resume
// ---------------------------------------------------------------------------

describe("resume", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("outputs current state, iteration, step", () => {
    createActivePlan(tmpDir, "Resume test goal");
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("AUDIT"), "Should show AUDIT state");
    assert.ok(output.includes("0"), "Should show iteration 0");
  });

  it("shows goal from plan.md", () => {
    createActivePlan(tmpDir, "My specific SEO goal for resume");
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("My specific SEO goal for resume"), "Should show the goal");
  });

  it("shows progress counts", () => {
    createActivePlan(tmpDir, "Progress resume test");
    const output = run(tmpDir, "resume");
    // Bootstrap creates 4 in-progress items (audit tasks)
    assert.ok(output.includes("done") || output.includes("remaining"), "Should show progress");
  });

  it("fails gracefully when no active plan", () => {
    const { stderr } = runExpectFail(tmpDir, "resume");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should show error about no active sprint"
    );
  });

  it("shows recovery file paths", () => {
    createActivePlan(tmpDir, "Recovery test");
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("state.md"), "Should mention state.md");
    assert.ok(output.includes("plan.md"), "Should mention plan.md");
    assert.ok(output.includes("decisions.md"), "Should mention decisions.md");
  });

  it("shows last transition info", () => {
    createActivePlan(tmpDir, "Transition info test");
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("Last:") || output.includes("INIT"), "Should show transition info");
  });
});

// ---------------------------------------------------------------------------
// Tests: Status
// ---------------------------------------------------------------------------

describe("status", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("one-line output with state, sprint, step, goal", () => {
    createActivePlan(tmpDir, "Status test goal");
    const output = run(tmpDir, "status");
    const lines = output.trim().split("\n");
    assert.strictEqual(lines.length, 1, "Should be exactly one line");
    assert.ok(output.includes("AUDIT"), "Should contain state");
    assert.ok(output.includes("Status test goal"), "Should contain goal");
  });

  it("works with active plan", () => {
    createActivePlan(tmpDir, "Active plan status");
    const output = run(tmpDir, "status");
    assert.ok(output.includes("[AUDIT]"), "Should show state in brackets");
    assert.ok(output.includes("plans/plan_"), "Should show plan path");
  });

  it("shows 'No active' when no plan", () => {
    const output = run(tmpDir, "status");
    assert.ok(
      output.toLowerCase().includes("no active"),
      "Should indicate no active sprint"
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: Close
// ---------------------------------------------------------------------------

describe("close", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("removes .current_plan pointer", () => {
    createActivePlan(tmpDir, "Close pointer test");
    assert.ok(readPointer(tmpDir), "Pointer should exist before close");
    run(tmpDir, "close");
    assert.strictEqual(readPointer(tmpDir), null, "Pointer should be removed after close");
  });

  it("preserves plan directory", () => {
    const planDirName = createActivePlan(tmpDir, "Close preserve test");
    run(tmpDir, "close");
    assert.ok(
      existsSync(join(tmpDir, "plans", planDirName)),
      "Plan directory should still exist"
    );
  });

  it("updates state.md to CLOSE", () => {
    const planDirName = createActivePlan(tmpDir, "Close state test");
    run(tmpDir, "close");
    const state = readPlanFile(tmpDir, planDirName, "state.md");
    assert.ok(state.includes("# Current State: CLOSE"), "State should be CLOSE");
  });

  it("updates state.md transition history", () => {
    const planDirName = createActivePlan(tmpDir, "Close transition test");
    run(tmpDir, "close");
    const state = readPlanFile(tmpDir, planDirName, "state.md");
    assert.ok(
      state.includes("CLOSE") && state.includes("sprint closed"),
      "Should log close transition"
    );
  });

  it("merges findings.md to plans/FINDINGS.md", () => {
    const planDirName = createActivePlan(tmpDir, "Close findings merge test");
    // Add some real findings content
    const findingsPath = join(tmpDir, "plans", planDirName, "findings.md");
    const content = readFileSync(findingsPath, "utf-8");
    const updated = content.replace(
      "## Index\n*To be populated during AUDIT.*",
      "## Index\n- [Finding 1](findings/finding-1.md) - Important SEO finding\n\n## Key Finding\nSite has critical speed issues."
    );
    writeFileSync(findingsPath, updated);
    run(tmpDir, "close");
    const consolidated = readFileSync(join(tmpDir, "plans", "FINDINGS.md"), "utf-8");
    assert.ok(
      consolidated.includes(planDirName),
      "Consolidated file should reference the plan"
    );
  });

  it("merges decisions.md to plans/DECISIONS.md", () => {
    const planDirName = createActivePlan(tmpDir, "Close decisions merge test");
    // Add a decision
    const decisionsPath = join(tmpDir, "plans", planDirName, "decisions.md");
    const content = readFileSync(decisionsPath, "utf-8");
    writeFileSync(decisionsPath, content + "\n## D-001 Focus on technical SEO first\nBecause site speed is critical.\n");
    run(tmpDir, "close");
    const consolidated = readFileSync(join(tmpDir, "plans", "DECISIONS.md"), "utf-8");
    assert.ok(
      consolidated.includes(planDirName),
      "Consolidated decisions should reference the plan"
    );
  });

  it("deduplication: does not merge same plan twice", () => {
    const planDirName = createActivePlan(tmpDir, "Dedup test");
    const findingsPath = join(tmpDir, "plans", planDirName, "findings.md");
    const content = readFileSync(findingsPath, "utf-8");
    writeFileSync(
      findingsPath,
      content.replace(
        "## Index\n*To be populated during AUDIT.*",
        "## Index\n- [Test](findings/test.md)\n\n## Real Finding\nReal content here."
      )
    );
    run(tmpDir, "close");
    const afterFirst = readFileSync(join(tmpDir, "plans", "FINDINGS.md"), "utf-8");
    const firstCount = (afterFirst.match(new RegExp(`## ${planDirName}`, "g")) || []).length;

    // Manually re-set pointer and close again to simulate double close
    writeFileSync(join(tmpDir, "plans", ".current_plan"), planDirName);
    run(tmpDir, "close");
    const afterSecond = readFileSync(join(tmpDir, "plans", "FINDINGS.md"), "utf-8");
    const secondCount = (afterSecond.match(new RegExp(`## ${planDirName}`, "g")) || []).length;

    assert.strictEqual(firstCount, secondCount, "Plan should not be merged twice");
  });

  it("sliding window: trims consolidated files to 8 plans max", () => {
    // Create and close 10 plans sequentially
    for (let i = 0; i < 10; i++) {
      run(tmpDir, "new", `Plan number ${i}`);
      const planDirName = getPlanDir(tmpDir);
      // Add unique findings so there is content to merge
      const findingsPath = join(tmpDir, "plans", planDirName, "findings.md");
      const content = readFileSync(findingsPath, "utf-8");
      writeFileSync(
        findingsPath,
        content.replace(
          "## Index\n*To be populated during AUDIT.*",
          `## Index\n- [Finding ${i}](findings/f${i}.md)\n\n## Finding ${i}\nContent for plan ${i}.`
        )
      );
      run(tmpDir, "close");
    }
    const findings = readFileSync(join(tmpDir, "plans", "FINDINGS.md"), "utf-8");
    const planSections = findings.match(/\n## plan_/g) || [];
    assert.ok(
      planSections.length <= 8,
      `Should have at most 8 plan sections, got ${planSections.length}`
    );
  });

  it("appends to INDEX.md", () => {
    const planDirName = createActivePlan(tmpDir, "Index append test");
    run(tmpDir, "close");
    const index = readFileSync(join(tmpDir, "plans", "INDEX.md"), "utf-8");
    assert.ok(index.includes(planDirName), "INDEX.md should reference the closed plan");
  });

  it("snapshots LESSONS.md to plan directory", () => {
    const planDirName = createActivePlan(tmpDir, "Snapshot lessons test");
    // LESSONS.md is created by bootstrap new
    const lessonsPath = join(tmpDir, "plans", "LESSONS.md");
    writeFileSync(lessonsPath, "# SEO Lessons Learned\n- Always audit technical first\n");
    run(tmpDir, "close");
    const snapshot = readPlanFile(tmpDir, planDirName, "lessons_snapshot.md");
    assert.ok(snapshot, "Lessons snapshot should exist");
    assert.ok(
      snapshot.includes("Always audit technical first"),
      "Snapshot should contain lessons content"
    );
  });

  it("silent close for --force", () => {
    createActivePlan(tmpDir, "First for force");
    const output = run(tmpDir, "new", "--force", "Second via force");
    // The silent close message should be different from a normal close
    assert.ok(
      output.includes("Closed previous sprint") || output.includes("Initialized"),
      "Force close should produce output"
    );
  });

  it("errors when no active plan to close", () => {
    const { stderr } = runExpectFail(tmpDir, "close");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should error when no plan to close"
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: List
// ---------------------------------------------------------------------------

describe("list", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("shows all sprint directories", () => {
    createActivePlan(tmpDir, "List test one");
    const firstPlan = getPlanDir(tmpDir);
    run(tmpDir, "new", "--force", "List test two");
    const secondPlan = getPlanDir(tmpDir);
    const output = run(tmpDir, "list");
    assert.ok(output.includes(firstPlan), "Should list first plan");
    assert.ok(output.includes(secondPlan), "Should list second plan");
  });

  it("marks active plan", () => {
    createActivePlan(tmpDir, "Active marker test");
    const output = run(tmpDir, "list");
    assert.ok(output.includes("active"), "Should mark the active plan");
  });

  it("shows message when no plans exist", () => {
    const output = run(tmpDir, "list");
    assert.ok(
      output.toLowerCase().includes("no") && (output.toLowerCase().includes("plan") || output.toLowerCase().includes("sprint")),
      "Should indicate no plans"
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: Edge Cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("corrupted pointer file (random text)", () => {
    mkdirSync(join(tmpDir, "plans"), { recursive: true });
    writeFileSync(join(tmpDir, "plans", ".current_plan"), "nonexistent_plan_dir_abc123");
    // resume should fail gracefully
    const { stderr } = runExpectFail(tmpDir, "resume");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should handle corrupted pointer gracefully"
    );
  });

  it("empty pointer file", () => {
    mkdirSync(join(tmpDir, "plans"), { recursive: true });
    writeFileSync(join(tmpDir, "plans", ".current_plan"), "");
    const { stderr } = runExpectFail(tmpDir, "resume");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should handle empty pointer gracefully"
    );
  });

  it("pointer file with whitespace only", () => {
    mkdirSync(join(tmpDir, "plans"), { recursive: true });
    writeFileSync(join(tmpDir, "plans", ".current_plan"), "   \n  \n  ");
    const { stderr } = runExpectFail(tmpDir, "resume");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should handle whitespace-only pointer gracefully"
    );
  });

  it("missing plan directory (pointer exists but dir deleted)", () => {
    createActivePlan(tmpDir, "Missing dir test");
    const planDirName = getPlanDir(tmpDir);
    rmSync(join(tmpDir, "plans", planDirName), { recursive: true, force: true });
    const { stderr } = runExpectFail(tmpDir, "resume");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should handle missing directory gracefully"
    );
  });

  it("empty findings/decisions files do not break close", () => {
    const planDirName = createActivePlan(tmpDir, "Empty files test");
    // Overwrite with empty content
    writeFileSync(join(tmpDir, "plans", planDirName, "findings.md"), "");
    writeFileSync(join(tmpDir, "plans", planDirName, "decisions.md"), "");
    // Close should not throw
    const output = run(tmpDir, "close");
    assert.ok(output.includes("Closed"), "Should close without error");
  });

  it("unicode in goal text", () => {
    const goal = "Optimiser le SEO pour le march\u00e9 fran\u00e7ais \u2014 cibles: \u00e9nergie, \u00e9cologie \ud83c\udf0d";
    run(tmpDir, "new", goal);
    const planDirName = getPlanDir(tmpDir);
    const plan = readPlanFile(tmpDir, planDirName, "plan.md");
    assert.ok(plan.includes(goal), "Unicode goal should be preserved in plan.md");
  });

  it("very long goal text", () => {
    const goal = "A".repeat(2000) + " - extremely long goal for stress testing";
    run(tmpDir, "new", goal);
    const planDirName = getPlanDir(tmpDir);
    const plan = readPlanFile(tmpDir, planDirName, "plan.md");
    assert.ok(plan.includes("A".repeat(100)), "Long goal should be stored in plan.md");
  });

  it("special characters in goal text", () => {
    const goal = 'Goal with "quotes" & <tags> | pipes $vars `backticks`';
    run(tmpDir, "new", goal);
    const planDirName = getPlanDir(tmpDir);
    const plan = readPlanFile(tmpDir, planDirName, "plan.md");
    assert.ok(plan.includes("quotes"), "Special characters should not break creation");
  });

  it("creating a plan when plans/ already exists but is empty", () => {
    mkdirSync(join(tmpDir, "plans"), { recursive: true });
    run(tmpDir, "new", "Into existing plans dir");
    const planDirName = getPlanDir(tmpDir);
    assert.ok(planDirName, "Should create plan in existing empty plans/");
  });

  it("status works immediately after close", () => {
    createActivePlan(tmpDir, "Status after close");
    run(tmpDir, "close");
    const output = run(tmpDir, "status");
    assert.ok(
      output.toLowerCase().includes("no active"),
      "Status after close should show no active sprint"
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: Consolidated File Content
// ---------------------------------------------------------------------------

describe("consolidated files", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("FINDINGS.md has correct header", () => {
    createActivePlan(tmpDir, "Findings header test");
    const content = readFileSync(join(tmpDir, "plans", "FINDINGS.md"), "utf-8");
    assert.ok(content.includes("# Consolidated SEO Findings"), "Should have correct header");
  });

  it("DECISIONS.md has correct header", () => {
    createActivePlan(tmpDir, "Decisions header test");
    const content = readFileSync(join(tmpDir, "plans", "DECISIONS.md"), "utf-8");
    assert.ok(content.includes("# Consolidated SEO Decisions"), "Should have correct header");
  });

  it("LESSONS.md has correct header", () => {
    createActivePlan(tmpDir, "Lessons header test");
    const content = readFileSync(join(tmpDir, "plans", "LESSONS.md"), "utf-8");
    assert.ok(content.includes("# SEO Lessons Learned"), "Should have correct header");
  });

  it("INDEX.md has table header", () => {
    createActivePlan(tmpDir, "Index header test");
    const content = readFileSync(join(tmpDir, "plans", "INDEX.md"), "utf-8");
    assert.ok(content.includes("| Sprint |"), "Should have table header");
    assert.ok(content.includes("| Date |") || content.includes("Date"), "Should have date column");
  });

  it("INDEX.md does not duplicate entries on multiple closes", () => {
    const planDirName = createActivePlan(tmpDir, "Index dedup test");
    run(tmpDir, "close");
    // Simulate re-close by restoring pointer
    writeFileSync(join(tmpDir, "plans", ".current_plan"), planDirName);
    // Reset state to non-CLOSE so close updates it
    const statePath = join(tmpDir, "plans", planDirName, "state.md");
    const stateContent = readFileSync(statePath, "utf-8");
    writeFileSync(statePath, stateContent.replace("# Current State: CLOSE", "# Current State: AUDIT"));
    run(tmpDir, "close");
    const index = readFileSync(join(tmpDir, "plans", "INDEX.md"), "utf-8");
    const occurrences = (index.match(new RegExp(`\\| ${planDirName} \\|`, "g")) || []).length;
    assert.strictEqual(occurrences, 1, "Plan should appear exactly once in INDEX.md");
  });
});

// ---------------------------------------------------------------------------
// Tests: Verification File Content
// ---------------------------------------------------------------------------

describe("file templates", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("verification.md has technical and content check tables", () => {
    const planDirName = createActivePlan(tmpDir, "Verification template test");
    const content = readPlanFile(tmpDir, planDirName, "verification.md");
    assert.ok(content.includes("## Technical SEO Checks"), "Should have technical checks");
    assert.ok(content.includes("## Content Checks"), "Should have content checks");
    assert.ok(content.includes("## Rankings & Traffic"), "Should have rankings section");
    assert.ok(content.includes("## Backlink Profile"), "Should have backlinks section");
    assert.ok(content.includes("## Verdict"), "Should have verdict section");
  });

  it("plan.md has all expected sections", () => {
    const planDirName = createActivePlan(tmpDir, "Plan template test");
    const content = readPlanFile(tmpDir, planDirName, "plan.md");
    const expectedSections = [
      "Goal",
      "Steps",
      "Success Criteria",
      "Verification Strategy",
      "Topical Map",
      "Content Calendar",
      "Technical Fix Priority List",
      "KPI Targets",
      "Complexity Budget",
    ];
    for (const section of expectedSections) {
      assert.ok(content.includes(`## ${section}`), `plan.md should have ## ${section}`);
    }
  });

  it("decisions.md is append-only format", () => {
    const planDirName = createActivePlan(tmpDir, "Decisions format test");
    const content = readPlanFile(tmpDir, planDirName, "decisions.md");
    assert.ok(content.includes("Append-only"), "Should mention append-only");
  });

  it("progress.md has all tracking sections", () => {
    const planDirName = createActivePlan(tmpDir, "Progress format test");
    const content = readPlanFile(tmpDir, planDirName, "progress.md");
    assert.ok(content.includes("## Completed"), "Should have Completed");
    assert.ok(content.includes("## In Progress"), "Should have In Progress");
    assert.ok(content.includes("## Remaining"), "Should have Remaining");
    assert.ok(content.includes("## Blocked"), "Should have Blocked");
  });

  it("audit templates have issue tracking tables", () => {
    const planDirName = createActivePlan(tmpDir, "Audit template test");
    const auditDir = join(tmpDir, "plans", planDirName, "audit");
    const files = ["technical.md", "content.md", "backlinks.md", "competitors.md"];
    for (const file of files) {
      const content = readFileSync(join(auditDir, file), "utf-8");
      assert.ok(
        content.includes("|") && content.includes("#"),
        `audit/${file} should have structured content`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: Cross-sprint context
// ---------------------------------------------------------------------------

describe("cross-sprint context", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("second plan includes cross-sprint note in findings and decisions", () => {
    // First plan creates consolidated files
    createActivePlan(tmpDir, "First plan for cross-sprint");
    run(tmpDir, "close");

    // Second plan should reference consolidated files
    run(tmpDir, "new", "Second plan for cross-sprint");
    const planDirName = getPlanDir(tmpDir);
    const findings = readPlanFile(tmpDir, planDirName, "findings.md");
    const decisions = readPlanFile(tmpDir, planDirName, "decisions.md");
    assert.ok(
      findings.includes("Cross-sprint context"),
      "Second plan findings should reference consolidated files"
    );
    assert.ok(
      decisions.includes("Cross-sprint context"),
      "Second plan decisions should reference consolidated files"
    );
  });

  it("first plan does not include cross-sprint note", () => {
    run(tmpDir, "new", "Very first plan ever");
    const planDirName = getPlanDir(tmpDir);
    const findings = readPlanFile(tmpDir, planDirName, "findings.md");
    // First plan has no consolidated files yet to reference
    assert.ok(
      !findings.includes("Cross-sprint context"),
      "First plan should not have cross-sprint note"
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: Help and usage
// ---------------------------------------------------------------------------

describe("help and usage", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("no args shows usage", () => {
    const output = run(tmpDir);
    assert.ok(output.includes("Usage") || output.includes("SEO Planner"), "Should show usage info");
  });

  it("help subcommand shows usage", () => {
    const output = run(tmpDir, "help");
    assert.ok(output.includes("Usage") || output.includes("Commands"), "Should show usage info");
  });

  it("unknown flag produces error", () => {
    const { stderr } = runExpectFail(tmpDir, "--unknown-flag");
    assert.ok(stderr.includes("Unknown flag") || stderr.includes("ERROR"), "Should error on unknown flag");
  });
});

// ---------------------------------------------------------------------------
// Tests: v1.2 STRATEGIZE phase (strategy.md + migrate-v12)
// ---------------------------------------------------------------------------

describe("v1.2 strategy.md", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("cmdNew creates strategy.md with all 8 required sections", () => {
    const planDirName = createActivePlan(tmpDir, "v1.2 strategy test");
    const content = readPlanFile(tmpDir, planDirName, "strategy.md");
    assert.ok(content, "strategy.md should exist");
    const requiredSections = [
      "Wedge Thesis",
      "SCORE Assessment",
      "Adversarial Competitor Synthesis",
      "Moat Analysis",
      "Programmatic Volume Decision",
      "KD Gating Decision",
      "Channel Bets",
      "Strategy Gates",
    ];
    for (const section of requiredSections) {
      assert.ok(content.includes(section), `strategy.md should have section: ${section}`);
    }
  });

  it("cmdNew strategy.md stub includes Strategy Gates table with PENDING placeholder", () => {
    const planDirName = createActivePlan(tmpDir, "Strategy Gates table test");
    const content = readPlanFile(tmpDir, planDirName, "strategy.md");
    assert.ok(content.includes("| Gate ID |"), "Should have Gate ID column header");
    assert.ok(content.includes("PENDING"), "Should have PENDING placeholder");
  });

  it("cmdResume shows strategy.md in recovery files when present", () => {
    createActivePlan(tmpDir, "Resume strategy test");
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("strategy.md"), "Resume should mention strategy.md");
    assert.ok(!output.includes("missing — v1.1"), "Should not show migrate-v12 hint when strategy.md exists");
  });

  it("cmdResume shows migrate-v12 hint when strategy.md missing (v1.1 sprint)", () => {
    const planDirName = createActivePlan(tmpDir, "v1.1 sprint simulation");
    // Simulate v1.1 sprint by deleting strategy.md
    rmSync(join(tmpDir, "plans", planDirName, "strategy.md"));
    const output = run(tmpDir, "resume");
    assert.ok(output.includes("migrate-v12"), "Should suggest running migrate-v12");
  });
});

describe("v1.2 migrate-v12 subcommand", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("creates strategy.md stub from v1.1 plan.md (uses pointer)", () => {
    const planDirName = createActivePlan(tmpDir, "Migrate test goal");
    rmSync(join(tmpDir, "plans", planDirName, "strategy.md"));
    const output = run(tmpDir, "migrate-v12");
    assert.ok(output.includes("Migrated to v1.2"), "Should report migration");
    const content = readPlanFile(tmpDir, planDirName, "strategy.md");
    assert.ok(content, "strategy.md should be created");
    assert.ok(content.includes("MIGRATED from v1.1"), "Should mark as migrated");
    assert.ok(content.includes("[TODO]"), "Should mark sections needing manual completion");
  });

  it("accepts explicit dir path argument", () => {
    const planDirName = createActivePlan(tmpDir, "Explicit path migrate test");
    rmSync(join(tmpDir, "plans", planDirName, "strategy.md"));
    // Remove pointer to test path-arg path
    rmSync(join(tmpDir, "plans", ".current_plan"));
    const output = run(tmpDir, "migrate-v12", `plans/${planDirName}`);
    assert.ok(output.includes("Migrated to v1.2"), "Should accept explicit dir path");
    const content = readPlanFile(tmpDir, planDirName, "strategy.md");
    assert.ok(content, "strategy.md should be created");
  });

  it("refuses to overwrite existing strategy.md", () => {
    createActivePlan(tmpDir, "No overwrite test");
    // strategy.md already exists from cmdNew; migrate-v12 should refuse
    const output = run(tmpDir, "migrate-v12");
    assert.ok(
      output.includes("already exists") || output.includes("nothing to migrate"),
      "Should refuse to overwrite"
    );
  });

  it("errors when no active sprint and no path supplied", () => {
    const { stderr } = runExpectFail(tmpDir, "migrate-v12");
    assert.ok(
      stderr.includes("No active sprint") || stderr.includes("ERROR"),
      "Should error with no active sprint and no path"
    );
  });

  it("errors when path does not exist", () => {
    const { stderr } = runExpectFail(tmpDir, "migrate-v12", "plans/nonexistent_sprint");
    assert.ok(
      stderr.includes("No sprint directory") || stderr.includes("ERROR"),
      "Should error on missing path"
    );
  });
});

describe("v1.2 adversarial competitors.md template", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    cleanTempDir(tmpDir);
  });

  it("competitors.md template references adversarial methodology", () => {
    const planDirName = createActivePlan(tmpDir, "Adversarial template test");
    const content = readFileSync(
      join(tmpDir, "plans", planDirName, "audit", "competitors.md"),
      "utf-8"
    );
    assert.ok(content.includes("Adversarial") || content.includes("adversarial"), "Should mention adversarial");
    assert.ok(content.includes("competitive-intelligence.md"), "Should reference the methodology doc");
    assert.ok(
      content.includes("confirmed") && content.includes("inferred") && content.includes("estimated"),
      "Should mention evidence tier labels"
    );
  });
});
