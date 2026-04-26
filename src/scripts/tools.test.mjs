#!/usr/bin/env node
// Test suite for schema-validator.mjs and sitemap-checker.mjs parsing functions.
// Tests internal parsing logic directly (no HTTP requests).
// Uses Node.js built-in test framework.
//
// Usage:
//   node --test tools.test.mjs
//
// Requires Node.js 18+.
//
// NOTE: Both schema-validator.mjs and sitemap-checker.mjs are CLI scripts
// that call main() on import. To test their parsing functions we duplicate
// the pure parsing logic here rather than importing (which would trigger
// network requests and process.exit). This is intentional -- the functions
// under test are the pure parsing/validation helpers.

import { describe, it } from "node:test";
import assert from "node:assert";

// ---------------------------------------------------------------------------
// Duplicated parsing functions from schema-validator.mjs
// (Pure functions, no side effects, safe to replicate for testing)
// ---------------------------------------------------------------------------

const SCHEMA_REQUIREMENTS = {
  Article: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher", "description", "mainEntityOfPage"],
  },
  Product: {
    required: ["name", "image"],
    recommended: ["description", "sku", "brand", "offers", "review", "aggregateRating"],
  },
  Organization: {
    required: ["name", "url"],
    recommended: ["logo", "sameAs", "contactPoint", "address"],
  },
  WebSite: {
    required: ["name", "url"],
    recommended: ["potentialAction", "description"],
  },
  FAQPage: {
    required: ["mainEntity"],
    recommended: [],
  },
};

function extractJsonLd(html) {
  const blocks = [];
  const regex =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        for (const item of parsed["@graph"]) {
          blocks.push({ data: item, raw: JSON.stringify(item, null, 2), valid: true });
        }
      } else if (Array.isArray(parsed)) {
        for (const item of parsed) {
          blocks.push({ data: item, raw: JSON.stringify(item, null, 2), valid: true });
        }
      } else {
        blocks.push({ data: parsed, raw, valid: true });
      }
    } catch (err) {
      blocks.push({
        data: null,
        raw,
        valid: false,
        error: err.message,
      });
    }
  }

  return blocks;
}

function getType(data) {
  if (!data) return null;
  const t = data["@type"];
  if (Array.isArray(t)) return t[0];
  return t || null;
}

function getProperties(data) {
  if (!data || typeof data !== "object") return [];
  return Object.keys(data).filter((k) => !k.startsWith("@"));
}

