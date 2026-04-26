#!/usr/bin/env node

/**
 * lighthouse-audit.mjs
 *
 * Lightweight wrapper around Lighthouse CLI that produces a clean
 * Markdown (or JSON) report suitable for consumption by the SEO auditor agent.
 *
 * Usage:
 *   node lighthouse-audit.mjs https://example.com
 *   node lighthouse-audit.mjs https://example.com --output json
 *   node lighthouse-audit.mjs https://example.com --categories performance,seo
 *
 * Exit codes:
 *   0  success
 *   1  bad arguments / missing dependencies
 *   2  Lighthouse execution error
 */

import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function flag(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const url = args.find((a) => !a.startsWith("--"));
const outputFormat = flag("--output") || "md";
const categoriesRaw =
  flag("--categories") || "performance,seo,accessibility,best-practices";
const categories = categoriesRaw.split(",").map((c) => c.trim());

if (!url) {
  console.error(
    "Usage: node lighthouse-audit.mjs <url> [--output json|md] [--categories ...]"
  );
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Locate Lighthouse
// ---------------------------------------------------------------------------

/** Try to resolve a binary; returns its path or null. */
function which(bin) {
  return new Promise((resolve) => {
    execFile("which", [bin], (err, stdout) => {
      if (err) return resolve(null);
      resolve(stdout.trim());
    });
  });
}

async function findLighthouse() {
  // 1. Global install
  const global = await which("lighthouse");
  if (global) return { cmd: global, args: [] };

  // 2. npx (local or remote)
  const npx = await which("npx");
  if (npx) return { cmd: npx, args: ["--yes", "lighthouse"] };

  return null;
}

// ---------------------------------------------------------------------------
// Run Lighthouse
// ---------------------------------------------------------------------------

async function runLighthouse(lh) {
  const tmpFile = join(tmpdir(), `lh-${randomUUID()}.json`);

  const lhArgs = [
    ...lh.args,
    url,
    "--output=json",
    `--output-path=${tmpFile}`,
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--quiet",
    ...categories.map((c) => `--only-categories=${c}`),
  ];

  return new Promise((resolve, reject) => {
    const child = execFile(
      lh.cmd,
      lhArgs,
      { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 },
      async (err) => {
        if (err) {
          // Try to clean up temp file on error
          try {
            await unlink(tmpFile);
          } catch {
            /* ignore */
          }

          if (err.killed) {
            return reject(new Error("Lighthouse timed out after 120 seconds."));
          }
          if (/ENOENT|spawn/.test(err.message)) {
            return reject(
              new Error(
                "Chrome not found. Lighthouse requires a Chromium-based browser.\n" +
                  "Install Chrome or set CHROME_PATH environment variable."
              )
            );
          }
          return reject(
            new Error(`Lighthouse failed: ${err.message}`)
          );
        }

        try {
          const raw = await readFile(tmpFile, "utf-8");
          await unlink(tmpFile);
          resolve(JSON.parse(raw));
        } catch (readErr) {
          reject(
            new Error(
              `Failed to read Lighthouse output: ${readErr.message}`
            )
          );
        }
      }
    );

    child.stderr?.on("data", () => {
      /* swallow Lighthouse stderr noise */
    });
  });
}

// ---------------------------------------------------------------------------
// Core Web Vitals thresholds (per Google, 2024+)
// ---------------------------------------------------------------------------

const CWV_THRESHOLDS = {
  "largest-contentful-paint": { good: 2500, label: "LCP", unit: "ms" },
  "interaction-to-next-paint": { good: 200, label: "INP", unit: "ms" },
  "total-blocking-time": { good: 200, label: "TBT (proxy for INP)", unit: "ms" },
  "cumulative-layout-shift": { good: 0.1, label: "CLS", unit: "" },
  "first-contentful-paint": { good: 1800, label: "FCP", unit: "ms" },
  "speed-index": { good: 3400, label: "Speed Index", unit: "ms" },
};

// ---------------------------------------------------------------------------
// Markdown formatter
// ---------------------------------------------------------------------------

function scoreEmoji(score) {
  if (score >= 0.9) return "PASS";
  if (score >= 0.5) return "NEEDS WORK";
  return "FAIL";
}

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function formatMetricValue(id, numericValue) {
  if (id === "cumulative-layout-shift") return numericValue.toFixed(3);
  return formatMs(numericValue);
}

function buildMarkdown(report) {
  const lines = [];
  const ts = new Date(report.fetchTime).toISOString().replace("T", " ").slice(0, 19);

  lines.push(`# Lighthouse Audit Report`);
  lines.push(``);
  lines.push(`**URL:** ${report.finalDisplayedUrl || report.requestedUrl}`);
  lines.push(`**Date:** ${ts}`);
  lines.push(`**Device:** ${report.configSettings?.formFactor || "mobile"}`);
  lines.push(``);

  // -- Overall Scores ---
  lines.push(`## Overall Scores`);
  lines.push(``);
  lines.push(`| Category | Score | Verdict |`);
  lines.push(`|----------|-------|---------|`);

  const catMap = report.categories || {};
  for (const key of Object.keys(catMap)) {
    const cat = catMap[key];
    const pct = Math.round((cat.score ?? 0) * 100);
    lines.push(`| ${cat.title} | ${pct}/100 | ${scoreEmoji(cat.score)} |`);
  }
  lines.push(``);

  // -- Core Web Vitals ---
  lines.push(`## Core Web Vitals`);
  lines.push(``);
  lines.push(`| Metric | Value | Threshold | Verdict |`);
  lines.push(`|--------|-------|-----------|---------|`);

  const audits = report.audits || {};
  for (const [id, def] of Object.entries(CWV_THRESHOLDS)) {
    const audit = audits[id];
    if (!audit || audit.numericValue == null) continue;
    const val = audit.numericValue;
    const formatted = formatMetricValue(id, val);
    const threshFormatted =
      id === "cumulative-layout-shift"
        ? `<= ${def.good}`
        : `<= ${formatMs(def.good)}`;
    const pass =
      id === "cumulative-layout-shift"
        ? val <= def.good
        : val <= def.good;
    lines.push(
      `| ${def.label} | ${formatted} | ${threshFormatted} | ${pass ? "PASS" : "FAIL"} |`
    );
  }
  lines.push(``);

  // -- Top Opportunities ---
  const opportunities = Object.values(audits)
    .filter(
      (a) =>
        a.details?.type === "opportunity" &&
        a.details?.overallSavingsMs > 0 &&
        a.score !== null &&
        a.score < 1
    )
    .sort(
      (a, b) =>
        (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0)
    )
    .slice(0, 10);

  if (opportunities.length > 0) {
    lines.push(`## Top Opportunities (by estimated savings)`);
    lines.push(``);
    lines.push(`| # | Opportunity | Est. Savings |`);
    lines.push(`|---|-------------|-------------|`);
    opportunities.forEach((opp, i) => {
      const savings = formatMs(opp.details.overallSavingsMs);
      lines.push(`| ${i + 1} | ${opp.title} | ${savings} |`);
    });
    lines.push(``);
  }

  // -- Top Diagnostics ---
  const diagnostics = Object.values(audits)
    .filter(
      (a) =>
        a.details?.type === "table" &&
        a.score !== null &&
        a.score < 1 &&
        !opportunities.find((o) => o.id === a.id)
    )
    .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
    .slice(0, 10);

  if (diagnostics.length > 0) {
    lines.push(`## Top Diagnostics`);
    lines.push(``);
    lines.push(`| # | Diagnostic | Score |`);
    lines.push(`|---|------------|-------|`);
    diagnostics.forEach((d, i) => {
      const pct = Math.round((d.score ?? 0) * 100);
      lines.push(`| ${i + 1} | ${d.title} | ${pct}/100 |`);
    });
    lines.push(``);
  }

  // -- Mobile Usability ---
  const mobileAudits = [
    "viewport",
    "font-size",
    "tap-targets",
    "content-width",
  ];
  const mobileIssues = mobileAudits
    .map((id) => audits[id])
    .filter((a) => a && a.score !== null && a.score < 1);

  lines.push(`## Mobile Usability`);
  lines.push(``);
  if (mobileIssues.length === 0) {
    lines.push(`No mobile usability issues detected.`);
  } else {
    mobileIssues.forEach((a) => {
      lines.push(`- **${a.title}**: ${a.description?.split(".")[0] || "Issue detected"}`);
    });
  }
  lines.push(``);

  // -- Structured Data ---
  const sdAudit = audits["structured-data"];
  lines.push(`## Structured Data`);
  lines.push(``);
  if (sdAudit) {
    if (sdAudit.score === 1 || sdAudit.score === null) {
      lines.push(`Structured data validation passed (or not applicable).`);
    } else {
      lines.push(`**Issues found:**`);
      if (sdAudit.details?.items) {
        sdAudit.details.items.forEach((item) => {
          lines.push(`- ${item.description || item.snippet || JSON.stringify(item)}`);
        });
      } else {
        lines.push(`- ${sdAudit.displayValue || sdAudit.description || "Issue detected"}`);
      }
    }
  } else {
    lines.push(
      `Structured data audit not available in this Lighthouse run. ` +
        `Use schema-validator.mjs for detailed schema validation.`
    );
  }
  lines.push(``);

  // -- Footer ---
  lines.push(`---`);
  lines.push(
    `*Generated by lighthouse-audit.mjs | Lighthouse ${report.lighthouseVersion || "N/A"}*`
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const lh = await findLighthouse();

  if (!lh) {
    console.error(
      "Lighthouse is not installed.\n\n" +
        "Install it with one of:\n" +
        "  npm install -g lighthouse\n" +
        "  npx lighthouse <url>   (one-time download)\n\n" +
        "Lighthouse also requires Google Chrome or Chromium."
    );
    process.exit(1);
  }

  console.error(`Running Lighthouse audit on ${url} ...`);
  console.error(`Categories: ${categories.join(", ")}`);
  console.error(`Output: ${outputFormat}`);
  console.error(``);

  let report;
  try {
    report = await runLighthouse(lh);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);

    if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ERR_INVALID_URL/.test(err.message)) {
      console.error(`\nThe site at ${url} appears unreachable.`);
      console.error(`Check that the URL is correct and the site is online.`);
    }

    process.exit(2);
  }

  if (outputFormat === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(buildMarkdown(report));
  }
}

main();
