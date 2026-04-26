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
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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

const input = args.find((a) => !a.startsWith("--"));
const outputFormat = flag("--output") || "md";
const categoriesRaw =
  flag("--categories") || "performance,seo,accessibility,best-practices";
const categories = categoriesRaw.split(",").map((c) => c.trim());

if (!input) {
  console.error(
    "Usage: node lighthouse-audit.mjs <url-or-file> [--output json|md] [--categories ...]"
  );
  console.error(
    "  e.g. node lighthouse-audit.mjs https://example.com"
  );
  console.error(
    "  e.g. node lighthouse-audit.mjs ./index.html   (static analysis fallback)"
  );
  process.exit(1);
}

// Determine if input is a URL or a local file path
let url = null;
let localFilePath = null;

try {
  new URL(input);
  url = input;
} catch {
  // Not a valid URL — check if it's a local file
  const resolved = resolve(input);
  if (existsSync(resolved)) {
    localFilePath = resolved;
  } else {
    console.error(`Invalid URL and file not found: ${input}`);
    process.exit(1);
  }
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
// Static Analysis Fallback (when Lighthouse/Chrome is not available)
// ---------------------------------------------------------------------------

/**
 * Performs a basic static analysis of a local HTML file, checking for common
 * SEO and performance issues without requiring Lighthouse or Chrome.
 */
async function runStaticAnalysis(filePath) {
  const html = await readFile(filePath, "utf-8");
  const lines = [];
  const issues = [];
  const passes = [];

  lines.push(`# Limited Audit (no Lighthouse)`);
  lines.push(``);
  lines.push(`**File:** ${filePath}`);
  lines.push(
    `**Date:** ${new Date().toISOString().replace("T", " ").slice(0, 19)}`
  );
  lines.push(`**Mode:** Static HTML analysis (Lighthouse not available)`);
  lines.push(``);
  lines.push(`> For full Lighthouse audit, install: npm install -g lighthouse`);
  lines.push(``);

  // --- Total HTML size ---
  const htmlSizeKB = (Buffer.byteLength(html, "utf-8") / 1024).toFixed(1);
  lines.push(`## Page Size`);
  lines.push(``);
  lines.push(`**Total HTML size:** ${htmlSizeKB} KB`);
  if (parseFloat(htmlSizeKB) > 100) {
    issues.push(`HTML document is ${htmlSizeKB} KB (target < 100 KB for initial HTML)`);
  }
  lines.push(``);

  // --- Render-blocking resources ---
  lines.push(`## Render-Blocking Resources`);
  lines.push(``);

  // Script tags in <head> without defer or async
  const headMatch = html.match(/<head[\s>][\s\S]*?<\/head>/i);
  const headContent = headMatch ? headMatch[0] : "";
  const scriptTagsInHead =
    headContent.match(/<script\b[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi) || [];
  const blockingScripts = scriptTagsInHead.filter(
    (tag) => !/\b(defer|async)\b/i.test(tag)
  );

  if (blockingScripts.length > 0) {
    issues.push(
      `${blockingScripts.length} render-blocking script(s) in <head> (missing defer/async)`
    );
    lines.push(
      `**${blockingScripts.length} render-blocking script(s) found in \`<head>\`:**`
    );
    lines.push(``);
    for (const tag of blockingScripts) {
      const src = tag.match(/src\s*=\s*["']([^"']+)["']/i);
      lines.push(`- \`${src ? src[1] : tag}\``);
    }
    lines.push(``);
    lines.push(
      `**Fix:** Add \`defer\` or \`async\` attribute to these script tags, or move them to the end of \`<body>\`.`
    );
  } else {
    passes.push(`No render-blocking scripts in <head>`);
    lines.push(`No render-blocking scripts found in \`<head>\`. Good.`);
  }
  lines.push(``);

  // --- Unoptimized images ---
  lines.push(`## Image Optimization`);
  lines.push(``);

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgsWithoutDimensions = imgTags.filter(
    (tag) => !/\bwidth\s*=/i.test(tag) || !/\bheight\s*=/i.test(tag)
  );
  const imgsWithoutLazy = imgTags.filter(
    (tag) => !/loading\s*=\s*["']lazy["']/i.test(tag)
  );
  const imgSrcs = imgTags
    .map((tag) => {
      const m = tag.match(/src\s*=\s*["']([^"']+)["']/i);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  const nonOptimalFormats = imgSrcs.filter(
    (src) => !/\.(webp|avif|svg)(\?|$)/i.test(src)
  );

  if (imgTags.length === 0) {
    lines.push(`No \`<img>\` tags found.`);
  } else {
    lines.push(`**Total images:** ${imgTags.length}`);
    lines.push(``);

    if (imgsWithoutDimensions.length > 0) {
      issues.push(
        `${imgsWithoutDimensions.length}/${imgTags.length} images missing width/height attributes (causes CLS)`
      );
      lines.push(
        `- ${imgsWithoutDimensions.length}/${imgTags.length} images missing \`width\`/\`height\` attributes (causes CLS)`
      );
    } else {
      passes.push(`All images have width/height attributes`);
      lines.push(`- All images have \`width\`/\`height\` attributes. Good.`);
    }

    if (imgsWithoutLazy.length > 0) {
      issues.push(
        `${imgsWithoutLazy.length}/${imgTags.length} images missing loading="lazy"`
      );
      lines.push(
        `- ${imgsWithoutLazy.length}/${imgTags.length} images missing \`loading="lazy"\` (first/hero image should NOT be lazy)`
      );
    } else {
      passes.push(`All images have loading="lazy"`);
      lines.push(`- All images have \`loading="lazy"\`.`);
    }

    if (nonOptimalFormats.length > 0) {
      issues.push(
        `${nonOptimalFormats.length}/${imgSrcs.length} images not in WebP/AVIF format`
      );
      lines.push(
        `- ${nonOptimalFormats.length}/${imgSrcs.length} image source(s) not in WebP/AVIF format`
      );
    } else {
      passes.push(`All images use modern formats (WebP/AVIF/SVG)`);
      lines.push(`- All images use modern formats (WebP/AVIF/SVG). Good.`);
    }
  }
  lines.push(``);

  // --- Viewport meta tag ---
  lines.push(`## Meta Tags`);
  lines.push(``);

  const hasViewport =
    /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html);
  if (!hasViewport) {
    issues.push(`Missing viewport meta tag (critical for mobile)`);
    lines.push(
      `- **MISSING:** \`<meta name="viewport">\` -- critical for mobile rendering`
    );
  } else {
    passes.push(`Viewport meta tag present`);
    lines.push(`- Viewport meta tag: present. Good.`);
  }

  // --- Meta description ---
  const hasMetaDesc =
    /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i.test(html);
  if (!hasMetaDesc) {
    issues.push(`Missing meta description tag`);
    lines.push(
      `- **MISSING:** \`<meta name="description">\` -- important for SERP CTR`
    );
  } else {
    passes.push(`Meta description present`);
    lines.push(`- Meta description: present. Good.`);
  }

  // --- Canonical link ---
  const hasCanonical = /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i.test(
    html
  );
  if (!hasCanonical) {
    issues.push(`Missing canonical link tag`);
    lines.push(
      `- **MISSING:** \`<link rel="canonical">\` -- needed to prevent duplicate content issues`
    );
  } else {
    passes.push(`Canonical link tag present`);
    lines.push(`- Canonical link: present. Good.`);
  }
  lines.push(``);

  // --- Inline styles ---
  lines.push(`## Inline Styles`);
  lines.push(``);

  const inlineStyles = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || [];
  let totalInlineStyleBytes = 0;
  for (const block of inlineStyles) {
    totalInlineStyleBytes += Buffer.byteLength(block, "utf-8");
  }
  const inlineStyleKB = (totalInlineStyleBytes / 1024).toFixed(1);

  if (inlineStyles.length === 0) {
    lines.push(`No inline \`<style>\` blocks found.`);
  } else {
    lines.push(
      `**${inlineStyles.length} inline \`<style>\` block(s)** totaling ${inlineStyleKB} KB`
    );
    if (totalInlineStyleBytes > 5 * 1024) {
      issues.push(
        `Inline styles exceed 5 KB (${inlineStyleKB} KB) -- consider externalizing`
      );
      lines.push(
        `**Warning:** Inline styles exceed 5 KB. Consider moving to external stylesheet.`
      );
    }
  }
  lines.push(``);

  // --- Summary ---
  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Category | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| Issues found | ${issues.length} |`);
  lines.push(`| Checks passed | ${passes.length} |`);
  lines.push(``);

  if (issues.length > 0) {
    lines.push(`### Issues`);
    lines.push(``);
    for (const issue of issues) {
      lines.push(`- ${issue}`);
    }
    lines.push(``);
  }

  if (passes.length > 0) {
    lines.push(`### Passed`);
    lines.push(``);
    for (const pass of passes) {
      lines.push(`- ${pass}`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(
    `*Generated by lighthouse-audit.mjs (static analysis fallback) | For full Lighthouse audit, install: npm install -g lighthouse*`
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // If a local file was provided directly, run static analysis
  if (localFilePath) {
    console.error(`Running static HTML analysis on ${localFilePath} ...`);
    console.error(`(Lighthouse requires a URL — using static analysis mode for local files)`);
    console.error(``);
    const report = await runStaticAnalysis(localFilePath);
    console.log(report);
    return;
  }

  const lh = await findLighthouse();

  if (!lh) {
    console.error(
      "Lighthouse is not installed and no local file was provided.\n\n" +
        "Options:\n" +
        "  1. Install Lighthouse:  npm install -g lighthouse\n" +
        "  2. Use static analysis: node lighthouse-audit.mjs ./index.html\n\n" +
        "Lighthouse also requires Google Chrome or Chromium.\n" +
        "For full Lighthouse audit, install: npm install -g lighthouse"
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

    // Attempt static analysis fallback if there's a local index.html
    const fallbackPaths = ["./index.html", "./public/index.html", "./dist/index.html", "./out/index.html"];
    for (const fp of fallbackPaths) {
      const resolved = resolve(fp);
      if (existsSync(resolved)) {
        console.error(
          `\nFalling back to static analysis of ${resolved} ...`
        );
        console.error(
          `For full Lighthouse audit, install: npm install -g lighthouse`
        );
        const fallbackReport = await runStaticAnalysis(resolved);
        console.log(fallbackReport);
        return;
      }
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