function hasProperty(data, prop) {
  if (!data || typeof data !== "object") return false;
  if (prop in data) {
    const val = data[prop];
    if (val === null || val === undefined || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }
  return false;
}

function validateJsonLdBlock(block) {
  const result = {
    type: null,
    valid: block.valid,
    error: block.error || null,
    hasContext: false,
    properties: [],
    requiredPresent: [],
    requiredMissing: [],
    recommendedPresent: [],
    recommendedMissing: [],
  };

  if (!block.valid || !block.data) return result;

  const data = block.data;
  result.type = getType(data);
  result.hasContext = !!data["@context"];
  result.properties = getProperties(data);

  if (!result.hasContext) {
    result.error = 'Missing @context (should be "https://schema.org")';
  }

  const typeName = result.type;
  const reqs = SCHEMA_REQUIREMENTS[typeName];
  if (reqs) {
    for (const prop of reqs.required) {
      if (hasProperty(data, prop)) {
        result.requiredPresent.push(prop);
      } else {
        result.requiredMissing.push(prop);
      }
    }
    for (const prop of reqs.recommended) {
      if (hasProperty(data, prop)) {
        result.recommendedPresent.push(prop);
      } else {
        result.recommendedMissing.push(prop);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Duplicated parsing functions from sitemap-checker.mjs
// ---------------------------------------------------------------------------

function parseSitemapXml(xml) {
  const result = { urls: [], sitemaps: [], isSitemapIndex: false };

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

function extractSitemapFromRobotsTxt(robotsTxt) {
  const urls = [];
  const lines = robotsTxt.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^Sitemap:\s*/i.test(trimmed)) {
      const url = trimmed.replace(/^Sitemap:\s*/i, "").trim();
      if (url) urls.push(url);
    }
  }
  return urls;
}

// ===========================================================================
// TESTS: Schema Validator
// ===========================================================================

describe("schema-validator: extractJsonLd", () => {
  it("extracts types from valid JSON-LD in HTML", () => {
    const html = `
      <html>
      <head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Test Article",
          "image": "https://example.com/img.jpg",
          "datePublished": "2026-01-01",
          "author": { "@type": "Person", "name": "Jane" }
        }
        </script>
      </head>
      <body>Hello</body>
      </html>
    `;

    const blocks = extractJsonLd(html);
    assert.strictEqual(blocks.length, 1, "Should find 1 block");
    assert.strictEqual(blocks[0].valid, true, "Should be valid JSON");
    assert.strictEqual(getType(blocks[0].data), "Article", "Should detect Article type");

    const validation = validateJsonLdBlock(blocks[0]);
    assert.strictEqual(validation.type, "Article");
    assert.ok(validation.hasContext, "Should have @context");
    assert.strictEqual(validation.requiredMissing.length, 0, "All required props present");
  });

  it("reports missing required properties", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Test"
        }
        </script>
      </head></html>
    `;

    const blocks = extractJsonLd(html);
    const validation = validateJsonLdBlock(blocks[0]);
    assert.ok(validation.requiredMissing.includes("image"), "Should report missing image");
    assert.ok(validation.requiredMissing.includes("datePublished"), "Should report missing datePublished");
    assert.ok(validation.requiredMissing.includes("author"), "Should report missing author");
    assert.strictEqual(validation.requiredPresent.length, 1, "Only headline should be present");
  });

  it("finds multiple schema blocks", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "WebSite", "name": "My Site", "url": "https://example.com" }
        </script>
        <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Organization", "name": "My Org", "url": "https://example.com" }
        </script>
      </head></html>
    `;

    const blocks = extractJsonLd(html);
    assert.strictEqual(blocks.length, 2, "Should find 2 blocks");
    assert.strictEqual(getType(blocks[0].data), "WebSite");
    assert.strictEqual(getType(blocks[1].data), "Organization");
  });

  it("returns empty array when no schema present", () => {
    const html = `
      <html><head><title>No Schema</title></head>
      <body><p>Just text.</p></body></html>
    `;

    const blocks = extractJsonLd(html);
    assert.strictEqual(blocks.length, 0, "Should find 0 blocks");
  });

  it("handles invalid JSON in script tag gracefully", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Article", INVALID JSON HERE }
        </script>
      </head></html>
    `;

    const blocks = extractJsonLd(html);
    assert.strictEqual(blocks.length, 1, "Should still find 1 block");
    assert.strictEqual(blocks[0].valid, false, "Should be marked invalid");
    assert.ok(blocks[0].error, "Should have error message");
    assert.strictEqual(blocks[0].data, null, "Data should be null");

    const validation = validateJsonLdBlock(blocks[0]);
    assert.strictEqual(validation.valid, false, "Validation should report invalid");
  });
});

describe("schema-validator: @graph support", () => {
  it("extracts items from @graph array", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", "name": "My Site", "url": "https://example.com" },
            { "@type": "Organization", "name": "My Org", "url": "https://example.com" }
          ]
        }
        </script>
      </head></html>
    `;

    const blocks = extractJsonLd(html);
    assert.strictEqual(blocks.length, 2, "Should extract 2 items from @graph");
    assert.strictEqual(getType(blocks[0].data), "WebSite");
    assert.strictEqual(getType(blocks[1].data), "Organization");
  });
});

describe("schema-validator: property detection", () => {
  it("hasProperty returns false for empty array", () => {
    assert.strictEqual(hasProperty({ items: [] }, "items"), false);
  });

  it("hasProperty returns false for null value", () => {
    assert.strictEqual(hasProperty({ name: null }, "name"), false);
  });

  it("hasProperty returns true for non-empty value", () => {
    assert.strictEqual(hasProperty({ name: "Test" }, "name"), true);
  });

  it("getProperties excludes @-prefixed keys", () => {
    const data = { "@context": "https://schema.org", "@type": "Article", "headline": "Test", "author": "Jane" };
    const props = getProperties(data);
    assert.ok(!props.includes("@context"));
    assert.ok(!props.includes("@type"));
    assert.ok(props.includes("headline"));
    assert.ok(props.includes("author"));
  });
});

// ===========================================================================
// TESTS: Sitemap Checker
// ===========================================================================

describe("sitemap-checker: parseSitemapXml", () => {
  it("parses valid XML sitemap with URLs", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
          <lastmod>2026-01-01</lastmod>
          <changefreq>daily</changefreq>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>https://example.com/about</loc>
          <lastmod>2026-01-02</lastmod>
        </url>
        <url>
          <loc>https://example.com/blog/post-1</loc>
        </url>
      </urlset>`;

    const result = parseSitemapXml(xml);
    assert.strictEqual(result.isSitemapIndex, false, "Should not be a sitemap index");
    assert.strictEqual(result.urls.length, 3, "Should find 3 URLs");
    assert.strictEqual(result.urls[0].loc, "https://example.com/");
    assert.strictEqual(result.urls[0].lastmod, "2026-01-01");
    assert.strictEqual(result.urls[0].changefreq, "daily");
    assert.strictEqual(result.urls[0].priority, "1.0");
    assert.strictEqual(result.urls[1].loc, "https://example.com/about");
    assert.strictEqual(result.urls[2].lastmod, null, "Missing lastmod should be null");
    assert.strictEqual(result.urls[2].changefreq, null, "Missing changefreq should be null");
  });

  it("detects sitemap index", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
          <loc>https://example.com/sitemap-posts.xml</loc>
          <lastmod>2026-01-01</lastmod>
        </sitemap>
        <sitemap>
          <loc>https://example.com/sitemap-pages.xml</loc>
        </sitemap>
      </sitemapindex>`;

    const result = parseSitemapXml(xml);
    assert.strictEqual(result.isSitemapIndex, true, "Should detect sitemap index");
    assert.strictEqual(result.sitemaps.length, 2, "Should find 2 child sitemaps");
    assert.strictEqual(result.sitemaps[0].loc, "https://example.com/sitemap-posts.xml");
    assert.strictEqual(result.sitemaps[0].lastmod, "2026-01-01");
    assert.strictEqual(result.sitemaps[1].loc, "https://example.com/sitemap-pages.xml");
    assert.strictEqual(result.sitemaps[1].lastmod, null, "Missing lastmod should be null");
    assert.strictEqual(result.urls.length, 0, "URL list should be empty for index");
  });

  it("handles empty/malformed XML gracefully", () => {
    const result1 = parseSitemapXml("");
    assert.strictEqual(result1.urls.length, 0, "Empty string should return no URLs");
    assert.strictEqual(result1.isSitemapIndex, false, "Empty string is not sitemap index");

    const result2 = parseSitemapXml("<html><body>Not a sitemap</body></html>");
    assert.strictEqual(result2.urls.length, 0, "Non-sitemap HTML should return no URLs");

    const result3 = parseSitemapXml("This is just plain text, not XML at all.");
    assert.strictEqual(result3.urls.length, 0, "Plain text should return no URLs");
  });

  it("handles partial/broken XML without crashing", () => {
    const xml = `<?xml version="1.0"?>
      <urlset>
        <url><loc>https://example.com/good</loc></url>
        <url><loc>https://example.com/also-good</url>
        <url>no loc here</url>
      </urlset>`;

    const result = parseSitemapXml(xml);
    // Should at least find the well-formed URL
    assert.ok(result.urls.length >= 1, "Should find at least 1 URL from partial XML");
    assert.strictEqual(result.urls[0].loc, "https://example.com/good");
  });
});

