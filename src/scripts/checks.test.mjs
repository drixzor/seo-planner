#!/usr/bin/env node
// Test suite for the parity/wiring gates:
//   check-changelog-parity.mjs, check-readme-parity.mjs, check-agent-wiring.mjs
//
// Two layers per gate:
//   1. Pure-function unit tests (imported — the scripts guard side effects
//      behind isEntryPoint, so importing is safe).
//   2. Real-CLI spawn tests that prove BOTH the exit-0 (PASS) and exit-1 (FAIL)
//      branches against throwaway fixture roots via the SEO_CHECK_*_ROOT env
//      override. A gate that can only be observed passing is not trusted here:
//      the anti-vacuity discipline requires each gate to be shown RED.
//
// Usage: node --test checks.test.mjs   (Node.js 18+)

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { checkChangelogVersion } from "./check-changelog-parity.mjs";
import { checkVersionBadge } from "./check-readme-parity.mjs";
import {
  extractReferenceCitations,
  findUnresolved,
  tagLines,
} from "./check-agent-wiring.mjs";

const script = (name) => fileURLToPath(new URL(`./${name}`, import.meta.url));

/** Run a gate CLI against a fixture root; return { code, stdout, stderr }. */
function runGate(name, envVar, root) {
  const res = spawnSync(process.execPath, [script(name)], {
    env: { ...process.env, [envVar]: root },
    encoding: "utf8",
  });
  return { code: res.status, stdout: res.stdout || "", stderr: res.stderr || "" };
}

// ---------------------------------------------------------------------------
// check-changelog-parity
// ---------------------------------------------------------------------------

describe("check-changelog-parity: pure", () => {
  it("matches the first release entry, skipping [Unreleased]", () => {
    const cl = "# Changelog\n\n## [Unreleased]\n\n## [1.3.0] - 2026-08-03\n\n## [1.2.0] - 2026-04-28\n";
    assert.deepStrictEqual(checkChangelogVersion(cl, "1.3.0"), {
      ok: true,
      changelogVersion: "1.3.0",
      expected: "1.3.0",
    });
  });

  it("fails on version mismatch", () => {
    const cl = "## [1.2.0] - 2026-04-28\n";
    assert.strictEqual(checkChangelogVersion(cl, "1.3.0").ok, false);
  });

  it("fails (empty changelogVersion) when no release entry exists", () => {
    const r = checkChangelogVersion("# Changelog\n\n## [Unreleased]\n", "1.3.0");
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.changelogVersion, "");
  });
});

