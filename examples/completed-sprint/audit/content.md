# Content Audit

**Site:** acmeanalytics.com
**Date:** 2026-01-18
**Tools:** Screaming Frog, Ahrefs Content Explorer, Google Search Console, manual review
**Scope:** All pages under /blog/ and content-bearing marketing pages

---

## Summary

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Total blog posts | 12 | -- | LOW |
| Average word count | 480 | 1,400+ (first page avg) | FAIL |
| Posts targeting a keyword | 0/12 | All posts should | FAIL |
| Posts with meta description | 3/12 | All | FAIL |
| Posts with images | 4/12 | All | FAIL |
| Orphan pages (no internal links) | 4 | 0 | FAIL |
| Content hubs / pillar pages | 0 | 3-5 for topical authority | FAIL |
| Monthly organic clicks (blog) | 2 | -- | NEAR ZERO |
| Blog bounce rate | 89% | <65% | FAIL |
| Avg time on page (blog) | 0:38 | >2:00 | FAIL |

---

## Existing Blog Post Inventory

| # | Title | URL | Published | Words | Keyword Target | Organic Clicks (90d) | Internal Links In |
|---|-------|-----|-----------|-------|---------------|----------------------|-------------------|
| 1 | Our Journey Building Acme Analytics | /blog/our-journey/ | 2025-03-12 | 620 | None | 0 | 1 (footer) |
| 2 | Why We Chose Privacy-First Analytics | /blog/privacy-first/ | 2025-04-08 | 710 | None | 1 | 0 |
| 3 | Introducing Feature Flags | /blog/feature-flags/ | 2025-05-14 | 380 | None | 0 | 1 (footer) |
| 4 | Team Update: Q3 2025 | /blog/q3-update/ | 2025-07-20 | 290 | None | 0 | 0 (ORPHAN) |
| 5 | How We Use Our Own Product | /blog/dogfooding/ | 2025-08-01 | 540 | None | 0 | 1 (footer) |
| 6 | Series A Announcement | /blog/series-a/ | 2025-08-15 | 310 | None | 0 | 2 |
| 7 | What Product Managers Need from Analytics | /blog/pm-analytics/ | 2025-09-10 | 680 | None (incidental relevance) | 1 | 0 (ORPHAN) |
| 8 | Lessons from Our First 100 Customers | /blog/first-100/ | 2025-10-02 | 450 | None | 0 | 1 |
| 9 | Building a Data Culture at Startups | /blog/data-culture/ | 2025-10-28 | 520 | None | 0 | 0 (ORPHAN) |
| 10 | 2025 Year in Review | /blog/year-in-review/ | 2025-12-18 | 390 | None | 0 | 1 |
| 11 | Why Cohort Analysis Matters | /blog/cohort-analysis/ | 2026-01-05 | 440 | None | 0 | 0 (ORPHAN) |
| 12 | Meet the New Dashboard | /blog/new-dashboard/ | 2026-01-10 | 420 | None | 0 | 1 |

**Total organic clicks from all 12 posts in 90 days: 2**

---

## Content Quality Assessment

### Writing Quality
The writing is competent but undisciplined for SEO. Posts read like internal company updates or founder blog entries. Tone is informal, which is fine, but structure is not optimized for search or scanning:
- 0/12 posts use H2/H3 subheading hierarchy for scannability
- 0/12 include a table of contents
- 0/12 use numbered lists or comparison tables
- 2/12 include actionable takeaways
- The content serves the company narrative, not the reader's search intent

### Search Intent Alignment: Zero
None of the 12 posts were written to answer a search query. They were written to announce product updates, share company milestones, or publish thought-leadership pieces. While some ("What Product Managers Need from Analytics", "Why Cohort Analysis Matters") touch on topics with search volume, the articles don't target specific keywords, don't match search intent format, and aren't comprehensive enough to rank.

### Thin Content
9 of 12 posts are under 500 words. The average first-page Google result for product analytics keywords is 1,400+ words. These posts are 60-70% shorter than what ranks.

---

## Orphan Pages

4 pages have zero internal links pointing to them:

| Page | Why Orphaned |
|------|-------------|
| /blog/q3-update/ | Published to blog feed but never linked from anywhere else. Blog feed now only shows last 5 posts, so this fell off. |
| /blog/pm-analytics/ | Written by guest contributor, never integrated into site navigation. |
| /blog/data-culture/ | Published and never promoted. Not linked from any other page. |
| /blog/cohort-analysis/ | Most recent post, but blog homepage only shows 5 posts and this is #6. Fell off the visible feed within 2 weeks. |

