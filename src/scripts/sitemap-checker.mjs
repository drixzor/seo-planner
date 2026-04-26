#!/usr/bin/env node

/**
 * sitemap-checker.mjs
 *
 * Discovers and validates XML sitemaps for a given domain.
 * Checks common sitemap locations, parses robots.txt for Sitemap directives,
 * and spot-checks URLs for non-200 responses.
 *
 * Usage:
 *   node sitemap-checker.mjs https://example.com
 *
 * Exit codes:
 *   0  success (sitemap found or not -- report is always produced)
 *   1  bad arguments
 *   2  domain unreachable
 */

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const inputUrl = args.find((a) => !a.startsWith("--"));

if (!inputUrl) {
  console.error("Usage: node sitemap-checker.mjs <url>");
  console.error("  e.g. node sitemap-checker.mjs https://example.com");
  process.exit(1);
}

let baseUrl;
try {
  const parsed = new URL(inputUrl);
  baseUrl = `${parsed.protocol}//${parsed.host}`;
} catch {
  console.error(`Invalid URL: ${inputUrl}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIMEOUT_MS = 15_000;

async function safeFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SEO-Planner-SitemapChecker/1.0" },
      redirect: "follow",
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

async function fetchText(url) {
  const res = await safeFetch(url);
  if (!res || !res.ok) return null;
  return res.text();
}

/**
 * Minimal XML sitemap parser. Handles both <urlset> and <sitemapindex>.
 * No external dependency -- uses regex extraction which is sufficient for
 * well-formed sitemaps (virtually all real-world sitemaps).
 */
function parseSitemapXml(xml) {
  const result = { urls: [], sitemaps: [], isSitemapIndex: false };

  // Detect sitemap index
  if (/<sitemapindex[\s>]/i.test(xml)) {
    result.isSitemapIndex = true;
    const sitemapBlocks = xml.match(/<sitemap[\s>][\s\S]*?<\/sitemap>/gi) || [];
    for (const block of sitemapBlocks) {
      const loc = block.match(/<loc>\s*(.*?)\s*<\/loc>/i);
      const lastmod = block.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/i);
      if (loc) {
        result.sitemaps.push({
          loc: loc[1].trim(),
          lastmod: lastmod ? lastmod[1].trim() : null,
        });
      }
    }
    return result;
  }

  // Regular urlset
  const urlBlocks = xml.match(/<url[\s>][\s\S]*?<\/url>/gi) || [];
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>\s*(.*?)\s*<\/loc>/i);
    const lastmod = block.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/i);
    const changefreq = block.match(/<changefreq>\s*(.*?)\s*<\/changefreq>/i);
    const priority = block.match(/<priority>\s*(.*?)\s*<\/priority>/i);
    if (loc) {
      result.urls.push({
        loc: loc[1].trim(),
        lastmod: lastmod ? lastmod[1].trim() : null,
        changefreq: changefreq ? changefreq[1].trim() : null,
        priority: priority ? priority[1].trim() : null,
      });
    }
  }

  return result;
}

/**
 * Categorize a URL path into a bucket like /blog/, /product/, etc.
 */
function categorize(urlStr) {
  try {
    const path = new URL(urlStr).pathname;
    if (path === "/" || path === "") return "/  (homepage)";
    // Take the first path segment
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "/  (homepage)";
    return `/${segments[0]}/`;
  } catch {
    return "(unknown)";
  }
}

/**
 * Spot-check a list of URLs, return status results.
 */
async function spotCheck(urls, limit = 20) {
  const sample = urls.slice(0, limit);
  const results = [];

  // Run in parallel, 5 at a time
  const batchSize = 5;
  for (let i = 0; i < sample.length; i += batchSize) {
    const batch = sample.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const res = await safeFetch(url);
        return {
          url,
          status: res ? res.status : "unreachable",
          ok: res ? res.ok : false,
        };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

const SITEMAP_PATHS = [
  "/sitemap.xml",
  "/sitemap_index.xml",
  "/sitemap/sitemap.xml",
  "/wp-sitemap.xml",
  "/sitemap/index.xml",
];

async function discoverSitemaps() {
  const found = [];

  console.error(`Checking ${baseUrl} for sitemaps ...`);

  // 1. Check robots.txt for Sitemap: directives
  const robotsTxt = await fetchText(`${baseUrl}/robots.txt`);
  if (robotsTxt) {
    const sitemapLines = robotsTxt
      .split("\n")
      .filter((line) => /^Sitemap:\s*/i.test(line.trim()));
    for (const line of sitemapLines) {
      const sitemapUrl = line.replace(/^Sitemap:\s*/i, "").trim();
      if (sitemapUrl) {
        found.push({ url: sitemapUrl, source: "robots.txt" });
      }
    }
  }

  // 2. Check common paths
  const checks = await Promise.all(
    SITEMAP_PATHS.map(async (path) => {
      const fullUrl = `${baseUrl}${path}`;
      // Skip if already found via robots.txt
      if (found.some((f) => f.url === fullUrl)) return null;
      const res = await safeFetch(fullUrl);
      if (res && res.ok) {
        const contentType = res.headers.get("content-type") || "";
        // Accept XML or text responses that look like sitemaps
        if (
          contentType.includes("xml") ||
          contentType.includes("text/plain") ||
          contentType.includes("text/html")
        ) {
          const body = await res.text();
          if (/<urlset|<sitemapindex/i.test(body)) {
            return { url: fullUrl, source: `common path (${path})`, body };
          }
        }
      }
      return null;
    })
  );

  for (const result of checks) {
    if (result) found.push(result);
  }

  return found;
}

// ---------------------------------------------------------------------------
// Build Report
// ---------------------------------------------------------------------------

async function buildReport() {
  const lines = [];
  lines.push(`# Sitemap Report`);
  lines.push(``);
  lines.push(`**Domain:** ${baseUrl}`);
  lines.push(`**Date:** ${new Date().toISOString().replace("T", " ").slice(0, 19)}`);
  lines.push(``);

  // Check if domain is reachable at all
  const homeRes = await safeFetch(baseUrl);
  if (!homeRes) {
    console.error(`ERROR: ${baseUrl} is unreachable.`);
    lines.push(`## Error`);
    lines.push(``);
    lines.push(`The domain ${baseUrl} is unreachable. Cannot check for sitemaps.`);
    console.log(lines.join("\n"));
    process.exit(2);
  }

  // Discover sitemaps
  const sitemaps = await discoverSitemaps();

  if (sitemaps.length === 0) {
    lines.push(`## No Sitemap Found`);
    lines.push(``);
    lines.push(`No XML sitemap was found at any of the standard locations:`);
    for (const path of SITEMAP_PATHS) {
      lines.push(`- ${baseUrl}${path}`);
    }
    lines.push(`- robots.txt Sitemap: directive`);
    lines.push(``);
    lines.push(`### Recommendations`);
    lines.push(``);
    lines.push(`1. **Create an XML sitemap** at \`${baseUrl}/sitemap.xml\``);
    lines.push(`2. **Add a Sitemap directive** to \`${baseUrl}/robots.txt\`:`);
    lines.push(`   \`\`\``);
    lines.push(`   Sitemap: ${baseUrl}/sitemap.xml`);
    lines.push(`   \`\`\``);
    lines.push(`3. **Submit the sitemap** in Google Search Console`);
    lines.push(
      `4. If using a CMS (WordPress, Shopify, etc.), check if a sitemap plugin/feature is available`
    );
    lines.push(``);
    console.log(lines.join("\n"));
    return;
  }

  // Process each discovered sitemap
  lines.push(`## Sitemaps Found: ${sitemaps.length}`);
  lines.push(``);

  let totalUrls = 0;
  let allUrls = [];

  for (const sm of sitemaps) {
    lines.push(`### ${sm.url}`);
    lines.push(`**Source:** ${sm.source}`);
    lines.push(``);

    // Fetch if we don't already have the body
    const body = sm.body || (await fetchText(sm.url));
    if (!body) {
      lines.push(`Could not fetch sitemap content.`);
      lines.push(``);
      continue;
    }

    const parsed = parseSitemapXml(body);

    if (parsed.isSitemapIndex) {
      lines.push(`**Type:** Sitemap Index`);
      lines.push(`**Child sitemaps:** ${parsed.sitemaps.length}`);
      lines.push(``);
      lines.push(`| # | Child Sitemap | Last Modified |`);
      lines.push(`|---|---------------|---------------|`);
      parsed.sitemaps.forEach((s, i) => {
        lines.push(`| ${i + 1} | ${s.loc} | ${s.lastmod || "N/A"} |`);
      });
      lines.push(``);

      // Fetch child sitemaps (first 5 to keep it fast)
      const childLimit = 5;
      const childSitemaps = parsed.sitemaps.slice(0, childLimit);
      lines.push(
        `*Fetching first ${Math.min(childLimit, parsed.sitemaps.length)} child sitemaps for URL count ...*`
      );
      lines.push(``);

      for (const child of childSitemaps) {
        const childBody = await fetchText(child.loc);
        if (childBody) {
          const childParsed = parseSitemapXml(childBody);
          totalUrls += childParsed.urls.length;
          allUrls.push(...childParsed.urls);
        }
      }

      if (parsed.sitemaps.length > childLimit) {
        lines.push(
          `*(${parsed.sitemaps.length - childLimit} additional child sitemaps not fetched)*`
        );
        lines.push(``);
      }
    } else {
      lines.push(`**Type:** URL Set`);
      lines.push(`**URLs:** ${parsed.urls.length}`);
      totalUrls += parsed.urls.length;
      allUrls.push(...parsed.urls);
      lines.push(``);
    }
  }

  // -- URL Statistics ---
  lines.push(`## URL Statistics`);
  lines.push(``);
  lines.push(`**Total URLs found:** ${totalUrls}`);
  lines.push(``);

  if (allUrls.length > 0) {
    // Last modified distribution
    const withLastmod = allUrls.filter((u) => u.lastmod);
    if (withLastmod.length > 0) {
      const dates = withLastmod.map((u) => u.lastmod).sort();
      lines.push(`### Last Modified Dates`);
      lines.push(``);
      lines.push(`- **Oldest:** ${dates[0]}`);
      lines.push(`- **Newest:** ${dates[dates.length - 1]}`);
      lines.push(
        `- **URLs with lastmod:** ${withLastmod.length}/${allUrls.length} (${Math.round((withLastmod.length / allUrls.length) * 100)}%)`
      );
      lines.push(``);
    } else {
      lines.push(`No \`<lastmod>\` dates found in sitemap URLs.`);
      lines.push(
        `**Recommendation:** Add \`<lastmod>\` dates to help search engines prioritize crawling.`
      );
      lines.push(``);
    }

    // URL pattern distribution
    const patterns = {};
    for (const u of allUrls) {
      const cat = categorize(u.loc);
      patterns[cat] = (patterns[cat] || 0) + 1;
    }

    const sorted = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
    lines.push(`### URL Patterns`);
    lines.push(``);
    lines.push(`| Pattern | Count | % |`);
    lines.push(`|---------|-------|---|`);
    for (const [pattern, count] of sorted) {
      const pct = Math.round((count / allUrls.length) * 100);
      lines.push(`| ${pattern} | ${count} | ${pct}% |`);
    }
    lines.push(``);

    // Spot check
    lines.push(`### Spot Check (first 20 URLs)`);
    lines.push(``);
    console.error(`Spot-checking up to 20 URLs ...`);

    const spotResults = await spotCheck(
      allUrls.map((u) => u.loc),
      20
    );

    const nonOk = spotResults.filter((r) => !r.ok);

    if (nonOk.length === 0) {
      lines.push(
        `All ${spotResults.length} checked URLs returned 200 OK.`
      );
    } else {
      lines.push(
        `**${nonOk.length}/${spotResults.length} URLs returned non-200 status:**`
      );
      lines.push(``);
      lines.push(`| URL | Status |`);
      lines.push(`|-----|--------|`);
      for (const r of nonOk) {
        lines.push(`| ${r.url} | ${r.status} |`);
      }
      lines.push(``);
      lines.push(
        `**Recommendation:** Remove or update non-200 URLs in the sitemap.`
      );
    }
    lines.push(``);
  }

  // -- robots.txt info ---
  lines.push(`## robots.txt`);
  lines.push(``);
  const robotsTxt = await fetchText(`${baseUrl}/robots.txt`);
  if (robotsTxt) {
    const sitemapDirectives = robotsTxt
      .split("\n")
      .filter((l) => /^Sitemap:/i.test(l.trim()));
    if (sitemapDirectives.length > 0) {
      lines.push(`Sitemap directives found in robots.txt:`);
      for (const d of sitemapDirectives) {
        lines.push(`- \`${d.trim()}\``);
      }
    } else {
      lines.push(`robots.txt exists but has no Sitemap: directive.`);
      lines.push(`**Recommendation:** Add \`Sitemap: ${baseUrl}/sitemap.xml\` to robots.txt.`);
    }
  } else {
    lines.push(`No robots.txt found at ${baseUrl}/robots.txt.`);
    lines.push(`**Recommendation:** Create a robots.txt file with a Sitemap directive.`);
  }
  lines.push(``);

  // -- Footer ---
  lines.push(`---`);
  lines.push(`*Generated by sitemap-checker.mjs*`);

  console.log(lines.join("\n"));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

buildReport().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(2);
});