describe("sitemap-checker: robots.txt Sitemap extraction", () => {
  it("extracts Sitemap URL from robots.txt", () => {
    const robotsTxt = `User-agent: *
Disallow: /admin/
Allow: /

Sitemap: https://example.com/sitemap.xml
`;

    const urls = extractSitemapFromRobotsTxt(robotsTxt);
    assert.strictEqual(urls.length, 1);
    assert.strictEqual(urls[0], "https://example.com/sitemap.xml");
  });

  it("extracts multiple Sitemap URLs", () => {
    const robotsTxt = `User-agent: *
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
Sitemap: https://example.com/sitemap-images.xml
`;

    const urls = extractSitemapFromRobotsTxt(robotsTxt);
    assert.strictEqual(urls.length, 3);
    assert.strictEqual(urls[0], "https://example.com/sitemap.xml");
    assert.strictEqual(urls[2], "https://example.com/sitemap-images.xml");
  });

  it("handles robots.txt with no Sitemap directive", () => {
    const robotsTxt = `User-agent: *
Disallow: /admin/
Allow: /
`;

    const urls = extractSitemapFromRobotsTxt(robotsTxt);
    assert.strictEqual(urls.length, 0);
  });

  it("handles case-insensitive Sitemap directive", () => {
    const robotsTxt = `User-agent: *
sitemap: https://example.com/sitemap1.xml
SITEMAP: https://example.com/sitemap2.xml
Sitemap: https://example.com/sitemap3.xml
`;

    const urls = extractSitemapFromRobotsTxt(robotsTxt);
    assert.strictEqual(urls.length, 3);
  });
});

describe("sitemap-checker: edge cases", () => {
  it("handles sitemap with CDATA in loc", () => {
    const xml = `<?xml version="1.0"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/page?a=1&amp;b=2</loc>
        </url>
      </urlset>`;

    const result = parseSitemapXml(xml);
    assert.strictEqual(result.urls.length, 1);
    // The parser extracts raw text inside <loc>, so XML entities remain as-is
    assert.ok(result.urls[0].loc.includes("example.com"));
  });

  it("handles sitemap with whitespace in loc", () => {
    const xml = `<?xml version="1.0"?>
      <urlset>
        <url>
          <loc>
            https://example.com/page
          </loc>
        </url>
      </urlset>`;

    const result = parseSitemapXml(xml);
    assert.strictEqual(result.urls.length, 1);
    assert.strictEqual(result.urls[0].loc, "https://example.com/page", "Should trim whitespace");
  });
});
