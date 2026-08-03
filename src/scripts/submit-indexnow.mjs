#!/usr/bin/env node

/**
 * submit-indexnow.mjs
 *
 * Notify IndexNow-participating search engines (Bing, Yandex, Seznam, Naver, Yep)
 * that a site's URLs have changed, so they recrawl sooner. This is the fastest
 * lever for indexation on non-Google engines — and because ChatGPT search
 * retrieval leans on Bing's index, faster Bing coverage compounds into AI answer
 * visibility. Google does NOT participate in IndexNow; keep using Search Console
 * and the sitemap for Google.
 *
 * Source of truth is the live sitemap.xml: we fetch it and forward its <loc> URLs
 * to IndexNow, so this never drifts from what is actually published. Add a page to
 * the sitemap and it is picked up here for free.
 *
 * Prereq: the key file must be LIVE at keyLocation (https://host/<key>.txt) BEFORE
 * you run this, or engines return 403 during async validation. Deploy first, then
 * submit. Run submit-indexnow.mjs with no --key to generate a key + setup steps.
 *
 * Usage:
 *   node submit-indexnow.mjs https://example.com --key <32-hex-key>
 *   node submit-indexnow.mjs https://example.com                 # no key -> print setup
 *   node submit-indexnow.mjs https://example.com --key K --dry-run
 *
 * Flags:
 *   --key <key>          IndexNow key (or set INDEXNOW_KEY). 8-128 hex chars.
 *   --key-location <url> Override where the key file is hosted (default https://host/<key>.txt)
 *   --sitemap <url>      Override the sitemap URL (default https://host/sitemap.xml)
 *   --dry-run            Fetch + list URLs, but do not submit.
 *
 * Exit codes:
 *   0  submitted (or dry-run / setup instructions printed)
 *   1  bad arguments / no key
 *   2  domain or sitemap unreachable, or IndexNow rejected the submission
 */

import { randomBytes } from "node:crypto";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
}

const inputUrl = args.find((a) => !a.startsWith("--") && !isFlagValue(a));

function isFlagValue(a) {
  const i = args.indexOf(a);
  return i > 0 && ["--key", "--key-location", "--sitemap"].includes(args[i - 1]);
}

if (!inputUrl) {
  console.error("Usage: node submit-indexnow.mjs <url> --key <key> [--sitemap <url>] [--dry-run]");
  console.error("  e.g. node submit-indexnow.mjs https://example.com --key a2e3b3c0823acd51cfcc5b7108d08742");
  process.exit(1);
}

let ORIGIN, HOST;
try {
  const parsed = new URL(inputUrl);
  ORIGIN = `${parsed.protocol}//${parsed.host}`;
  HOST = parsed.host;
} catch {
  console.error(`Invalid URL: ${inputUrl}`);
  process.exit(1);
}

const KEY = flag("--key") || process.env.INDEXNOW_KEY || null;
const DRY_RUN = args.includes("--dry-run");
const SITEMAP_URL = flag("--sitemap") || `${ORIGIN}/sitemap.xml`;

// api.indexnow.org fans a single submission out to all participating engines.
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
// IndexNow accepts at most 10,000 URLs per request.
const MAX_URLS_PER_REQUEST = 10_000;
const TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// No key -> print setup instructions (the manual, one-time part)
// ---------------------------------------------------------------------------

if (!KEY) {
  const suggested = randomBytes(16).toString("hex"); // 32 hex chars
  console.error(`No IndexNow key provided. IndexNow needs a key you host once at the site root.\n`);
  console.error(`Setup (one time):`);
  console.error(`  1. Use this generated key (or any 8-128 hex-char string):`);
  console.error(`       ${suggested}`);
  console.error(`  2. Create a text file at the site root whose name is the key and whose`);
  console.error(`     ONLY contents are the key itself:`);
  console.error(`       ${ORIGIN}/${suggested}.txt   ->   ${suggested}`);
  console.error(`  3. Deploy so the key file is LIVE (verify it loads in a browser).`);
  console.error(`  4. Re-run with the key:`);
  console.error(`       node submit-indexnow.mjs ${ORIGIN} --key ${suggested}`);
  console.error(`\n  Tip: export INDEXNOW_KEY=${suggested} to avoid passing --key each time.`);
  process.exit(1);
}

