#!/usr/bin/env node

/**
 * schema-validator.mjs
 *
 * Extracts and validates structured data (JSON-LD + Microdata) from a URL or
 * local HTML file. Pure local validation -- no external API calls.
 *
 * Usage:
 *   node schema-validator.mjs https://example.com
 *   node schema-validator.mjs ./page.html
 *
 * Exit codes:
 *   0  success
 *   1  bad arguments
 *   2  fetch/read error
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));

if (!input) {
  console.error("Usage: node schema-validator.mjs <url-or-file>");
  console.error("  e.g. node schema-validator.mjs https://example.com");
  console.error("  e.g. node schema-validator.mjs ./page.html");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Google Rich Results: required / recommended properties by @type
// Based on: https://developers.google.com/search/docs/appearance/structured-data
// ---------------------------------------------------------------------------

const SCHEMA_REQUIREMENTS = {
  Article: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher", "description", "mainEntityOfPage"],
  },
  NewsArticle: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher", "description"],
  },
  BlogPosting: {
    required: ["headline", "image", "datePublished", "author"],
    recommended: ["dateModified", "publisher", "description"],
  },
  Product: {
    required: ["name", "image"],
    recommended: ["description", "sku", "brand", "offers", "review", "aggregateRating"],
  },
  LocalBusiness: {
    required: ["name", "address", "telephone"],
    recommended: ["image", "url", "openingHoursSpecification", "geo", "priceRange"],
  },
  Organization: {
    required: ["name", "url"],
    recommended: ["logo", "sameAs", "contactPoint", "address"],
  },
  Person: {
    required: ["name"],
    recommended: ["url", "image", "jobTitle", "sameAs"],
  },
  WebSite: {
    required: ["name", "url"],
    recommended: ["potentialAction", "description"],
  },
  WebPage: {
    required: ["name"],
    recommended: ["description", "url", "breadcrumb"],
  },
  BreadcrumbList: {
    required: ["itemListElement"],
    recommended: [],
  },
  FAQPage: {
    required: ["mainEntity"],
    recommended: [],
  },
  HowTo: {
    required: ["name", "step"],
    recommended: ["image", "totalTime", "estimatedCost", "supply", "tool"],
  },
  Recipe: {
    required: ["name", "image"],
    recommended: [
      "author",
      "cookTime",
      "prepTime",
      "nutrition",
      "recipeIngredient",
      "recipeInstructions",
      "recipeYield",
      "aggregateRating",
    ],
  },
  Event: {
    required: ["name", "startDate", "location"],
    recommended: ["endDate", "image", "description", "offers", "performer", "organizer"],
  },
  VideoObject: {
    required: ["name", "description", "thumbnailUrl", "uploadDate"],
    recommended: ["contentUrl", "duration", "embedUrl", "interactionStatistic"],
  },
  Review: {
    required: ["itemReviewed", "reviewRating", "author"],
    recommended: ["datePublished", "reviewBody"],
  },
  AggregateRating: {
    required: ["ratingValue", "reviewCount"],
    recommended: ["bestRating", "worstRating"],
  },
  Offer: {
    required: ["price", "priceCurrency"],
    recommended: ["availability", "url", "priceValidUntil", "itemCondition"],
  },
  JobPosting: {
    required: ["title", "description", "datePosted", "hiringOrganization"],
    recommended: ["validThrough", "employmentType", "jobLocation", "baseSalary"],
  },
  Course: {
    required: ["name", "description", "provider"],
    recommended: ["url", "image"],
  },
  SoftwareApplication: {
    required: ["name"],
    recommended: ["operatingSystem", "applicationCategory", "offers", "aggregateRating"],
  },
};

// Page type heuristics for recommending missing schemas
const PAGE_TYPE_PATTERNS = [
  { pattern: /\b(blog|article|post|news)\b/i, types: ["Article", "BlogPosting", "BreadcrumbList"] },
  { pattern: /\b(product|shop|buy|price|cart)\b/i, types: ["Product", "Offer", "BreadcrumbList"] },
  { pattern: /\b(about|team|company)\b/i, types: ["Organization", "Person"] },
  { pattern: /\b(contact|location|directions)\b/i, types: ["LocalBusiness"] },
  { pattern: /\b(faq|frequently.asked|questions)\b/i, types: ["FAQPage"] },
  { pattern: /\b(how.to|tutorial|guide|step)\b/i, types: ["HowTo"] },
  { pattern: /\b(recipe|cook|ingredient)\b/i, types: ["Recipe"] },
  { pattern: /\b(event|conference|meetup|webinar)\b/i, types: ["Event"] },
  { pattern: /\b(video|watch|stream)\b/i, types: ["VideoObject"] },
  { pattern: /\b(job|career|hiring|position)\b/i, types: ["JobPosting"] },
  { pattern: /\b(course|learn|training|class)\b/i, types: ["Course"] },
  { pattern: /\b(review|rating|testimonial)\b/i, types: ["Review"] },
];

// ---------------------------------------------------------------------------
// HTML fetching / reading
// ---------------------------------------------------------------------------

async function getHtml(input) {
  // Check if it's a URL
  if (/^https?:\/\//i.test(input)) {
    console.error(`Fetching ${input} ...`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetch(input, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SEO-Planner-SchemaValidator/1.0)",
        },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return { html: await res.text(), source: input };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new Error(`Timeout fetching ${input}`);
      }
      throw err;
    }
  }

  // Local file
  const filePath = resolve(input);
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  console.error(`Reading ${filePath} ...`);
  const html = await readFile(filePath, "utf-8");
  return { html, source: filePath };
}

// ---------------------------------------------------------------------------
// JSON-LD extraction
// ---------------------------------------------------------------------------

function extractJsonLd(html) {
  const blocks = [];
  // Match all <script type="application/ld+json"> blocks
  const regex =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      // Handle @graph arrays
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

// ---------------------------------------------------------------------------
// Microdata extraction (basic)
// ---------------------------------------------------------------------------

function extractMicrodata(html) {
  const items = [];

  // Find all elements with itemscope
  const itemscopeRegex =
    /<[^>]+itemscope[^>]*itemtype\s*=\s*["'](.*?)["'][^>]*>([\s\S]*?)(?=<[^>]+itemscope|$)/gi;

  let match;
  while ((match = itemscopeRegex.exec(html)) !== null) {
    const itemType = match[1];
    const content = match[2];

    // Extract itemprop values
    const props = {};
    const propRegex =
      /itemprop\s*=\s*["'](.*?)["'][^>]*(?:content\s*=\s*["'](.*?)["']|>([^<]*))/gi;
    let propMatch;
    while ((propMatch = propRegex.exec(content)) !== null) {
      const propName = propMatch[1];
      const propValue = propMatch[2] || propMatch[3] || "(present)";
      props[propName] = propValue.trim();
    }

    items.push({
      type: itemType,
      properties: props,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

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

/**
 * Deep property check: looks for a property at the top level or nested.
 */
