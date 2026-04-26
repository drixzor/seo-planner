# Technical SEO Audit

**Site:** acmeanalytics.com
**Date:** 2026-01-17
**Tools:** Lighthouse 12.1, Screaming Frog 21.0, Google Search Console, PageSpeed Insights
**Crawled pages:** 476 (47 content + 340 app + 89 API docs)

---

## Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Lighthouse Performance | 34 | 90+ | FAIL |
| Lighthouse SEO | 72 | 95+ | FAIL |
| LCP (Largest Contentful Paint) | 4.2s | <2.5s | FAIL |
| FID (First Input Delay) | 89ms | <100ms | PASS |
| CLS (Cumulative Layout Shift) | 0.42 | <0.1 | FAIL |
| TTFB (Time to First Byte) | 380ms | <800ms | PASS |
| Indexed pages (GSC) | 476 | ~50 (content only) | OVER-INDEXED |
| Crawl errors (GSC) | 23 | 0 | FAIL |
| Mobile usability issues | 4 | 0 | FAIL |
| Structured data | None | Article, Org, FAQ, Breadcrumb | FAIL |

---

## Issues Found

### ISSUE-T1: Blog on separate HTTP subdomain [CRITICAL]

**URL:** blog.acmeanalytics.com
**Severity:** CRITICAL
**Impact:** Domain authority split, HTTP ranking penalty, no link equity flow

The blog is hosted on `blog.acmeanalytics.com`, a subdomain served over HTTP (not HTTPS). The subdomain has its own DNS record pointing to a separate hosting environment (appears to be an older Ghost installation).

**Evidence:**
- `curl -I http://blog.acmeanalytics.com` returns HTTP 200 with no HSTS or redirect to HTTPS
- SSL certificate exists for `acmeanalytics.com` and `*.acmeanalytics.com` but blog server doesn't use it
- Ahrefs shows 8 backlinks pointing to blog.acmeanalytics.com — these do NOT contribute to acmeanalytics.com domain authority
- Google treats blog.acmeanalytics.com and acmeanalytics.com as separate properties in GSC

**Recommendation:** Migrate blog to `acmeanalytics.com/blog/` (subfolder). Implement 301 redirects for all existing URLs. Expected timeline: 6-8 hours for migration + redirect mapping.

---

### ISSUE-T2: Severe CLS from hero images and web fonts [HIGH]

**Severity:** HIGH
**Impact:** CLS 0.42s fails Core Web Vitals, affects all pages

**Root causes identified:**

1. **Hero images without dimensions:** 14 pages have hero images loaded via CSS background-image without explicit width/height or aspect-ratio. Browser can't reserve space, causing layout shift when images load.
   - Affected: Homepage, /features/, /pricing/, all blog posts
   - Shift magnitude: 0.18 (measured via CLS breakdown in DevTools)

2. **Web fonts causing FOUT:** Two custom fonts (Inter, JetBrains Mono) loaded via @font-face without `font-display: swap`. When fonts load, text reflows.
   - Shift magnitude: 0.12

3. **Cookie consent banner:** Inserted into DOM without reserved space. Pushes content down on first visit.
   - Shift magnitude: 0.09

4. **Dynamic pricing toggle:** The monthly/annual toggle on /pricing/ causes a layout shift when prices change (different digit counts).
   - Shift magnitude: 0.03

**Recommendation:**
- Add explicit width/height to all `<img>` tags and aspect-ratio to CSS background containers
- Add `font-display: swap` to @font-face declarations
- Reserve fixed height for cookie banner container
- Use tabular-nums or fixed-width containers for pricing

---

### ISSUE-T3: Broken XML sitemap [HIGH]

**Severity:** HIGH
**Impact:** Google can't discover pages; 12 of 47 URLs return 404

**Evidence:**
- Sitemap URL: `acmeanalytics.com/sitemap.xml`
- Contains 47 URLs
- 12 URLs return HTTP 404 (old blog URLs from pre-migration era, never cleaned up)
- 3 URLs return HTTP 301 (redirect chains to final destination)
- Sitemap `<lastmod>` dates are all `2025-06-14` — never updated since initial generation
- GSC shows "Submitted URL marked 'noindex'" errors for 2 URLs that have conflicting noindex + sitemap inclusion

**Recommendation:**
- Regenerate sitemap with only valid, indexable URLs
- Implement automatic sitemap generation on content publish (or use Next.js built-in sitemap)
- Remove 404'd and noindex'd URLs
- Set accurate `<lastmod>` dates

---

### ISSUE-T4: Zero structured data / schema markup [HIGH]

**Severity:** HIGH
**Impact:** Missing rich snippets in SERPs, reduced CTR, no entity signals

No JSON-LD, Microdata, or RDFa found on any page. The site has zero structured data.

**Missing schema types:**
- `Organization` — company name, logo, social profiles not declared
- `WebSite` — no sitelinks search box eligibility
- `Article` / `BlogPosting` — blog posts have no article markup (no author, date, headline in structured data)
- `FAQPage` — 3 pages have FAQ sections that could generate rich results
- `BreadcrumbList` — no breadcrumb navigation or markup
- `SoftwareApplication` — the product itself has no structured data (rating, pricing, offers)

