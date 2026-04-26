# Technical SEO Reference

Comprehensive checklist for site health, crawlability, and performance. Every item here is a prerequisite — content and links only work when the technical foundation is solid.

---

## 1. Page Speed Optimization

### Core Web Vitals Targets
| Metric | Good | Needs Improvement | Poor |
|--------|------|--------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5–4.0s | > 4.0s |
| FID (First Input Delay) / INP | < 100ms / < 200ms | 100–300ms / 200–500ms | > 300ms / > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1–0.25 | > 0.25 |

### Lighthouse Score Targets
- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 95+

### Speed Optimization Checklist
- [ ] Enable server-level compression (Gzip/Brotli)
- [ ] Set proper cache headers (static assets: 1 year, HTML: short or no-cache)
- [ ] Minimize render-blocking CSS (inline critical CSS, defer non-critical)
- [ ] Minimize render-blocking JS (defer/async all non-essential scripts)
- [ ] Optimize images: compress, serve WebP/AVIF, use responsive `srcset`
- [ ] Lazy load below-the-fold images and iframes (`loading="lazy"`)
- [ ] Preload critical resources (`<link rel="preload">` for fonts, hero images)
- [ ] Preconnect to required origins (`<link rel="preconnect">`)
- [ ] Use a CDN for static assets
- [ ] Minimize third-party scripts (tag managers, analytics, chat widgets)
- [ ] Enable HTTP/2 or HTTP/3
- [ ] Reduce DOM size (target < 1,500 nodes)
- [ ] Avoid excessive CSS (remove unused styles with PurgeCSS or similar)
- [ ] Font optimization: use `font-display: swap`, subset fonts, limit font families

### Tools
- Google PageSpeed Insights (lab + field data)
- Chrome DevTools > Performance/Lighthouse
- WebPageTest.org (waterfall analysis)
- CrUX Dashboard (real user data)
- GTmetrix

---

## 2. Mobile-First Design

Google uses mobile-first indexing. The mobile version of your site IS your site for ranking purposes.

### Mobile Checklist
- [ ] Responsive design (viewport meta tag present: `<meta name="viewport" content="width=device-width, initial-scale=1">`)
- [ ] Base font size >= 16px (prevents auto-zoom on iOS)
- [ ] Tap targets >= 48x48px with >= 8px spacing between them
- [ ] No horizontal scrolling at any breakpoint
- [ ] Content parity: mobile has same content as desktop (no hidden content)
- [ ] Mobile menu is crawlable (not JS-only rendering)
- [ ] Images scale properly across breakpoints
- [ ] Forms are usable on mobile (appropriate input types, large fields)
- [ ] Pop-ups and interstitials comply with Google's guidelines (no intrusive interstitials)
- [ ] Test on real devices, not just DevTools emulation
- [ ] AMP only if strategically required (no longer a ranking factor for most sites)

### Testing
- Google Mobile-Friendly Test
- Chrome DevTools device emulation
- BrowserStack / LambdaTest for real device testing

---

## 3. Crawlability

### robots.txt
- [ ] File exists at `/robots.txt`
- [ ] Does NOT block CSS, JS, or images needed for rendering
- [ ] Points to XML sitemap: `Sitemap: https://example.com/sitemap.xml`
- [ ] Disallow only what should not be indexed (admin, staging, search results, tag pages if thin)
- [ ] Separate rules for Googlebot, Bingbot if needed
- [ ] No accidental `Disallow: /` on production

```
# Example robots.txt
User-agent: *
Disallow: /admin/
Disallow: /search?
Disallow: /tag/
Allow: /

Sitemap: https://example.com/sitemap.xml
```

### XML Sitemap
- [ ] Exists and is submitted in Google Search Console
- [ ] Contains only 200 status URLs (no 3xx, 4xx, 5xx)
- [ ] Contains only canonical URLs
- [ ] Contains only indexable pages (no noindex pages)
- [ ] `<lastmod>` dates are accurate (only update when content actually changes)
- [ ] Max 50,000 URLs per sitemap file; use sitemap index for larger sites
- [ ] Sitemap is dynamically generated (not manually maintained)
- [ ] Includes all important page types (pages, posts, categories, products)