describe("check-changelog-parity: CLI", () => {
  let root;
  before(() => {
    root = mkdtempSync(join(tmpdir(), "seo-cl-"));
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("exits 0 when CHANGELOG top entry matches VERSION", () => {
    writeFileSync(join(root, "VERSION"), "9.9.9\n");
    writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## [Unreleased]\n\n## [9.9.9] - 2026-08-03\n");
    const r = runGate("check-changelog-parity.mjs", "SEO_CHECK_CHANGELOG_PARITY_ROOT", root);
    assert.strictEqual(r.code, 0, r.stderr);
  });

  it("exits 1 (RED) when CHANGELOG top entry != VERSION", () => {
    writeFileSync(join(root, "VERSION"), "9.9.9\n");
    writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## [1.0.0] - 2026-01-01\n");
    const r = runGate("check-changelog-parity.mjs", "SEO_CHECK_CHANGELOG_PARITY_ROOT", root);
    assert.strictEqual(r.code, 1);
    assert.match(r.stderr, /FAIL/);
  });
});

// ---------------------------------------------------------------------------
// check-readme-parity
// ---------------------------------------------------------------------------

describe("check-readme-parity: pure", () => {
  it("matches the Skill version badge", () => {
    const readme = "[![Skill](https://img.shields.io/badge/Skill-v1.3.0-green.svg)](VERSION)";
    assert.strictEqual(checkVersionBadge(readme, "1.3.0").ok, true);
  });
  it("fails on mismatch", () => {
    const readme = "Skill-v1.2.0-green.svg";
    assert.strictEqual(checkVersionBadge(readme, "1.3.0").ok, false);
  });
  it("fails (empty) when no badge present", () => {
    const r = checkVersionBadge("no badge here", "1.3.0");
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.readmeVersion, "");
  });
});

describe("check-readme-parity: CLI", () => {
  let root;
  before(() => {
    root = mkdtempSync(join(tmpdir(), "seo-rm-"));
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("exits 0 when badge matches VERSION", () => {
    writeFileSync(join(root, "VERSION"), "9.9.9\n");
    writeFileSync(join(root, "README.md"), "[![Skill](https://img.shields.io/badge/Skill-v9.9.9-green.svg)](VERSION)\n");
    const r = runGate("check-readme-parity.mjs", "SEO_CHECK_README_PARITY_ROOT", root);
    assert.strictEqual(r.code, 0, r.stderr);
  });

  it("exits 1 (RED) when badge != VERSION", () => {
    writeFileSync(join(root, "VERSION"), "9.9.9\n");
    writeFileSync(join(root, "README.md"), "[![Skill](https://img.shields.io/badge/Skill-v0.0.1-green.svg)](VERSION)\n");
    const r = runGate("check-readme-parity.mjs", "SEO_CHECK_README_PARITY_ROOT", root);
    assert.strictEqual(r.code, 1);
    assert.match(r.stderr, /FAIL/);
  });
});

// ---------------------------------------------------------------------------
// check-agent-wiring
// ---------------------------------------------------------------------------

describe("check-agent-wiring: pure", () => {
  it("extracts references/*.md citations and skips fenced code", () => {
    const text = [
      "See `references/technical-seo.md` for details.",
      "```",
      "example: references/not-a-real-citation.md",
      "```",
      "Also references/geo-optimization.md applies.",
    ].join("\n");
    const cites = extractReferenceCitations(text);
    const names = cites.map((c) => c.name);
    assert.deepStrictEqual(names, ["technical-seo", "geo-optimization"]);
  });

  it("findUnresolved flags citations with no matching reference file", () => {
    const cites = extractReferenceCitations("references/real.md and references/ghost.md");
    const known = new Set(["real"]);
    const unresolved = findUnresolved(cites, known);
    assert.strictEqual(unresolved.length, 1);
    assert.strictEqual(unresolved[0].name, "ghost");
  });

  it("tagLines marks fenced regions", () => {
    const tagged = tagLines("a\n```\nb\n```\nc");
    assert.strictEqual(tagged[0].fenced, false);
    assert.strictEqual(tagged[2].fenced, true);
    assert.strictEqual(tagged[4].fenced, false);
  });
});

describe("check-agent-wiring: CLI", () => {
  let root;
  before(() => {
    // Build a fixture tree with enough files to clear the anti-vacuity floor.
    root = mkdtempSync(join(tmpdir(), "seo-wire-"));
    const agents = join(root, "src", "agents");
    const refs = join(root, "src", "references");
    mkdirSync(agents, { recursive: true });
    mkdirSync(refs, { recursive: true });
    // 12 references, 8 agents, 1 SKILL.md = 21 files (> floor of 15).
    for (let i = 0; i < 12; i++) writeFileSync(join(refs, `ref-${i}.md`), `# ref ${i}\n`);
    for (let i = 0; i < 8; i++) {
      writeFileSync(join(agents, `agent-${i}.md`), "See `references/ref-0.md`.\n");
    }
    writeFileSync(join(root, "src", "SKILL.md"), "Uses `references/ref-1.md`.\n");
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("exits 0 when every citation resolves", () => {
    const r = runGate("check-agent-wiring.mjs", "SEO_CHECK_AGENT_WIRING_ROOT", root);
    assert.strictEqual(r.code, 0, r.stderr);
  });

  it("exits 1 (RED) on a dangling references/*.md citation", () => {
    writeFileSync(join(root, "src", "agents", "agent-0.md"), "Broken `references/does-not-exist.md`.\n");
    const r = runGate("check-agent-wiring.mjs", "SEO_CHECK_AGENT_WIRING_ROOT", root);
    assert.strictEqual(r.code, 1);
    assert.match(r.stderr, /unresolved citation references\/does-not-exist\.md/);
  });

  it("exits 1 [scan-floor] (RED) when the scanned set is silently collapsed", () => {
    const tiny = mkdtempSync(join(tmpdir(), "seo-wire-tiny-"));
    mkdirSync(join(tiny, "src", "agents"), { recursive: true });
    mkdirSync(join(tiny, "src", "references"), { recursive: true });
    writeFileSync(join(tiny, "src", "agents", "only.md"), "# only\n");
    writeFileSync(join(tiny, "src", "SKILL.md"), "# skill\n");
    // references/ is empty -> floor trips.
    const r = runGate("check-agent-wiring.mjs", "SEO_CHECK_AGENT_WIRING_ROOT", tiny);
    rmSync(tiny, { recursive: true, force: true });
    assert.strictEqual(r.code, 1);
    assert.match(r.stderr, /scan-floor/);
  });
});
