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

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
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

/**
 * Extract a markdown section body by heading.
 * Finds "## heading" and returns everything until the next "## " or end of string.
 */
function extractSection(content, heading) {
  if (!content) return null;
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const headerIdx = content.search(new RegExp(`^## ${escapedHeading}`, "m"));
  if (headerIdx < 0) return null;
  const afterHeader = content.indexOf("\n", headerIdx);
  if (afterHeader < 0) return "";
  const bodyStart = afterHeader + 1;
  // Find next ## heading (not just "##" inside a word)
  const nextSection = content.indexOf("\n## ", bodyStart);
  const body = nextSection >= 0 ? content.slice(bodyStart, nextSection) : content.slice(bodyStart);
  return body;
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

const VALID_STATES = new Set(["AUDIT", "STRATEGIZE", "PLAN", "EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);

const VALID_TRANSITIONS = new Set([
  "INIT->AUDIT",
  // v1.2 transitions (preferred)
  "AUDIT->STRATEGIZE",
  "STRATEGIZE->AUDIT",
  "STRATEGIZE->STRATEGIZE",
  "STRATEGIZE->PLAN",
  "PLAN->STRATEGIZE",
  "PIVOT->STRATEGIZE",
  // v1.1 transitions (kept for backward compat with sprints predating v1.2)
  "AUDIT->PLAN",
  "PLAN->AUDIT",
  "PIVOT->PLAN",
  // Unchanged in v1.2
  "PLAN->PLAN",
  "PLAN->EXECUTE",
  "EXECUTE->MEASURE",
  "MEASURE->CLOSE",
  "MEASURE->PIVOT",
  "MEASURE->AUDIT",
]);

function isValidTransition(from, to) {
  // Any state can transition to CLOSE (admin exit via bootstrap close)
  if (to === "CLOSE") return true;
  return VALID_TRANSITIONS.has(`${from}->${to}`);
}

// ---------------------------------------------------------------------------
// Allowed severity labels for audit files
// ---------------------------------------------------------------------------

const ALLOWED_SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

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
  const historyBlock = extractSection(stateContent, "Transition History:");
  if (historyBlock === null) {
    warn("No transition history found in state.md");
    return;
  }
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

function checkStrategyFile(planDirName, currentState) {
  if (!currentState) return;
  const statesRequiringStrategy = new Set(["STRATEGIZE", "PLAN", "EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);
  if (!statesRequiringStrategy.has(currentState)) return;

  const strategyPath = join(plansDir, planDirName, "strategy.md");
  if (!existsSync(strategyPath)) {
    if (currentState === "STRATEGIZE") {
      error(`strategy.md missing (required in STRATEGIZE state — strategist's only output)`);
    } else {
      warn(`strategy.md missing in state ${currentState} — likely a v1.1 sprint. Run \`bootstrap.mjs migrate-v12\` to backfill before resuming.`);
    }
    return;
  }

  const strategyContent = readFile(strategyPath);
  if (!strategyContent) {
    error("strategy.md is empty or unreadable");
    return;
  }

  // Check for required strategy.md sections (v1.2)
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

  const missing = [];
  for (const section of requiredSections) {
    // Match either H2 heading or numbered H2 (e.g., "## 1. Wedge Thesis")
    const re = new RegExp(`^## (?:\\d+\\.\\s+)?${section.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "m");
    if (!re.test(strategyContent)) missing.push(section);
  }

  if (missing.length === 0) {
    pass("strategy.md has all 8 required sections");
  } else if (currentState === "STRATEGIZE") {
    error(`strategy.md missing required sections: ${missing.join(", ")}`);
  } else {
    warn(`strategy.md missing sections (likely migrated stub): ${missing.join(", ")}`);
  }

  // Check for at least one binding Strategy Gate (states post-STRATEGIZE)
  if (currentState !== "STRATEGIZE") {
    const hasBindingGate = /\bMandated action[^|]*\|[^|]*PIVOT\b/i.test(strategyContent) || /\| PIVOT \|/i.test(strategyContent);
    if (!hasBindingGate) {
      warn("strategy.md has no Strategy Gate row with Mandated action: PIVOT (binding gate). Strategy without binding gates is unfalsifiable.");
    }
  }
}

function checkFindingsCount(planDirName, currentState) {
  if (!currentState) return;
  const statesRequiringFindings = new Set(["STRATEGIZE", "PLAN", "EXECUTE", "MEASURE", "PIVOT", "CLOSE"]);
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
// NEW CHECK: Content quality validation for audit files
// ---------------------------------------------------------------------------

function checkAuditContentQuality(planDirName) {
  const auditDir = join(plansDir, planDirName, "audit");
  if (!existsSync(auditDir)) return;

  const auditFiles = ["technical.md", "content.md", "backlinks.md", "competitors.md"];
  let placeholderCount = 0;

  for (const file of auditFiles) {
    const filePath = join(auditDir, file);
    const content = readFile(filePath);
    if (!content) continue;

    const lines = content.split("\n");
    const nonEmptyLines = lines.filter((l) => l.trim());

    // Check 1: Too few non-empty lines = placeholder
    if (nonEmptyLines.length < 10) {
      warn(`Audit file audit/${file} appears to be placeholder only (fewer than 10 non-empty lines)`);
      placeholderCount++;
      continue;
    }

    // Check 2: All non-empty lines are headings, italics, or table borders
    const contentLines = nonEmptyLines.filter((l) => {
      const trimmed = l.trim();
      if (trimmed.startsWith("#")) return false;
      if (/^\*[^*]/.test(trimmed) && trimmed.endsWith("*")) return false; // italic line
      if (/^\|[-\s|:]+\|$/.test(trimmed)) return false; // table separator |---|---|
      return true;
    });

    if (contentLines.length < 3) {
      warn(`Audit file audit/${file} appears to be placeholder only (no substantive content)`);
      placeholderCount++;
      continue;
    }

    // Check 3: Issues Found table should have at least 1 data row
    const issuesTableMatch = content.match(
      /## Issues Found\s*\n([\s\S]*?)(?=\n## |$)/m
    );
    if (issuesTableMatch) {
      const tableBody = issuesTableMatch[1].trim();
      const tableLines = tableBody.split("\n").filter((l) => l.trim());
      // Filter out header row and separator row
      const dataRows = tableLines.filter((l) => {
        const trimmed = l.trim();
        if (!trimmed.startsWith("|")) return false;
        if (/^\|[-\s|:]+\|$/.test(trimmed)) return false; // separator
        if (/\|\s*#\s*\|/.test(trimmed)) return false; // header row with # column
        if (/\|\s*Issue\s*\|/.test(trimmed)) return false; // header row
        return true;
      });
      if (dataRows.length === 0) {
        warn(`Audit file audit/${file}: Issues Found table has no data rows`);
      }
    }

    // Check 4: Severity labels validation
    checkAuditSeverityLabels(content, file);
  }

  if (placeholderCount === 0) {
    pass("Audit files have substantive content (not placeholders)");
  }
}

// ---------------------------------------------------------------------------
// NEW CHECK: Severity classification in audit files
// ---------------------------------------------------------------------------

function checkAuditSeverityLabels(content, filename) {
  // Look for table rows in Issues Found section
  const issuesTableMatch = content.match(
    /## Issues Found\s*\n([\s\S]*?)(?=\n## |$)/m
  );
  if (!issuesTableMatch) return;

  const tableBody = issuesTableMatch[1].trim();
  const tableLines = tableBody.split("\n").filter((l) => l.trim().startsWith("|"));
  // Skip header and separator
  const dataRows = tableLines.filter((l) => {
    const trimmed = l.trim();
    if (/^\|[-\s|:]+\|$/.test(trimmed)) return false;
    if (/\|\s*#\s*\|/.test(trimmed) && /\|\s*Issue\s*\|/.test(trimmed)) return false;
    return true;
  });

  if (dataRows.length === 0) return;

  let hasAnySeverity = false;
  let hasInvalidSeverity = false;

  for (const row of dataRows) {
    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
    // Severity is typically in column 3 (0: #, 1: Issue, 2: Severity)
    if (cells.length >= 3) {
      const severityCell = cells[2].toUpperCase();
      if (ALLOWED_SEVERITIES.has(severityCell)) {
        hasAnySeverity = true;
      } else if (severityCell && severityCell !== "SEVERITY" && severityCell !== "") {
        // It has a value but not from the allowed set
        const isAllowed = [...ALLOWED_SEVERITIES].some((s) => severityCell.includes(s));
        if (!isAllowed && severityCell !== "PENDING") {
          hasInvalidSeverity = true;
        }
      }
    }
  }

  if (dataRows.length > 0 && !hasAnySeverity && !hasInvalidSeverity) {
    warn(`Audit audit/${filename}: issues missing severity classification (use CRITICAL/HIGH/MEDIUM/LOW)`);
  }
}

// ---------------------------------------------------------------------------
// NEW CHECK: Cross-file consistency
// ---------------------------------------------------------------------------

function checkCrossFileConsistency(planDirName) {
  const planContent = readFile(join(plansDir, planDirName, "plan.md"));
  const progressContent = readFile(join(plansDir, planDirName, "progress.md"));
  const decisionsContent = readFile(join(plansDir, planDirName, "decisions.md"));
  const stateContent = readFile(join(plansDir, planDirName, "state.md"));
  const verificationContent = readFile(join(plansDir, planDirName, "verification.md"));

  let issues = 0;

  // Check 1: Steps marked [x] in plan.md should have corresponding "Completed" entry in progress.md
  if (planContent && progressContent) {
    const stepsBody = extractSection(planContent, "Steps");
    if (stepsBody) {
      const completedSteps = stepsBody.match(/^[-*]\s*\[x\]\s*(.+)$/gmi) || [];

      const completedBody = extractSection(progressContent, "Completed") || "";

      for (const stepLine of completedSteps) {
        const stepText = stepLine.replace(/^[-*]\s*\[x\]\s*/i, "").trim();
        // Extract first meaningful words for matching (at least first 20 chars or first phrase)
        const matchPhrase = stepText.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (matchPhrase && !completedBody.match(new RegExp(matchPhrase.slice(0, 15), "i"))) {
          warn(`Step marked [x] in plan.md not found in progress.md Completed section: "${stepText.slice(0, 60)}"`);
          issues++;
        }
      }
    }
  }

  // Check 2: PIVOT in decisions.md should have PIVOT transition in state.md
  if (decisionsContent && stateContent) {
    const hasPivotDecision = /\bPIVOT\b/i.test(decisionsContent);
    if (hasPivotDecision) {
      const historyBody = extractSection(stateContent, "Transition History:") || "";
      const hasPivotTransition = /(?:->|-->|\u2192)\s*PIVOT/i.test(historyBody);
      if (!hasPivotTransition) {
        warn("PIVOT entry found in decisions.md but no PIVOT transition in state.md history");
        issues++;
      }
    }
  }

  // Check 3: Keyword targets in plan.md should have corresponding rows in verification.md
  if (planContent && verificationContent) {
    // Look for keyword mentions in plan Goal or KPI Targets
    const kpiBody = extractSection(planContent, "KPI Targets");
    if (kpiBody) {
      const hasKeywordRows = /\|\s*(?:Top 10 Keywords|Avg Position|Keywords?)\s*\|/i.test(kpiBody);
      if (hasKeywordRows) {
        const hasVerificationKeywords = /keyword/i.test(verificationContent);
        if (!hasVerificationKeywords) {
          warn("plan.md has keyword targets in KPI but verification.md has no keyword-related checks");
          issues++;
        }
      }
    }
  }

  if (issues === 0) {
    pass("Cross-file consistency checks passed");
  }
}

// ---------------------------------------------------------------------------
// NEW CHECK: Dependency enforcement
// ---------------------------------------------------------------------------

function parsePlanSteps(planContent) {
  if (!planContent) return [];

  const stepsBody = extractSection(planContent, "Steps");
  if (!stepsBody) return [];
  const stepLines = stepsBody.match(/^[-*]\s*\[[ x]\]\s*.+$/gmi) || [];

  const steps = [];
  let stepNum = 0;

  for (const line of stepLines) {
    stepNum++;
    const completed = /\[x\]/i.test(line);
    const text = line.replace(/^[-*]\s*\[[ x]\]\s*/i, "").trim();

    // Parse [deps: N,M] pattern
    const depsMatch = text.match(/\[deps?:\s*([^\]]+)\]/i);
    const deps = [];
    if (depsMatch) {
      const depsStr = depsMatch[1];
      for (const d of depsStr.split(",")) {
        const num = parseInt(d.trim(), 10);
        if (!isNaN(num)) deps.push(num);
      }
    }

    // Try to extract explicit step number like "1." or "Step 1:"
    const explicitNum = text.match(/^(\d+)[.:)\s]/);
    const id = explicitNum ? parseInt(explicitNum[1], 10) : stepNum;

    steps.push({ id, completed, text, deps });
  }

  return steps;
}

function checkDependencyEnforcement(planContent) {
  const steps = parsePlanSteps(planContent);
  if (steps.length === 0) return;

  const completedIds = new Set(steps.filter((s) => s.completed).map((s) => s.id));
  let violations = 0;

  for (const step of steps) {
    if (!step.completed) continue;
    if (step.deps.length === 0) continue;

    for (const dep of step.deps) {
      if (!completedIds.has(dep)) {
        error(`Step ${step.id} completed before dependency ${dep}: "${step.text.slice(0, 60)}"`);
        violations++;
      }
    }
  }

  if (violations === 0 && steps.some((s) => s.deps.length > 0)) {
    pass("Dependency enforcement: all completed steps have their dependencies met");
  }
}

// ---------------------------------------------------------------------------
// NEW CHECK: Momentum/oscillation detection (pivot counting)
// ---------------------------------------------------------------------------

function checkMomentumOscillation(stateContent) {
  if (!stateContent) return;

  const historyBody = extractSection(stateContent, "Transition History:");
  if (!historyBody) return;
  const transitionPattern = /(\w+)\s*(?:->|-->|→)\s*(\w+)/g;

  let pivotCount = 0;
  let match;
  while ((match = transitionPattern.exec(historyBody)) !== null) {
    const to = match[2].toUpperCase();
    if (to === "PIVOT") {
      pivotCount++;
    }
  }

  if (pivotCount >= 3) {
    error(`Excessive pivots: ${pivotCount} (3+). Sprint must be decomposed into smaller sprints.`);
  } else if (pivotCount >= 2) {
    warn(`Oscillation detected: ${pivotCount} pivots in this sprint. Consider decomposing.`);
  } else {
    pass(`Pivot count OK: ${pivotCount}`);
  }
}

// ---------------------------------------------------------------------------
// NEW CHECK: LESSONS.md health check
// ---------------------------------------------------------------------------

function checkLessonsHealth(planDirName, currentState) {
  const lessonsPath = join(plansDir, "LESSONS.md");
  if (!existsSync(lessonsPath)) return;

  const lessonsContent = readFile(lessonsPath);
  if (!lessonsContent) return;

  const lineCount = lessonsContent.split("\n").length;
  if (lineCount > 200) {
    warn(`LESSONS.md exceeds 200-line cap (currently ${lineCount} lines)`);
  }

  // If sprint is at CLOSE, check if LESSONS.md was updated this sprint
  if (currentState === "CLOSE") {
    try {
      const stat = statSync(lessonsPath);
      const planDir = join(plansDir, planDirName);
      const stateStat = statSync(join(planDir, "state.md"));
      // If LESSONS.md was last modified before state.md (i.e. before the close transition),
      // it likely wasn't updated this sprint. Use a 60-second grace period.
      const timeDiff = stateStat.mtimeMs - stat.mtimeMs;
      if (timeDiff > 60000) {
        warn("LESSONS.md not updated during CLOSE (last modified before sprint close)");
      }
    } catch {
      // Cannot stat files -- skip this check
    }
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

  // Run all original checks
  checkRequiredFiles(planDirName);
  checkAuditDirectory(planDirName);

  const { state: currentState, iteration, step } = stateContent
    ? checkStateValidity(stateContent)
    : { state: null, iteration: null, step: "N/A" };

  checkStateTransitions(stateContent);
  checkStrategyFile(planDirName, currentState);
  checkPlanSections(planContent);
  checkFindingsCount(planDirName, currentState);
  checkProgressStructure(planDirName);
  checkIterationLimits(iteration);
  checkCheckpoints(planDirName, iteration);
  checkConsolidatedFiles();
  checkChangeManifest(stateContent, currentState);
  checkComplexityBudget(planContent, currentState);

  // New checks
  checkAuditContentQuality(planDirName);
  checkCrossFileConsistency(planDirName);
  checkDependencyEnforcement(planContent);
  checkMomentumOscillation(stateContent);
  checkLessonsHealth(planDirName, currentState);

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
  const statusLine = errorCount === 0 ? "HEALTHY" : "UNHEALTHY";
  console.log(`Status: ${statusLine}`);
  console.log(`Summary: ${passCount} PASS, ${warnCount} WARN, ${errorCount} ERROR`);
}

main();