**Recommendation:** Implement JSON-LD for all applicable schema types. Priority order: Organization (global), BreadcrumbList (all pages), Article (blog posts), FAQPage (where applicable).

---

### ISSUE-T5: Canonical tag errors on 15 pages [MEDIUM]

**Severity:** MEDIUM
**Impact:** Duplicate content signals, crawl budget waste

**Findings:**
- 9 pages have self-referencing canonical tags that include UTM parameters: `<link rel="canonical" href="https://acmeanalytics.com/blog/post?utm_source=newsletter">`
- 4 pages have canonical tags pointing to HTTP versions (blog subdomain URLs)
- 2 pages have no canonical tag at all (the /pricing/ and /demo/ pages)
- URL parameter variations (`?ref=`, `?source=`, `?tab=`) are not canonicalized

**Recommendation:** Implement canonical tags on all pages pointing to clean (no-parameter) HTTPS URLs. Add parameter handling rules in GSC.

---

### ISSUE-T6: Oversized images killing LCP [MEDIUM]

**Severity:** MEDIUM
**Impact:** LCP 4.2s (target <2.5s), slow page loads

**Evidence:**
- 23 images over 500KB found across the site
- Largest: `/images/hero-dashboard.png` at 3.4MB (3840x2160, uncompressed PNG)
- Average hero image: 1.8MB
- No WebP or AVIF variants served
- No lazy loading implemented (all images load eagerly, including below-fold)
- No responsive images (`srcset` not used)

**Recommendation:**
- Convert all images to WebP (70-80% size reduction vs PNG)
- Implement responsive images with srcset for 3 breakpoints (640, 1024, 1920)
- Lazy load all below-fold images (`loading="lazy"`)
- Compress hero images to <200KB target
- Consider AVIF for browsers that support it (additional 20% savings over WebP)

---

### ISSUE-T7: Internal 301 redirect chains [LOW]

**Severity:** LOW
**Impact:** Minor crawl budget waste, slight link equity dilution

8 internal redirect chains found:

| Start URL | Hops | Final URL |
|-----------|------|-----------|
| /blog/product-update-q2 | 3 | /changelog/ |
| /blog/hiring-engineers | 2 | /careers/ |
| /features/ab-testing | 2 | /features/#ab-testing |
| /blog/launch-announcement | 4 | /about/ |
| /pricing-old | 2 | /pricing/ |
| /blog/series-a | 2 | /about/#funding |
| /demo-request | 2 | /demo/ |
| /blog/analytics-tips | 3 | /blog/getting-started-with-analytics |

Longest chain: /blog/launch-announcement -> /blog/about-us -> /company -> /about/ (4 hops).

**Recommendation:** Update all internal links to point directly to final destination URLs. Fix redirect chains to be single-hop (301 from old directly to final URL).

---

### ISSUE-T8: App and API routes indexed [LOW]

**Severity:** LOW
**Impact:** 340 low-quality pages in index diluting crawl budget

The `/app/*` path (SPA dashboard routes) and `/api/*` path (API documentation) are not blocked in robots.txt. Google has indexed:

- 340 app routes (login, dashboard, settings, onboarding — mostly empty shells since content is client-rendered)
- 89 API documentation routes (auto-generated Swagger/OpenAPI pages)
- These 429 pages have <10 words of indexable content each
- Average bounce rate: 96%
- Average time on page: 0:04

**Recommendation:**
- Add to robots.txt: `Disallow: /app/` and `Disallow: /api/`
- Add `<meta name="robots" content="noindex, nofollow">` to app shell template as belt-and-suspenders
- Submit URL removal requests in GSC for currently indexed app pages
- Consider moving API docs to a subdomain if they should be separately discoverable (e.g., docs.acmeanalytics.com)

---

## Crawl Statistics

| Metric | Value |
|--------|-------|
| Total pages crawled | 476 |
| Content pages | 47 |
| App shell pages | 340 |
| API doc pages | 89 |
| Pages returning 200 | 441 |
| Pages returning 301 | 12 |
| Pages returning 404 | 23 |
| Average page size | 2.4MB (content pages), 89KB (app shells) |
| Average response time | 380ms |
| Pages with title tag | 389/476 (82%) |
| Pages with meta description | 34/476 (7%) |
| Pages with H1 | 312/476 (66%) |
| Duplicate titles | 340 (all app pages share "Acme Analytics - Dashboard") |
| Duplicate meta descriptions | 442 (default template description) |

---

## Mobile Usability (GSC)

4 issues flagged:

1. **Clickable elements too close together** — blog post tag links are 28px apart (need 48px)
2. **Content wider than screen** — pricing comparison table overflows on mobile
3. **Text too small to read** — footer text is 10px
4. **Viewport not set** — API documentation pages missing viewport meta tag

---

## Robots.txt (current)

```
User-agent: *
Allow: /
Sitemap: https://acmeanalytics.com/sitemap.xml
```

No disallow rules. Everything is crawlable.
