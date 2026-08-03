#!/usr/bin/env node
// Requires Node.js 18+
//
// check-agent-wiring — executable gate for the PROSE layer: shipped agent
// prompts, SKILL.md, and the reference knowledge base. `make validate` already
// checks that SKILL.md's reference list resolves, but nothing checks the
// `references/<f>.md` citations scattered through the 8 agent prompts and the
// references that cross-cite each other. That layer rots silently — a renamed
// or deleted reference leaves dangling citations that no test catches (the
// GHOST constraint: absence of a checker == absence of errors).
//
// Rule: every `references/<file>.md` citation (outside fenced code blocks) must
// resolve to a real file in src/references/. Citations inside ``` fences are
// treated as examples and skipped.
//
// Anti-vacuity: the scanned file set is DISCOVERED at runtime (readdir), so a
// collapsed/renamed dir could shrink the walk and still print PASS over
// whatever's left. The CLI fails loud (`FAIL [scan-floor]`) if either scanned
// dir contributes zero .md files or the total sinks below EXPECTED_MIN_PROSE_FILES.
//
// Pure functions are exported for tests; the CLI runs only under isEntryPoint.
// Zero dependencies: node: builtins only.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

// Real count today: 20 (8 agents + SKILL.md + 11 references). Bump deliberately
// when the real count changes; the point is to catch a SILENT collapse, not to
// track the exact number.
export const EXPECTED_MIN_PROSE_FILES = 15;

const CITATION_RE = /references\/([a-z0-9][a-z0-9-]*)\.md/gi;

/** Split into lines tagged with fenced-code membership (1-based numbers). */
export function tagLines(text) {
  let fenced = false;
  return (text || "").split("\n").map((t, i) => {
    const isFence = /^\s*(```|~~~)/.test(t);
    if (isFence) fenced = !fenced;
    return { no: i + 1, text: t, fenced: isFence || fenced };
  });
}

/** Extract `references/<file>.md` citations (skipping fenced code) as {name,line,raw}. */
export function extractReferenceCitations(text) {
  const out = [];
  for (const line of tagLines(text)) {
    if (line.fenced) continue;
    for (const m of line.text.matchAll(CITATION_RE)) {
      out.push({ name: m[1].toLowerCase(), line: line.no, raw: m[0] });
    }
  }
  return out;
}

/**
 * Return citations that do not resolve against the known reference basenames.
 * @param {{name:string}[]} citations
 * @param {Set<string>} knownRefs - lowercased basenames without ".md"
 */
export function findUnresolved(citations, knownRefs) {
  return citations.filter((c) => !knownRefs.has(c.name));
}

const isEntryPoint = (() => {
  try {
    return process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  // Opt-in fixture-root override so tests can spawn the real CLI against a
  // fixture tree and exercise both PASS and FAIL branches. Importers see none
  // of this.
  const repoRoot =
    process.env.SEO_CHECK_AGENT_WIRING_ROOT ??
    join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const agentsDir = join(repoRoot, "src", "agents");
  const refsDir = join(repoRoot, "src", "references");
  const skillPath = join(repoRoot, "src", "SKILL.md");

  const mdFiles = (dir) => {
    try {
      return readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => join(dir, f));
    } catch {
      return [];
    }
  };

  const agentFiles = mdFiles(agentsDir);
  const refFiles = mdFiles(refsDir);
  const scanned = [...agentFiles, skillPath, ...refFiles];

  // Anti-vacuity floor.
  if (agentFiles.length === 0 || refFiles.length === 0 || scanned.length < EXPECTED_MIN_PROSE_FILES) {
    console.error(
      `check-agent-wiring: FAIL [scan-floor] — scanned ${scanned.length} files ` +
        `(agents=${agentFiles.length}, references=${refFiles.length}); ` +
        `expected >= ${EXPECTED_MIN_PROSE_FILES} with both dirs non-empty.`,
    );
    process.exit(1);
  }

  const knownRefs = new Set(refFiles.map((f) => basename(f, ".md").toLowerCase()));

  const issues = [];
  for (const file of scanned) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (err) {
      issues.push({ file, line: 0, message: `unreadable (${err.code ?? err.message})` });
      continue;
    }
    const unresolved = findUnresolved(extractReferenceCitations(text), knownRefs);
    for (const c of unresolved) {
      issues.push({ file, line: c.line, message: `unresolved citation ${c.raw}` });
    }
  }

  if (issues.length === 0) {
    console.log(
      `check-agent-wiring: PASS — all references/*.md citations resolve across ${scanned.length} prose files.`,
    );
    process.exit(0);
  }

  console.error(`check-agent-wiring: FAIL — ${issues.length} unresolved citation(s):`);
  for (const i of issues) {
    const rel = i.file.replace(repoRoot + "/", "");
    console.error(`  ${rel}:${i.line} — ${i.message}`);
  }
  process.exit(1);
}