if (!/^[a-fA-F0-9]{8,128}$/.test(KEY)) {
  console.error(`Invalid key "${KEY}". IndexNow keys must be 8-128 hexadecimal characters.`);
  process.exit(1);
}

const KEY_LOCATION = flag("--key-location") || `${ORIGIN}/${KEY}.txt`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      ...options,
      headers: { "User-Agent": "SEO-Planner-IndexNow/1.0", ...(options.headers || {}) },
    });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/** Extract <loc> URLs from sitemap XML. Handles both urlset and sitemapindex. */
export function extractLocs(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  return { locs, isIndex };
}

/** Fetch a sitemap and return its page URLs, following one level of sitemap index. */
async function fetchSitemapUrls(url) {
  const res = await safeFetch(url);
  if (!res || !res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res ? res.status : "unreachable"}`);
  const xml = await res.text();
  const { locs, isIndex } = extractLocs(xml);
  if (!isIndex) return locs;

  // Sitemap index: fetch each child sitemap and collect its page URLs.
  const all = [];
  for (const child of locs) {
    const childRes = await safeFetch(child);
    if (childRes && childRes.ok) {
      const { locs: childLocs } = extractLocs(await childRes.text());
      all.push(...childLocs);
    } else {
      console.error(`  ! could not fetch child sitemap ${child}`);
    }
  }
  return all;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Pre-flight: warn (do not fail) if the key file is not reachable — this is the
  // #1 reason IndexNow returns 403 later, so surfacing it early saves a round trip.
  console.error(`Verifying key file: ${KEY_LOCATION}`);
  const keyRes = await safeFetch(KEY_LOCATION);
  if (!keyRes || !keyRes.ok) {
    console.error(`  ! Key file not reachable (HTTP ${keyRes ? keyRes.status : "unreachable"}).`);
    console.error(`  ! Deploy ${KEY_LOCATION} containing "${KEY}" BEFORE submitting, or engines return 403.`);
  } else {
    const body = (await keyRes.text()).trim();
    if (body !== KEY) {
      console.error(`  ! Key file is reachable but its contents ("${body.slice(0, 40)}") != key ("${KEY}").`);
    } else {
      console.error(`  ok key file verified.`);
    }
  }

  console.error(`Fetching sitemap: ${SITEMAP_URL}`);
  const urlList = await fetchSitemapUrls(SITEMAP_URL);
  if (urlList.length === 0) throw new Error(`No <loc> URLs found via ${SITEMAP_URL}`);
  console.error(`Found ${urlList.length} URL(s).`);

  if (DRY_RUN) {
    console.error(`\n[dry-run] would submit ${urlList.length} URL(s) to IndexNow as host ${HOST}:`);
    urlList.forEach((u) => console.log(u));
    return;
  }

  const batches = chunk(urlList, MAX_URLS_PER_REQUEST);
  let submitted = 0;
  for (const [idx, batch] of batches.entries()) {
    const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch };
    const res = await safeFetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const status = res ? res.status : "unreachable";
    // 200 = accepted, 202 = accepted (key validation pending). Both are success.
    if (res && (res.status === 200 || res.status === 202)) {
      submitted += batch.length;
      console.error(`  batch ${idx + 1}/${batches.length}: ${batch.length} URL(s) — HTTP ${status} ok`);
    } else {
      const text = res ? await res.text() : "";
      console.error(`  batch ${idx + 1}/${batches.length}: FAILED — HTTP ${status} ${text.slice(0, 200)}`);
      // 403 = key file not reachable/mismatched. 422 = URL/host or key mismatch. 429 = rate limited.
      throw new Error(`IndexNow rejected batch ${idx + 1} (HTTP ${status}).`);
    }
  }

  console.log(`Submitted ${submitted} URL(s) to IndexNow as ${HOST} (Bing/Yandex/Seznam/Naver/Yep).`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(2);
});