function hasProperty(data, prop) {
  if (!data || typeof data !== "object") return false;
  if (prop in data) {
    const val = data[prop];
    // Check it's not empty
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
    result.error = "Missing @context (should be \"https://schema.org\")";
  }

  if (
    result.hasContext &&
    !String(data["@context"]).includes("schema.org")
  ) {
    result.error = `Unexpected @context: "${data["@context"]}" (expected schema.org)`;
  }

  // Check against known requirements
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

function validateMicrodataItem(item) {
  const result = {
    type: item.type,
    format: "Microdata",
    properties: Object.keys(item.properties),
    requiredPresent: [],
    requiredMissing: [],
    recommendedPresent: [],
    recommendedMissing: [],
  };

  // Try to match the schema.org type name
  const typeUrl = item.type || "";
  const typeName = typeUrl.split("/").pop();

  const reqs = SCHEMA_REQUIREMENTS[typeName];
  if (reqs) {
    result.type = typeName;
    for (const prop of reqs.required) {
      if (prop in item.properties) {
        result.requiredPresent.push(prop);
      } else {
        result.requiredMissing.push(prop);
      }
    }
    for (const prop of reqs.recommended) {
      if (prop in item.properties) {
        result.recommendedPresent.push(prop);
      } else {
        result.recommendedMissing.push(prop);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Page type detection for recommendations
// ---------------------------------------------------------------------------

function detectPageType(html, source) {
  const text = html.toLowerCase();
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const combined = `${source} ${title} ${text.slice(0, 5000)}`;

  const detectedTypes = new Set();
  for (const { pattern, types } of PAGE_TYPE_PATTERNS) {
    if (pattern.test(combined)) {
      types.forEach((t) => detectedTypes.add(t));
    }
  }

  // Always recommend WebSite and Organization on homepages
  if (
    /^https?:\/\/[^/]+\/?$/i.test(source) ||
    source.endsWith("index.html")
  ) {
    detectedTypes.add("WebSite");
    detectedTypes.add("Organization");
  }

  // Always suggest BreadcrumbList for inner pages
  if (!/^https?:\/\/[^/]+\/?$/i.test(source)) {
    detectedTypes.add("BreadcrumbList");
  }

  return [...detectedTypes];
}

// ---------------------------------------------------------------------------
// Markdown report
// ---------------------------------------------------------------------------

function buildReport({ source, jsonLdBlocks, microdataItems, html }) {
  const lines = [];

  lines.push(`# Structured Data Validation Report`);
  lines.push(``);
  lines.push(`**Source:** ${source}`);
  lines.push(
    `**Date:** ${new Date().toISOString().replace("T", " ").slice(0, 19)}`
  );
  lines.push(``);

  const totalJsonLd = jsonLdBlocks.length;
  const totalMicrodata = microdataItems.length;
  const total = totalJsonLd + totalMicrodata;

  lines.push(`## Summary`);
  lines.push(``);
  lines.push(`| Format | Blocks Found |`);
  lines.push(`|--------|-------------|`);
  lines.push(`| JSON-LD | ${totalJsonLd} |`);
  lines.push(`| Microdata | ${totalMicrodata} |`);
  lines.push(`| **Total** | **${total}** |`);
  lines.push(``);

  if (total === 0) {
    lines.push(`## No Structured Data Found`);
    lines.push(``);
    lines.push(
      `This page has no JSON-LD or Microdata structured data. ` +
        `Search engines cannot generate rich results without it.`
    );
    lines.push(``);
  }

  // -- JSON-LD blocks ---
  const validations = jsonLdBlocks.map(validateJsonLdBlock);

  if (validations.length > 0) {
    lines.push(`## JSON-LD Blocks`);
    lines.push(``);

    validations.forEach((v, i) => {
      const statusIcon = v.valid ? "VALID" : "INVALID";
      lines.push(`### Block ${i + 1}: ${v.type || "(unknown type)"} [${statusIcon}]`);
      lines.push(``);

      if (!v.valid) {
        lines.push(`**Parse Error:** ${v.error}`);
        lines.push(``);
        return;
      }

      if (v.error) {
        lines.push(`**Warning:** ${v.error}`);
        lines.push(``);
      }

      lines.push(`**@context:** ${v.hasContext ? "Present" : "MISSING"}`);
      lines.push(`**Properties found:** ${v.properties.join(", ") || "(none)"}`);
      lines.push(``);

      if (!SCHEMA_REQUIREMENTS[v.type]) {
        lines.push(
          `*No specific validation rules for type "${v.type}". Properties look structurally valid.*`
        );
        lines.push(``);
        return;
      }

      // Required properties
      if (v.requiredPresent.length > 0 || v.requiredMissing.length > 0) {
        lines.push(`**Required Properties (for Google Rich Results):**`);
        lines.push(``);
        for (const p of v.requiredPresent) {
          lines.push(`- [x] \`${p}\``);
        }
        for (const p of v.requiredMissing) {
          lines.push(`- [ ] \`${p}\` -- MISSING`);
        }
        lines.push(``);
      }

      // Recommended properties
      if (v.recommendedPresent.length > 0 || v.recommendedMissing.length > 0) {
        lines.push(`**Recommended Properties:**`);
        lines.push(``);
        for (const p of v.recommendedPresent) {
          lines.push(`- [x] \`${p}\``);
        }
        for (const p of v.recommendedMissing) {
          lines.push(`- [ ] \`${p}\``);
        }
        lines.push(``);
      }

      // Verdict
      if (v.requiredMissing.length === 0) {
        lines.push(`**Verdict:** All required properties present. Eligible for rich results.`);
      } else {
        lines.push(
          `**Verdict:** Missing ${v.requiredMissing.length} required propert${v.requiredMissing.length === 1 ? "y" : "ies"}. NOT eligible for rich results until fixed.`
        );
      }
      lines.push(``);
    });
  }

  // -- Microdata items ---
  const microdataValidations = microdataItems.map(validateMicrodataItem);

  if (microdataValidations.length > 0) {
    lines.push(`## Microdata Items`);
    lines.push(``);

    microdataValidations.forEach((v, i) => {
      lines.push(`### Item ${i + 1}: ${v.type || "(unknown type)"}`);
      lines.push(``);
      lines.push(`**Properties found:** ${v.properties.join(", ") || "(none)"}`);
      lines.push(``);

      if (v.requiredMissing.length > 0) {
        lines.push(`**Missing required:** ${v.requiredMissing.join(", ")}`);
        lines.push(``);
      }

      if (v.recommendedMissing.length > 0) {
        lines.push(`**Missing recommended:** ${v.recommendedMissing.join(", ")}`);
        lines.push(``);
      }
    });
  }

  // -- Recommendations ---
  const foundTypes = new Set([
    ...validations.map((v) => v.type).filter(Boolean),
    ...microdataValidations.map((v) => v.type).filter(Boolean),
  ]);

  const suggestedTypes = detectPageType(html, source);
  const missingTypes = suggestedTypes.filter((t) => !foundTypes.has(t));

  lines.push(`## Recommendations`);
  lines.push(``);

  if (total === 0) {
    lines.push(
      `This page has no structured data at all. Adding JSON-LD structured data ` +
        `is one of the highest-impact SEO improvements you can make.`
    );
    lines.push(``);
  }

  if (missingTypes.length > 0) {
    lines.push(`### Suggested Schema Types to Add`);
    lines.push(``);
    lines.push(
      `Based on page content analysis, these schema types would be beneficial:`
    );
    lines.push(``);

    for (const type of missingTypes) {
      const reqs = SCHEMA_REQUIREMENTS[type];
      if (reqs) {
        lines.push(`- **${type}** -- required properties: \`${reqs.required.join("`, `")}\``);
      } else {
        lines.push(`- **${type}**`);
      }
    }
    lines.push(``);
  }

  // General tips
  const hasErrors = validations.some((v) => !v.valid || v.error);
  const hasMissing = validations.some((v) => v.requiredMissing.length > 0);

  if (hasErrors || hasMissing || total === 0) {
    lines.push(`### General Tips`);
    lines.push(``);

    if (total === 0 || !validations.some((v) => v.hasContext)) {
      lines.push(
        `1. Use JSON-LD format (preferred by Google over Microdata or RDFa)`
      );
    }
    if (hasErrors) {
      lines.push(
        `2. Fix JSON parse errors -- invalid JSON-LD blocks are completely ignored`
      );
    }
    if (hasMissing) {
      lines.push(
        `3. Add all required properties to become eligible for rich results`
      );
    }
    lines.push(
      `4. Test changes at https://search.google.com/test/rich-results`
    );
    lines.push(
      `5. Validate JSON-LD syntax at https://validator.schema.org/`
    );
    lines.push(``);
  }

  if (!hasErrors && !hasMissing && total > 0 && missingTypes.length === 0) {
    lines.push(`All structured data looks good. No critical issues found.`);
    lines.push(``);
  }

  // -- Footer ---
  lines.push(`---`);
  lines.push(`*Generated by schema-validator.mjs*`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let html, source;

  try {
    const result = await getHtml(input);
    html = result.html;
    source = result.source;
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(2);
  }

  console.error(`Extracting structured data ...`);

  const jsonLdBlocks = extractJsonLd(html);
  const microdataItems = extractMicrodata(html);

  console.error(
    `Found ${jsonLdBlocks.length} JSON-LD block(s), ${microdataItems.length} Microdata item(s)`
  );
  console.error(``);

  const report = buildReport({ source, jsonLdBlocks, microdataItems, html });
  console.log(report);
}

main();
