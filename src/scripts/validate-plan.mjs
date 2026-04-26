#!/usr/bin/env node
// SEO Planner -- Protocol compliance validator for active SEO sprint plans.
//
// Usage:
//   node validate-plan.mjs                Validate active plan
//   node validate-plan.mjs --quiet        Suppress passing checks (errors/warnings only)
//   node validate-plan.mjs --json         Output results as JSON
//
// Exit code 0 if no ERRORs, exit code 1 if any ERROR found.
// Requires Node.js 18+.

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const plansDir = join(cwd, "plans");
const pointerFile = join(plansDir, ".current_plan");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const quietMode = args.includes("--quiet");
const jsonMode = args.includes("--json");

// ---------------------------------------------------------------------------
// Validation state
// ---------------------------------------------------------------------------

const results = [];
let passCount = 0;
let warnCount = 0;
let errorCount = 0;

function pass(msg) {
  passCount++;
  results.push({ level: "PASS", msg });
}

function warn(msg) {
  warnCount++;
  results.push({ level: "WARN", msg });
}

function error(msg) {
  errorCount++;
  results.push({ level: "ERROR", msg });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readFile(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function extractField(content, pattern) {
  if (!content) return null;
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function sectionHasContent(content, heading) {
  if (!content) return false;
  const pattern = new RegExp(
    `^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
    "m"
  );
  const match = content.match(pattern);
  if (!match) return false;
  const body = match[1].trim();
  if (!body) return false;
  // Check for placeholder-only content
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const placeholderPatterns = [
    /^\*To be populated/i,
    /^\*Nothing yet/i,
    /^\*Nothing currently/i,
    /^- \*To be populated/i,
    /^\| \*To be populated/i,
    /^N\/A/i,
    /^\(none/i,
    /^\(no changes/i,
  ];
  const nonPlaceholderLines = lines.filter(
    (l) => !placeholderPatterns.some((p) => p.test(l))
  );
  return nonPlaceholderLines.length > 0;
}

// ---------------------------------------------------------------------------
// Valid state transitions from SKILL.md
// ---------------------------------------------------------------------------

const VALID_STATES = new Set(["AUDIT", "PLAN", "EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);

const VALID_TRANSITIONS = new Set([
  "INIT->AUDIT",
  "AUDIT->PLAN",
  "PLAN->AUDIT",
  "PLAN->PLAN",
  "PLAN->EXECUTE",
  "EXECUTE->MEASURE",
  "MEASURE->CLOSE",
  "MEASURE->PIVOT",
  "MEASURE->AUDIT",
  "PIVOT->PLAN",
]);

function isValidTransition(from, to) {
  // Any state can transition to CLOSE (admin exit via bootstrap close)
  if (to === "CLOSE") return true;
  return VALID_TRANSITIONS.has(`${from}->${to}`);
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkActivePlan() {
  if (!existsSync(plansDir)) {
    error("plans/ directory does not exist");
    return null;
  }
  if (!existsSync(pointerFile)) {
    error("No .current_plan pointer file found");
    return null;
  }
  const pointer = readFile(pointerFile);
  if (!pointer || !pointer.trim()) {
    error(".current_plan pointer file is empty");
    return null;
  }
  const planDirName = pointer.trim();
  const planDir = join(plansDir, planDirName);
  if (!existsSync(planDir)) {
    error(`Plan directory does not exist: plans/${planDirName}`);
    return null;
  }
  pass(`Active plan exists: plans/${planDirName}`);
  return planDirName;
}

function checkRequiredFiles(planDirName) {
  const planDir = join(plansDir, planDirName);
  const requiredFiles = [
    "state.md",
    "plan.md",
    "decisions.md",
    "findings.md",
    "progress.md",
    "verification.md",
  ];
  let allPresent = true;
  for (const file of requiredFiles) {
    if (!existsSync(join(planDir, file))) {
      error(`Required file missing: ${file}`);
      allPresent = false;
    }
  }
  if (allPresent) {
    pass("Required files present (state.md, plan.md, decisions.md, findings.md, progress.md, verification.md)");
  }
}

function checkAuditDirectory(planDirName) {
  const auditDir = join(plansDir, planDirName, "audit");
  if (!existsSync(auditDir)) {
    error("audit/ directory missing");
    return;
  }
  const auditFiles = ["technical.md", "content.md", "backlinks.md", "competitors.md"];
  let missingCount = 0;
  for (const file of auditFiles) {
    if (!existsSync(join(auditDir, file))) {
      warn(`Audit report missing: ${file}`);
      missingCount++;
    }
  }
  if (missingCount === 0) {
    pass("Audit directory complete (technical.md, content.md, backlinks.md, competitors.md)");
  } else if (missingCount < 4) {
    pass(`Audit directory exists (${4 - missingCount}/4 reports present)`);
  }
}

function checkStateValidity(stateContent) {
  const currentState = extractField(stateContent, /^# Current State:\s*(.+)$/m);
  if (!currentState) {
    error("Cannot parse current state from state.md");
    return { state: null, iteration: null };
  }
  if (VALID_STATES.has(currentState)) {
    pass(`Current state is valid: ${currentState}`);
  } else {
    error(`Invalid state: "${currentState}" (must be one of: ${[...VALID_STATES].join(", ")})`);
  }

  const iterationStr = extractField(stateContent, /^## Iteration:\s*(.+)$/m);
  const iteration = iterationStr !== null ? parseInt(iterationStr, 10) : NaN;
  const step = extractField(stateContent, /^## Current Step:\s*(.+)$/m) || "N/A";

  return { state: currentState, iteration: isNaN(iteration) ? null : iteration, step };
}

function checkStateTransitions(stateContent) {
  if (!stateContent) return;
  // Parse transition history
  const historyMatch = stateContent.match(
    /^## Transition History:\s*\n([\s\S]*?)(?=\n## |$)/m
  );
  if (!historyMatch) {
    warn("No transition history found in state.md");
    return;
  }
  const historyBlock = historyMatch[1];
  // Match lines like "- INIT -> AUDIT (...)" or "- INIT --> AUDIT (...)" etc.
  const transitionLines = historyBlock.match(
    /^- (.+?)$/gm
  );
  if (!transitionLines || transitionLines.length === 0) {
    warn("Transition history is empty");
    return;
  }

  let allValid = true;
  const transitionPattern = /(\w+)\s*(?:->|-->|→)\s*(\w+)/;

  for (const line of transitionLines) {
    const raw = line.replace(/^- /, "");
    const match = raw.match(transitionPattern);
    if (!match) continue; // Non-transition line (description text)
    const from = match[1].toUpperCase();
    const to = match[2].toUpperCase();

    if (!isValidTransition(from, to)) {
      error(`Invalid transition: ${from} -> ${to} (line: "${raw.trim()}")`);
      allValid = false;
    }
  }
  if (allValid) {
    pass(`All ${transitionLines.length} state transitions are valid`);
  }
}

function checkPlanSections(planContent) {
  if (!planContent) {
    error("plan.md is empty or unreadable");
    return;
  }

  const requiredSections = ["Goal", "Steps", "Success Criteria", "Verification Strategy"];
  const optionalSections = [
    "Topical Map",
    "Content Calendar",
    "Technical Fix Priority List",
    "KPI Targets",
  ];

  let requiredMissing = [];
  for (const section of requiredSections) {
    if (!sectionHasContent(planContent, section)) {
      requiredMissing.push(section);
    }
  }
  if (requiredMissing.length === 0) {
    pass("Plan required sections present (Goal, Steps, Success Criteria, Verification Strategy)");
  } else {
    for (const section of requiredMissing) {
      error(`Plan missing required section or content: ${section}`);
    }
  }

  for (const section of optionalSections) {
    if (!sectionHasContent(planContent, section)) {
      warn(`Plan section not yet populated: ${section}`);
    }
  }
}

function checkFindingsCount(planDirName, currentState) {
  if (!currentState) return;
  const statesRequiringFindings = new Set(["PLAN", "EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);
  if (!statesRequiringFindings.has(currentState)) return;

  const findingsContent = readFile(join(plansDir, planDirName, "findings.md"));
  if (!findingsContent) {
    error("findings.md is empty or unreadable (required in PLAN+ states)");
    return;
  }

  // Count links in ## Index section
  const indexMatch = findingsContent.match(
    /^## Index\s*\n([\s\S]*?)(?=\n## |$)/m
  );
  let indexedFindings = 0;
  if (indexMatch) {
    const indexBody = indexMatch[1];
    const links = indexBody.match(/\[([^\]]+)\]\([^)]+\)/g);
    indexedFindings = links ? links.length : 0;
  }

  // Count completed audit reports
  const auditDir = join(plansDir, planDirName, "audit");
  let completedAudits = 0;
  const auditFiles = ["technical.md", "content.md", "backlinks.md", "competitors.md"];
  for (const file of auditFiles) {
    const content = readFile(join(auditDir, file));
    if (content) {
      // Consider an audit "completed" if it has content beyond the template
      const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("*"));
      if (lines.length > 5) completedAudits++;
    }
  }

  if (indexedFindings >= 3) {
    pass(`Findings count sufficient: ${indexedFindings} indexed findings`);
  } else if (completedAudits >= 2) {
    pass(`Findings coverage sufficient: ${completedAudits} completed audit reports`);
  } else {
    warn(`Low findings: ${indexedFindings} indexed findings, ${completedAudits} completed audit reports (need >=3 findings or >=2 audits)`);
  }
}

function checkProgressStructure(planDirName) {
  const progressContent = readFile(join(plansDir, planDirName, "progress.md"));
  if (!progressContent) {
    error("progress.md is empty or unreadable");
    return;
  }

  const requiredSections = ["Completed", "In Progress", "Remaining"];
  let allPresent = true;
  for (const section of requiredSections) {
    if (!progressContent.match(new RegExp(`^## ${section}`, "m"))) {
      error(`progress.md missing required section: ## ${section}`);
      allPresent = false;
    }
  }
  if (allPresent) {
    pass("Progress structure valid (Completed, In Progress, Remaining sections)");
  }
}

function checkIterationLimits(iteration) {
  if (iteration === null || iteration === undefined) {
    warn("Cannot determine iteration number from state.md");
    return;
  }
  if (iteration >= 5) {
    error(`Iteration ${iteration} exceeds hard limit (5+). Must decompose into sub-projects.`);
  } else if (iteration === 4) {
    warn(`Iteration ${iteration}: mandatory decomposition analysis required in decisions.md`);
  } else {
    pass(`Iteration ${iteration} within limits`);
  }
}

function checkCheckpoints(planDirName, iteration) {
  if (iteration === null || iteration < 2) return;
  const checkpointsDir = join(plansDir, planDirName, "checkpoints");
  if (!existsSync(checkpointsDir)) {
    warn("checkpoints/ directory missing (expected at iteration 2+)");
    return;
  }
  try {
    const files = readdirSync(checkpointsDir).filter((f) => f.endsWith(".md"));
    if (files.length === 0) {
      warn(`No checkpoint files found at iteration ${iteration} (expected at least one)`);
    } else {
      pass(`Checkpoint files present: ${files.length} found`);
    }
  } catch {
    warn("Cannot read checkpoints/ directory");
  }
}

function checkConsolidatedFiles() {
  const consolidatedFiles = [
    { name: "FINDINGS.md", label: "Consolidated findings" },
    { name: "DECISIONS.md", label: "Consolidated decisions" },
    { name: "LESSONS.md", label: "Lessons learned" },
    { name: "INDEX.md", label: "Sprint index" },
  ];
  let allPresent = true;
  for (const { name, label } of consolidatedFiles) {
    if (!existsSync(join(plansDir, name))) {
      warn(`${label} file missing: plans/${name}`);
      allPresent = false;
    }
  }
  if (allPresent) {
    pass("Consolidated files present (FINDINGS.md, DECISIONS.md, LESSONS.md, INDEX.md)");
  }
}

function checkChangeManifest(stateContent, currentState) {
  if (!currentState) return;
  const statesRequiringManifest = new Set(["EXECUTE", "MEASURE"]);
  if (!statesRequiringManifest.has(currentState)) return;

  const manifestMatch = stateContent.match(
    /^## Change Manifest[^\n]*\n([\s\S]*?)(?=\n## |$)/m
  );
  if (!manifestMatch) {
    warn("No Change Manifest section found in state.md (expected in EXECUTE/MEASURE)");
    return;
  }
  const manifestBody = manifestMatch[1].trim();
  // Check if it has real entries (not just the placeholder)
  const lines = manifestBody.split("\n").map((l) => l.trim()).filter(Boolean);
  const nonPlaceholder = lines.filter((l) => !l.includes("(no changes yet)") && !l.includes("(none"));
  if (nonPlaceholder.length > 0) {
    pass(`Change manifest has ${nonPlaceholder.length} entries`);
  } else {
    warn("Change manifest is empty (expected entries in EXECUTE/MEASURE state)");
  }
}

function checkComplexityBudget(planContent, currentState) {
  if (!currentState) return;
  const statesRequiringBudget = new Set(["EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);
  if (!statesRequiringBudget.has(currentState)) return;

  const budgetMatch = planContent
    ? planContent.match(/^## Complexity Budget[^\n]*\n([\s\S]*?)(?=\n## |$)/m)
    : null;
  if (!budgetMatch) {
    warn("No Complexity Budget section found in plan.md (expected in EXECUTE+ states)");
    return;
  }
  const budgetBody = budgetMatch[1].trim();
  // Check for populated entries (lines with numbers like "3/5" not "0/target")
  const populatedPattern = /\d+\/\d+/;
  if (populatedPattern.test(budgetBody)) {
    pass("Complexity Budget is populated");
  } else {
    warn("Complexity Budget section exists but may not be populated with real targets");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const planDirName = checkActivePlan();
  if (!planDirName) {
    printResults(planDirName);
    process.exit(1);
  }

  const stateContent = readFile(join(plansDir, planDirName, "state.md"));
  const planContent = readFile(join(plansDir, planDirName, "plan.md"));

  // Run all checks
  checkRequiredFiles(planDirName);
  checkAuditDirectory(planDirName);

  const { state: currentState, iteration, step } = stateContent
    ? checkStateValidity(stateContent)
    : { state: null, iteration: null, step: "N/A" };

  checkStateTransitions(stateContent);
  checkPlanSections(planContent);
  checkFindingsCount(planDirName, currentState);
  checkProgressStructure(planDirName);
  checkIterationLimits(iteration);
  checkCheckpoints(planDirName, iteration);
  checkConsolidatedFiles();
  checkChangeManifest(stateContent, currentState);
  checkComplexityBudget(planContent, currentState);

  printResults(planDirName, currentState, iteration, step);
  process.exit(errorCount > 0 ? 1 : 0);
}

function printResults(planDirName, currentState, iteration, step) {
  if (jsonMode) {
    const output = {
      plan: planDirName || null,
      state: currentState || null,
      iteration: iteration ?? null,
      step: step || null,
      results,
      summary: { pass: passCount, warn: warnCount, error: errorCount },
      ok: errorCount === 0,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Human-readable output
  if (planDirName) {
    const stateStr = currentState || "UNKNOWN";
    const iterStr = iteration !== null && iteration !== undefined ? iteration : "?";
    const stepStr = step || "N/A";
    console.log(`Validating: plans/${planDirName}`);
    console.log(`State: ${stateStr} | Sprint: ${iterStr} | Step: ${stepStr}`);
  } else {
    console.log("Validating: (no active plan)");
  }
  console.log();

  for (const r of results) {
    if (quietMode && r.level === "PASS") continue;
    const prefix = r.level === "PASS" ? "[PASS]" : r.level === "WARN" ? "[WARN]" : "[ERROR]";
    console.log(`${prefix} ${r.msg}`);
  }

  console.log();
  console.log(`Summary: ${passCount} PASS, ${warnCount} WARN, ${errorCount} ERROR`);
}

main();
