#!/usr/bin/env node
// Requires Node.js 18+
//
// check-readme-parity — executable gate verifying that the README version badge
// matches the VERSION file. (seo-planner has no test-count badge, so unlike the
// upstream iterative-planner gate this checks the version badge only.)
//
// Badge format parsed (as found in README.md):
//   [![Skill](https://img.shields.io/badge/Skill-v<VER>-green.svg)](VERSION)
//   regex: /Skill-v(\d+\.\d+\.\d+)-/
//
// Exports one pure function (importable without side effects — isEntryPoint
// guard). CLI reads VERSION + README.md from repo root; exits 0 on OK, 1 on any
// failure. A missing badge is a FAIL, not a skip.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Check that the README version badge matches the expected version string.
 * @param {string} readmeText - Full README.md content.
 * @param {string} version    - Expected version, e.g. "1.3.0".
 * @returns {{ ok: boolean, readmeVersion: string, expected: string }}
 *   `readmeVersion` is "" when no badge is found (ok: false).
 */
export function checkVersionBadge(readmeText, version) {
  const m = (readmeText || "").match(/Skill-v(\d+\.\d+\.\d+)-/);
  const readmeVersion = m ? m[1] : "";
  return { ok: readmeVersion === version, readmeVersion, expected: version };
}

const isEntryPoint = (() => {
  try {
    return process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

if (isEntryPoint) {
  // Opt-in fixture-root override so tests can spawn the real CLI FAIL branch.
  // Read inside isEntryPoint only — importers stay side-effect free.
  const repoRoot =
    process.env.SEO_CHECK_README_PARITY_ROOT ??
    join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const version = readFileSync(join(repoRoot, "VERSION"), "utf8").trim();
  const readmeText = readFileSync(join(repoRoot, "README.md"), "utf8");

  const result = checkVersionBadge(readmeText, version);

  if (result.ok) {
    console.log(
      `check-readme-parity: PASS version badge (v${result.readmeVersion} == v${result.expected})`,
    );
    process.exit(0);
  }

  if (result.readmeVersion === "") {
    console.error(
      "check-readme-parity: FAIL — no 'Skill-v<X.Y.Z>' version badge found in README.md",
    );
  } else {
    console.error(
      `check-readme-parity: FAIL version badge — README has v${result.readmeVersion}, expected v${result.expected}`,
    );
  }
  process.exit(1);
}