### Crawl Budget
- [ ] Fix crawl errors reported in Search Console
- [ ] Eliminate soft 404s (pages returning 200 but with "not found" content)
- [ ] Minimize redirect chains (max 1 hop)
- [ ] Remove or noindex thin/duplicate content
- [ ] Use pagination correctly (rel="next"/rel="prev" or load-more)
- [ ] Monitor crawl stats in Search Console > Settings > Crawl stats
- [ ] For large sites (100K+ pages): prioritize crawl budget to high-value pages

---

## 4. Indexation

### Canonical Tags
- [ ] Every page has a self-referencing canonical: `<link rel="canonical" href="...">`
- [ ] Canonical URLs are absolute (not relative)
- [ ] Canonical points to the preferred version (www vs non-www, https vs http)
- [ ] Paginated pages: canonical points to self (NOT to page 1)
- [ ] Duplicate content: canonical points to the primary version
- [ ] Canonical in HTTP header for non-HTML resources (PDFs, etc.)

### Index Control
- [ ] Use `noindex` meta tag for pages that should not appear in search (thin pages, internal search results, staging)
- [ ] Do NOT use `noindex` + `nofollow` together unless you want to block link equity flow
- [ ] Check for accidental noindex tags (common after staging deployments)
- [ ] Monitor "Excluded" pages in Search Console > Coverage/Indexing
- [ ] Submit important new pages via URL Inspection > Request Indexing

### Hreflang (International Sites)
- [ ] Implement hreflang tags for multilingual/multi-regional content
- [ ] Every hreflang tag set includes a self-referencing tag
- [ ] Include `x-default` for the fallback language/region
- [ ] Hreflang is reciprocal (page A references page B AND page B references page A)
- [ ] Use ISO 639-1 language codes and ISO 3166-1 Alpha 2 country codes

```html
<link rel="alternate" hreflang="en-us" href="https://example.com/page/" />
<link rel="alternate" hreflang="en-gb" href="https://example.co.uk/page/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page/" />
```

---

## 5. Schema Markup (Structured Data)

Structured data helps Google understand your content and can trigger rich results (stars, FAQs, breadcrumbs, etc.).

### Priority Schema Types

**Article** (blog posts, news)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2026-01-15",
  "dateModified": "2026-04-20",
  "image": "https://example.com/image.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  }
}
```

**FAQ** (frequently asked questions — can appear as expandable results)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is X?",
      "acceptedAnswer": { "@type": "Answer", "text": "X is..." }
    }
  ]
}
```

**HowTo** (step-by-step guides)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Do X",
  "step": [
    { "@type": "HowToStep", "name": "Step 1", "text": "Do this..." },
    { "@type": "HowToStep", "name": "Step 2", "text": "Then do this..." }
  ]
}
```

**Product** (e-commerce, SaaS pricing pages)
- Include: name, description, image, offers (price, currency, availability), aggregateRating, review

**Organization** (homepage)
- Include: name, url, logo, sameAs (social profiles), contactPoint

**BreadcrumbList** (all pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Category", "item": "https://example.com/category/" },
    { "@type": "ListItem", "position": 3, "name": "Page Title" }
  ]
}
```

**LocalBusiness** (local businesses)
- Include: name, address, telephone, openingHours, geo coordinates, image