**Root cause:** The blog has no category pages, no tag system, no archive page, and the blog homepage only shows the 5 most recent posts. Any post older than ~2 months becomes effectively invisible (not linked from anywhere discoverable).

---

## Content Gaps Identified

Using Ahrefs Content Gap analysis (acmeanalytics.com vs Userpilot, Pendo, LogRocket):

### High-Priority Gaps (KD < 30, vol > 200, competitors ranking)

| Keyword | Volume | KD | Competitors Ranking | Gap Type |
|---------|--------|-----|---------------------|----------|
| product analytics for small teams | 390 | 14 | Userpilot (#4) | Acme has no page on this topic |
| product analytics metrics | 720 | 22 | Pendo (#6), LogRocket (#9) | No page |
| session replay tools comparison | 590 | 18 | LogRocket (#2), Userpilot (#7) | No page |
| a/b testing for product managers | 510 | 12 | Pendo (#3) | No page |
| a/b test sample size calculator | 1,900 | 28 | None (tool-based results) | No page (tool opportunity) |
| privacy compliant user tracking | 440 | 15 | None of the 3 | Blue ocean — nobody targeting this |
| funnel analysis best practices | 680 | 24 | Pendo (#5), LogRocket (#11) | No page |
| heatmap analysis for product teams | 320 | 11 | LogRocket (#3) | No page |
| hotjar alternative privacy | 350 | 16 | Userpilot (#8) | No page |
| product analytics vs web analytics | 210 | 8 | None of the 3 | Blue ocean |

### Medium-Priority Gaps (KD 30-50, vol > 500)

| Keyword | Volume | KD | Note |
|---------|--------|-----|------|
| product analytics tools | 2,800 | 42 | Requires DR 30+ to compete. Sprint 2+. |
| user behavior analytics | 1,400 | 38 | Dominated by enterprise players. Sprint 3+. |
| session replay software | 1,100 | 35 | LogRocket owns this. Sprint 2+. |

---

## Marketing Pages Assessment

| Page | Words | Keyword Targeting | Internal Links | Notes |
|------|-------|-------------------|----------------|-------|
| / (homepage) | 890 | "Acme Analytics" (branded) | 8 | Decent but no schema markup |
| /features/ | 1,200 | None | 4 | Feature list, not SEO-optimized |
| /pricing/ | 340 | None | 2 | Thin. No FAQ section. |
| /demo/ | 180 | None | 1 | Form page, minimal content |
| /about/ | 520 | None | 3 | Company story, no search intent |
| /changelog/ | 2,400 | None | 1 | Long but not targeting any keyword |
| /security/ | 680 | None | 1 | Good content, not targeting "SOC 2 analytics" or similar |
| /integrations/ | 410 | None | 2 | List of integrations, no individual pages |

**Key finding:** Marketing pages have more content than blog posts but zero keyword targeting. The /features/ page (1,200 words) could rank for several product-related queries with optimization. The /integrations/ page should be expanded into individual integration pages (e.g., /integrations/segment/, /integrations/slack/) for long-tail capture.

---

## Internal Linking Analysis

| Metric | Value |
|--------|-------|
| Average internal links per page | 2.3 |
| Pages with 0 internal links (orphans) | 4 |
| Pages with 1 internal link | 8 |
| Pages with 5+ internal links | 3 (homepage, features, pricing) |
| Deepest page (clicks from homepage) | 4 clicks |
| Pages using breadcrumb navigation | 0 |

The internal linking structure is essentially flat and sparse. The homepage links to 8 pages. Those 8 pages link to a few others. Beyond that, pages are barely connected. There is no contextual interlinking (blog posts don't link to related posts, feature pages don't link to relevant blog content).

**Recommendation:** Implement a systematic internal linking strategy as part of the pillar-cluster architecture. Every cluster page links to its hub and to 2-3 sibling clusters. Every hub links to all its clusters. Breadcrumb navigation on all pages.

---

## Recommendations Summary

1. **Do not rewrite existing 12 posts.** They're too thin and off-topic to salvage. Repurpose 2 that have topical relevance, 301-redirect to new content where appropriate.
2. **Build 3 pillar hubs + 15 cluster pages from scratch.** Target the high-priority content gaps identified above.
3. **Fix the blog architecture:** category pages, full archive, pagination that keeps older posts discoverable.
4. **Implement internal linking rules:** minimum 3 contextual internal links per page, breadcrumbs, hub-spoke structure.
5. **Add content optimization standards:** minimum 1,200 words, target keyword in H1/title/URL, H2 subheadings every 200-300 words, at least 1 image per 500 words, meta description written for CTR.