### Schema Checklist
- [ ] Validate with Google Rich Results Test
- [ ] Validate with Schema.org validator
- [ ] Use JSON-LD format (Google's preference)
- [ ] One primary schema type per page (can have multiple supplementary)
- [ ] Schema content matches visible page content (no cloaking)
- [ ] Monitor rich results in Search Console > Enhancements

---

## 6. Site Architecture

### URL Structure
- [ ] URLs are short, descriptive, and keyword-inclusive
- [ ] Use hyphens as word separators (not underscores)
- [ ] Lowercase only (case sensitivity issues)
- [ ] No dynamic parameters in indexable URLs (use URL rewriting)
- [ ] Logical hierarchy: `example.com/category/subcategory/page-name/`
- [ ] Max 3 levels deep for important content (3 clicks from homepage)
- [ ] Trailing slash consistency (pick one, redirect the other)

```
Good:  /running-shoes/mens-trail-running-shoes/
Bad:   /p?id=12345&cat=shoes&sub=trail
Bad:   /Running_Shoes/Mens_Trail_Running_Shoes
```

### Breadcrumbs
- [ ] Visible breadcrumbs on all non-homepage pages
- [ ] BreadcrumbList schema markup matches visible breadcrumbs
- [ ] Breadcrumbs reflect site hierarchy (not browsing history)
- [ ] Each breadcrumb level is a clickable link (except current page)

### Pagination
- [ ] Paginated content uses `rel="next"` and `rel="prev"` (still useful for Bing)
- [ ] Each paginated page has unique content and unique title/meta
- [ ] Consider "load more" or infinite scroll with proper URL handling
- [ ] Paginated pages are self-canonicalized (NOT all pointing to page 1)

### Internal Navigation
- [ ] Primary navigation contains top-level categories
- [ ] Footer contains links to important pages (legal, about, contact, key categories)
- [ ] No orphan pages (every page reachable via at least one internal link)
- [ ] HTML sitemap page for users (optional but helpful for large sites)
- [ ] Maximum crawl depth: 3-4 clicks from homepage for any important page

---

## 7. SSL / HTTPS / Security

- [ ] Valid SSL certificate on all pages
- [ ] HTTP to HTTPS redirect (301) on all pages
- [ ] No mixed content warnings (all resources loaded over HTTPS)
- [ ] HSTS header enabled (`Strict-Transport-Security`)
- [ ] Certificate auto-renewal configured (Let's Encrypt / Cloudflare)
- [ ] Check for certificate expiry alerts

---

## 8. Redirects and Broken Links

### Redirects
- [ ] Use 301 (permanent) for permanent URL changes
- [ ] Use 302 (temporary) only for genuinely temporary redirects
- [ ] No redirect chains (A -> B -> C; should be A -> C)
- [ ] No redirect loops
- [ ] Redirect old URLs after site migration or URL structure changes
- [ ] Update internal links to point directly to final URLs (avoid relying on redirects)

### Broken Links
- [ ] Crawl site regularly for 404 errors (Screaming Frog, Sitebulb, Ahrefs)
- [ ] Fix or redirect broken internal links
- [ ] Fix or remove broken external links
- [ ] Custom 404 page with navigation and search
- [ ] Monitor 404 errors in Search Console

---

## 9. JavaScript Rendering

### SEO for JS-Heavy Sites
- [ ] Verify Google can render your pages (URL Inspection > View Tested Page)
- [ ] Critical content is in the initial HTML (not loaded via JS after render)
- [ ] Server-Side Rendering (SSR) or Static Site Generation (SSG) preferred
- [ ] If SPA: implement dynamic rendering for bots (Rendertron, Prerender.io)
- [ ] Internal links use `<a href="...">` tags (not JS click handlers or `<div onclick>`)
- [ ] Meta tags (title, description, canonical) are in initial HTML response
- [ ] Lazy-loaded content uses Intersection Observer (not scroll event listeners)
- [ ] Test rendered HTML with: `cache:example.com/page` in Google

### Framework-Specific Notes
- **Next.js / Nuxt.js**: Use SSR or SSG modes; avoid client-only rendering for important pages
- **React SPA**: Implement prerendering or SSR for SEO-critical pages
- **Angular**: Use Angular Universal for SSR
- **WordPress**: Generally fine (server-rendered); watch for JS-dependent plugins

---

## 10. International SEO

### Multi-Language Strategy
- [ ] Subdirectory structure preferred: `/en/`, `/fr/`, `/de/` (easier to manage than subdomains or ccTLDs)
- [ ] Each language version has unique, translated content (not auto-translated only)
- [ ] Hreflang tags correctly implemented (see Section 4)
- [ ] Language selector visible and crawlable
- [ ] Do NOT auto-redirect based on IP/language detection (let user choose, provide banner)
- [ ] Submit each language version in separate Search Console properties

### Geo-Targeting
- [ ] Use ccTLDs for country-specific sites (.co.uk, .de, .fr) when possible
- [ ] Set international targeting in Search Console (for generic TLDs)
- [ ] CDN with geo-distributed edge servers
- [ ] Local hosting or CDN PoP in target country for speed

---

## Technical SEO Audit Workflow

### Monthly Checks
1. Crawl full site with Screaming Frog or Sitebulb
2. Review Search Console: Coverage, Core Web Vitals, Enhancements
3. Check PageSpeed Insights for top 10 landing pages
4. Review crawl errors and fix/redirect
5. Check for new broken links
6. Verify structured data with Rich Results Test
7. Monitor indexation trends (indexed vs submitted)

### Quarterly Checks
1. Full Lighthouse audit on key page templates
2. Log file analysis (how Googlebot actually crawls the site)
3. Redirect audit (clean up chains, update internal links)
4. Schema markup review (add new types, fix errors)
5. Mobile usability review
6. International SEO audit (if applicable)
7. Security audit (SSL, mixed content, vulnerabilities)

### Tools Summary
| Tool | Use Case | Cost |
|------|----------|------|
| Google Search Console | Indexation, performance, errors | Free |
| Google PageSpeed Insights | Core Web Vitals, speed | Free |
| Screaming Frog | Site crawling, technical audit | Free (500 URLs) / Paid |
| Ahrefs Site Audit | Technical SEO + backlinks | Paid |
| Semrush Site Audit | Technical SEO + competitor | Paid |
| Schema Markup Validator | Structured data validation | Free |
| Chrome DevTools | Performance, rendering | Free |
| WebPageTest | Detailed speed analysis | Free |

---

## 11. Core Web Vitals Fix Recipes

Specific, actionable fixes for each Core Web Vital metric when it falls outside the "good" threshold.

### LCP > 2.5s (Largest Contentful Paint)

The LCP element is usually the hero image, a large text block, or a background image. Identify it first using Chrome DevTools > Performance > LCP marker.

1. **Preload the hero image**: Add `<link rel="preload" as="image" href="/hero.webp">` in the `<head>`. This tells the browser to fetch it immediately rather than waiting for CSS/JS to discover it.
2. **Use WebP or AVIF format**: Convert hero and above-the-fold images to WebP (30% smaller than JPEG) or AVIF (50% smaller). Use `<picture>` for fallback.
3. **Set explicit width and height**: Add `width` and `height` attributes to the LCP image to prevent layout reflow while loading.
4. **Defer non-critical JavaScript**: Move non-essential scripts to `defer` or `async`. Scripts in `<head>` without these attributes block rendering. Third-party scripts (analytics, chat widgets, ad tags) are the most common offenders.
5. **Use a CDN for static assets**: Serve images, CSS, and JS from edge servers geographically close to users. Cloudflare, AWS CloudFront, or Fastly are common choices.
6. **Inline critical CSS**: Extract the CSS required for above-the-fold content and inline it in `<style>` tags. Load the remaining CSS asynchronously.
7. **Optimize server response time**: Target TTFB < 600ms. Use caching, upgrade hosting, or add a reverse proxy (Varnish, nginx).

### CLS > 0.1 (Cumulative Layout Shift)

CLS measures unexpected visual movement. Every element that shifts after initial paint contributes to the score.

1. **Set explicit dimensions on all images and videos**: Always include `width` and `height` attributes or use CSS `aspect-ratio`. This reserves space before the media loads.
2. **Preload web fonts with font-display: swap**: Add `<link rel="preload" as="font" href="/font.woff2" crossorigin>` and set `font-display: swap` in your `@font-face` rules. This prevents the invisible-to-visible text flash that causes layout shift.
3. **Avoid dynamically injected content above the fold**: Banners, cookie notices, and promotional bars that push content down after load are major CLS offenders. Reserve space for them in the initial HTML or use CSS `transform` animations instead of layout-changing properties.
4. **Reserve space for ads and embeds**: Use `min-height` on ad containers to prevent content from jumping when the ad loads. For third-party embeds (YouTube, Twitter, maps), wrap in a container with `aspect-ratio` or fixed dimensions.
5. **Avoid inserting DOM elements above existing content**: If you must insert elements dynamically, add them below the current viewport or use CSS `contain: layout` on the container.

### INP > 200ms (Interaction to Next Paint)

INP replaced FID as of March 2024. It measures the delay between a user interaction (click, tap, keypress) and the next visual update.

1. **Break long tasks (>50ms) into smaller chunks**: Use `requestAnimationFrame` or `setTimeout(fn, 0)` to yield to the main thread between processing steps. Long tasks block all user interactions.
2. **Use requestIdleCallback for non-urgent work**: Analytics events, pre-fetching, and background calculations should run when the browser is idle, not during user interactions.
3. **Debounce input handlers**: For search-as-you-type, scroll handlers, and resize listeners, debounce with 100-200ms delay to prevent stacking function calls.
4. **Reduce main thread JavaScript**: Audit with Chrome DevTools > Performance > Main thread. Identify the heaviest scripts and consider code splitting, lazy loading, or removing them.
5. **Move heavy computation to Web Workers**: Image processing, data transformations, and complex calculations can run off the main thread in a Web Worker.
6. **Minimize third-party script impact**: Tag managers, analytics, A/B testing tools, and chat widgets often run expensive code on every interaction. Audit with "Third-party summary" in DevTools.

**Note:** FID has been replaced by INP (Interaction to Next Paint) as of March 2024. All references to FID should be treated as INP. The key difference is that FID only measured the first interaction, while INP measures the worst interaction throughout the entire page lifecycle.

---

## 12. JavaScript SEO Checklist

For sites using JavaScript frameworks (React, Vue, Angular, Next.js, Nuxt, SvelteKit, etc.), JavaScript rendering issues are the most common cause of indexation failures.

### Pre-Launch Checks

1. **Does the page render meaningful content without JavaScript?**
   - Test: `curl -s https://example.com/page | grep -i "<h1>"` — if the H1 is missing from the raw HTML, Googlebot may not see it
   - Test: Disable JavaScript in Chrome DevTools (Settings > Debugger > Disable JavaScript) and reload the page
   - If critical content is missing, you need SSR, SSG, or dynamic rendering

2. **Are key content elements in the initial HTML?**
   - H1 tag with the target keyword
   - Article body text / product description / main content
   - Internal navigation links (as `<a href>` tags, not JS click handlers)
   - Meta title and description tags
   - Canonical link tag
   - If any of these are injected by JavaScript after initial load, they may be missed or delayed for indexing

3. **Does Google render the page correctly?**
   - Go to Google Search Console > URL Inspection > enter the page URL
   - Click "Test Live URL" > view the rendered screenshot
   - Compare the screenshot to what a real user sees — are they identical?
   - Check the rendered HTML tab for the presence of key content elements

### Fixes for Common JavaScript SEO Problems

- **Content requires JS to render**: Implement Server-Side Rendering (SSR) or Static Site Generation (SSG). Next.js and Nuxt.js make this straightforward. For SPAs, use dynamic rendering (Rendertron, Prerender.io) as a stopgap.
- **Internal links use JavaScript navigation**: Replace `<div onClick={navigate}>` with `<a href="/path">`. Googlebot follows `<a>` tags reliably but cannot execute arbitrary click handlers.
- **JSON-LD schema injected by JavaScript**: Move structured data to a `<script type="application/ld+json">` block in the initial HTML response, not inside a React component that renders client-side.
- **Meta tags set by JavaScript**: Use SSR or a `<head>` management library (react-helmet, vue-meta, next/head) that injects tags during server render, not client-side hydration.
- **Lazy-loaded content never triggers for Googlebot**: Googlebot has limited scroll emulation. Use Intersection Observer for lazy loading (Googlebot supports it) rather than scroll position checks. For critical content, do not lazy load at all.
- **Hash-based routing (#/page)**: Googlebot does not execute hash-based navigation. Use History API pushState routing (/page) instead.
