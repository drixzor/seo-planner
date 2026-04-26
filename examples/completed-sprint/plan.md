# SEO Sprint Plan v2

**Site:** acmeanalytics.com
**Sprint:** 2026-01-15 to 2026-04-15 (90 days)
**Owner:** Sarah Chen (Head of Growth)
**Iteration:** 2 (pivoted from head terms to long-tail on 2026-02-08, see D-003)

---

## Goal

Grow organic traffic from **2,400 to 10,000 monthly sessions** in 90 days by fixing critical technical debt, building a pillar-cluster content architecture targeting long-tail product analytics keywords, and establishing topical authority in the B2B analytics space.

---

## Current State Assessment

**SCORE Framework (baseline 2026-01-18):**

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **S**ite Health | 2/5 | Lighthouse 34, CLS 0.42s, blog on HTTP subdomain, broken sitemap, no schema markup |
| **C**ontent | 1/5 | 12 blog posts (avg 480 words), no keyword targeting, no topical map, 4 orphan pages |
| **O**ff-page | 1/5 | DR 8, 23 referring domains (mostly directories), zero editorial links |
| **R**ankings | 1/5 | 0 keywords in top 20, 3 keywords in top 100 (all branded) |
| **E**ngagement | 2/5 | Avg session 1:42, bounce rate 71%, 2.1 pages/session. Product pages decent, blog terrible (bounce 89%) |
| **TOTAL** | **7/25** | Starting from near-zero organic presence |

**Target State (end of sprint): SCORE 15/25**

| Dimension | Target | How |
|-----------|--------|-----|
| S | 4/5 | Lighthouse 90+, all CWV green, schema on all pages, HTTPS everywhere |
| C | 3/5 | 15 new pages in pillar-cluster structure, topical map complete, internal linking |
| O | 2/5 | DR 15+, 10 quality referring domains from digital PR |
| R | 3/5 | 15+ keywords in top 20, 3+ in top 5 |
| E | 3/5 | Bounce rate <60%, avg session >2:30 from organic |

---

## Topical Map

### Pillar 1: Product Analytics (hub: /product-analytics/)

| # | Cluster Page | Target Keyword | KD | Vol | Type |
|---|-------------|----------------|-----|-----|------|
| 1.1 | /product-analytics/for-small-teams/ | product analytics for small teams | 14 | 390 | Guide |
| 1.2 | /product-analytics/metrics-that-matter/ | product analytics metrics | 22 | 720 | Guide |
| 1.3 | /product-analytics/vs-web-analytics/ | product analytics vs web analytics | 8 | 210 | Comparison |
| 1.4 | /product-analytics/setup-guide/ | how to set up product analytics | 12 | 480 | Tutorial |
| 1.5 | /product-analytics/mixpanel-alternative/ | mixpanel alternative for startups | 19 | 260 | Comparison |
| 1.6 | /product-analytics/amplitude-vs-acme/ | amplitude vs acme analytics | 6 | 40 | Programmatic |

### Pillar 2: User Behavior Tracking (hub: /user-behavior-tracking/)

| # | Cluster Page | Target Keyword | KD | Vol | Type |
|---|-------------|----------------|-----|-----|------|
| 2.1 | /user-behavior-tracking/session-replay-tools/ | session replay tools comparison | 18 | 590 | Comparison |
| 2.2 | /user-behavior-tracking/heatmap-guide/ | heatmap analysis for product teams | 11 | 320 | Guide |
| 2.3 | /user-behavior-tracking/privacy-compliant/ | privacy-compliant user tracking | 15 | 440 | Guide |
| 2.4 | /user-behavior-tracking/funnel-analysis/ | funnel analysis best practices | 24 | 680 | Guide |
| 2.5 | /user-behavior-tracking/hotjar-alternative/ | hotjar alternative privacy | 16 | 350 | Comparison |

### Pillar 3: A/B Testing (hub: /ab-testing/)

| # | Cluster Page | Target Keyword | KD | Vol | Type |
|---|-------------|----------------|-----|-----|------|
| 3.1 | /ab-testing/for-product-managers/ | a/b testing for product managers | 12 | 510 | Guide |
| 3.2 | /ab-testing/sample-size-calculator/ | a/b test sample size calculator | 28 | 1,900 | Tool |
| 3.3 | /ab-testing/common-mistakes/ | a/b testing mistakes to avoid | 9 | 390 | Guide |
| 3.4 | /ab-testing/statistical-significance/ | statistical significance explained pm | 17 | 280 | Guide |

---

## Content Calendar

Priority order based on: keyword difficulty (lower first), search volume, funnel position (TOFU first to build authority).

| Week | Content Piece | Pillar | KD | Vol | Writer | Status |
|------|--------------|--------|-----|-----|--------|--------|
| W1 (Jan 27) | Product analytics vs web analytics | P1 | 8 | 210 | In-house | DONE |
| W1 (Jan 27) | A/B testing mistakes to avoid | P3 | 9 | 390 | In-house | DONE |
| W2 (Feb 3) | Heatmap analysis for product teams | P2 | 11 | 320 | In-house | DONE |
| W2 (Feb 3) | A/B testing for product managers | P3 | 12 | 510 | In-house | DONE |
| W3 (Feb 10) | How to set up product analytics | P1 | 12 | 480 | In-house | DONE |
| W3 (Feb 10) | Product analytics for small teams | P1 | 14 | 390 | Contractor | DONE |
| W4 (Feb 17) | Privacy-compliant user tracking | P2 | 15 | 440 | In-house | DONE |
| W4 (Feb 17) | Hotjar alternative privacy | P2 | 16 | 350 | In-house | DONE |
| W5 (Feb 24) | Statistical significance for PMs | P3 | 17 | 280 | Contractor | DONE |
| W5 (Feb 24) | Session replay tools comparison | P2 | 18 | 590 | In-house | DONE |
| W6 (Mar 3) | Mixpanel alternative for startups | P1 | 19 | 260 | In-house | DONE |
| W6 (Mar 3) | Product analytics metrics | P1 | 22 | 720 | In-house | DONE |
| W7 (Mar 10) | Funnel analysis best practices | P2 | 24 | 680 | Contractor | DONE |
| W7 (Mar 10) | A/B test sample size calculator | P3 | 28 | 1,900 | In-house (dev) | DONE |
| W8 (Mar 17) | Amplitude vs Acme (programmatic) | P1 | 6 | 40 | Programmatic | DONE |

**Pillar hub pages** (written in W1, updated as clusters publish):
- /product-analytics/ — DONE
- /user-behavior-tracking/ — DONE
- /ab-testing/ — DONE

---

## Technical Fix Priority List

Ordered by impact on crawlability and Core Web Vitals. All fixes from audit/technical.md.

| # | Fix | Severity | Impact | Est. Hours | Status |
|---|-----|----------|--------|------------|--------|
| T1 | Migrate blog.acmeanalytics.com to acmeanalytics.com/blog/ (subdomain to subfolder) | CRITICAL | Consolidates domain authority. Blog currently on separate subdomain with HTTP-only. | 8h | DONE |
| T2 | Fix CLS: hero image dimensions, font-display:swap, ad container reserved space | HIGH | CLS 0.42s -> target <0.1s. Currently failing CWV. | 4h | DONE |
| T3 | Fix broken XML sitemap (404, references old URLs) | HIGH | 47 URLs in sitemap, 12 return 404. Google can't discover pages. | 2h | DONE |
| T4 | Add structured data (Organization, Article, FAQ, BreadcrumbList) | HIGH | Zero schema markup. Missing rich snippet opportunities. | 6h | DONE |
| T5 | Implement proper canonical tags (15 pages have self-referencing errors) | MEDIUM | Duplicate content risk. Parameter URLs not canonicalized. | 3h | DONE |
| T6 | Compress images (avg 1.8MB hero images), convert to WebP, lazy load | MEDIUM | LCP 4.2s -> target <2.5s. 23 images over 500KB. | 4h | DONE |
| T7 | Fix internal 301 redirect chains (8 chains, longest is 4 hops) | LOW | Minor crawl budget waste. 8 chains found in Screaming Frog. | 2h | DONE |
| T8 | Add robots.txt rules for /app/ and /api/ paths (currently indexable) | LOW | 340 app routes in index, diluting crawl budget. | 1h | DONE |

**Total estimated: 30 hours of dev time**

---

## Internal Linking Architecture

```
Homepage
  |
  +-- /product-analytics/ (pillar hub)
  |     +-- /product-analytics/for-small-teams/
  |     +-- /product-analytics/metrics-that-matter/
  |     +-- /product-analytics/vs-web-analytics/
  |     +-- /product-analytics/setup-guide/
  |     +-- /product-analytics/mixpanel-alternative/
  |     +-- /product-analytics/amplitude-vs-acme/
  |
  +-- /user-behavior-tracking/ (pillar hub)
  |     +-- /user-behavior-tracking/session-replay-tools/
  |     +-- /user-behavior-tracking/heatmap-guide/
  |     +-- /user-behavior-tracking/privacy-compliant/
  |     +-- /user-behavior-tracking/funnel-analysis/
  |     +-- /user-behavior-tracking/hotjar-alternative/
  |
  +-- /ab-testing/ (pillar hub)
        +-- /ab-testing/for-product-managers/
        +-- /ab-testing/sample-size-calculator/
        +-- /ab-testing/common-mistakes/
        +-- /ab-testing/statistical-significance/
```

**Linking rules applied:**
- Every cluster page links to its pillar hub (mandatory)
- Every pillar hub links to all its clusters (mandatory)
- Cross-pillar links where topically relevant (e.g., funnel analysis -> A/B testing for PMs)
- Every new page links to 2-3 existing pages and receives links from 1-2 existing pages
- Breadcrumb navigation with BreadcrumbList schema on all pages
- Footer links to all 3 pillar hubs from every page

---

## Backlink Strategy

**Approach:** Digital PR + data-driven content (see D-005 for why we rejected paid links)

| Tactic | Target Links | Timeline | Status |
|--------|-------------|----------|--------|
| Original research: "State of Product Analytics 2026" survey (142 respondents) | 5-10 | Feb-Mar | DONE (7 links earned) |
| HARO responses (3x/week for 12 weeks) | 3-5 | Ongoing | DONE (2 links earned) |
| Guest posts on product management blogs (Mind the Product, ProductCoalition) | 2-3 | Mar | PARTIAL (1 published, 1 pending) |
| A/B test sample size calculator (linkable asset) | 3-5 | Mar-Apr | DONE (3 links earned, still accruing) |
| Podcast appearances (2 booked: Product Thinking, Analytics Hour) | 2 | Mar-Apr | DONE (2 links earned) |

**Results:** 15 new referring domains acquired (target was 10). DR moved from 8 to 18.

---

## KPI Targets

| Metric | Baseline (Jan 15) | 30-Day Target | 60-Day Target | 90-Day Target | Actual (Apr 15) |
|--------|-------------------|---------------|---------------|---------------|-----------------|
| Monthly organic sessions | 2,400 | 3,000 | 5,500 | 10,000 | 5,100 |
| Keywords in top 20 | 0 | 3 | 8 | 15 | 6 |
| Keywords in top 5 | 0 | 0 | 1 | 3 | 1 |
| Domain Rating (Ahrefs) | 8 | 10 | 14 | 20 | 18 |
| Referring domains | 23 | 28 | 33 | 45 | 38 |
| Lighthouse Performance | 34 | 80 | 90 | 90 | 78 |
| Core Web Vitals (pass) | 0/3 | 2/3 | 3/3 | 3/3 | 3/3 |
| Indexed pages | 47 (12 errored) | 50 | 60 | 65 | 62 |
| Organic signups | 8/mo | 15 | 30 | 60 | 34 |
| Bounce rate (organic) | 71% | 65% | 58% | 50% | 56% |

---

## Steps

| # | Step | Owner | Deadline | Risk | Status |
|---|------|-------|----------|------|--------|
| 1 | Complete technical audit (Lighthouse, Screaming Frog, GSC) | Sarah | Jan 18 | LOW - straightforward | DONE |
| 2 | Complete content + backlink + competitor audits | Sarah | Jan 18 | LOW | DONE |
| 3 | Fix T1: Migrate blog subdomain to /blog/ subfolder | Dev (Jake) | Jan 25 | **HIGH** - 301 redirects must be exact, risk of traffic loss during migration. Mitigation: staged rollout, monitor GSC hourly for 48h. | DONE |
| 4 | Fix T2-T4: CLS, sitemap, schema markup | Dev (Jake) | Feb 1 | MEDIUM - CLS fix requires front-end changes across 12 templates | DONE |
| 5 | Fix T5-T8: Canonicals, images, redirects, robots.txt | Dev (Jake) | Feb 8 | LOW | DONE |
| 6 | Build pillar hub pages (3 pages) | Sarah | Feb 3 | LOW | DONE |
| 7 | Publish cluster content weeks 1-4 (8 pieces) | Sarah + contractor | Feb 24 | MEDIUM - contractor quality risk. Mitigation: detailed briefs, editorial review. | DONE |
| 8 | Launch "State of Product Analytics 2026" survey | Sarah | Feb 15 | **HIGH** - response rate unknown. Mitigation: seed through PM communities, offer early access to results. Got 142 responses (target 200). | DONE |
| 9 | Publish cluster content weeks 5-8 (7 pieces + calculator) | Sarah + dev | Mar 17 | MEDIUM - calculator requires dev time. Mitigation: dev allocated 2 days. | DONE |
| 10 | Execute backlink outreach (HARO, guest posts, podcasts) | Sarah | Mar 31 | **HIGH** - outreach conversion typically 2-5%. Mitigation: volume approach (150+ pitches). | DONE |
| 11 | Internal linking pass: connect all pages, add breadcrumbs | Sarah | Apr 1 | LOW | DONE |
| 12 | Measurement window: collect data, analyze, write report | Sarah | Apr 15 | LOW | DONE |

---

## Assumptions

1. **Google indexes new pages within 2-3 weeks.** If indexing is slower, ranking timeline shifts right. Mitigation: submit via GSC, build internal links immediately.
2. **Long-tail keywords (KD 8-28) are rankable within 90 days at DR 8-20.** Based on Ahrefs data showing sites with DR 15+ ranking for KD <25 keywords within 60-90 days.
3. **Blog subdomain migration preserves existing traffic.** 301 redirects should transfer ~90% of link equity. Risk of temporary traffic dip during reindex.
4. **Contractor content meets quality bar.** 3 of 15 pieces assigned to contractor. Detailed briefs and editorial review required.
5. **Survey gets enough responses to be credible.** Need 100+ for "State of Product Analytics" to be linkable. Seeding through PM Slack communities.

## Failure Modes

| Mode | Probability | Impact | Detection | Response |
|------|------------|--------|-----------|----------|
| Blog migration breaks existing rankings | 20% | HIGH | GSC position monitoring, daily for 2 weeks | Revert migration, fix redirect map |
| Head-term keywords too competitive (REALIZED) | 60% | HIGH | No movement after 3 weeks | **PIVOT to long-tail (D-003, executed Feb 8)** |
| Survey gets <50 responses | 25% | MEDIUM | Track responses weekly | Pivot to internal data study using anonymized product data |
| Google algorithm update during sprint | 15% | HIGH | Rank tracking alerts | Pause content, reassess after update stabilizes |
| Contractor content rejected in review | 30% | LOW | Editorial review before publish | Rewrite in-house, extend timeline by 1 week |

## Pre-Mortem

*It's April 15. The sprint failed. What went wrong?*

1. We targeted keywords that were too competitive and never cracked page 1. -> **This partially happened.** We caught it at week 3 and pivoted (D-003). Long-tail strategy recovered the sprint.
2. The blog migration tanked existing traffic for 4+ weeks and we spent the whole sprint recovering. -> Did not happen. Migration went cleanly, 2-day dip then recovery.
3. We published 15 pieces of content but none of them matched search intent. Users bounced. -> Partially true for 2 comparison pages (bounce 78%). Revised with better comparison tables.
4. We couldn't get any backlinks and our DR stayed at 8, making all keywords unrankable. -> Did not happen. DR reached 18. Survey was the key asset.
5. The dev team couldn't prioritize technical fixes and we entered month 2 with Lighthouse still at 34. -> Did not happen. Jake completed all fixes by Feb 8 (ahead of schedule).

---

## Success Criteria

| Criterion | Threshold | Result |
|-----------|-----------|--------|
| Organic traffic increase | >= 100% (4,800+ sessions) | **PASS** (5,100, +113%) |
| Keywords in top 20 | >= 10 | **FAIL** (6) |
| Lighthouse Performance | >= 90 | **FAIL** (78) |
| Core Web Vitals all green | 3/3 passing | **PASS** |
| SCORE improvement | >= +6 points | **PASS** (7 -> 14, +7) |
| New referring domains | >= 10 quality | **PASS** (15 new) |
| Organic signups | >= 30/month | **PASS** (34/month) |

**Overall: 5/7 criteria met. Sprint outcome: PARTIAL SUCCESS.**

---

## Verification Strategy

- **Weekly:** GSC impressions/clicks, Ahrefs rank tracking, Lighthouse CI in deploy pipeline
- **Biweekly:** Full Screaming Frog crawl, content indexation check, backlink acquisition count
- **End of sprint:** Full SCORE reassessment, comparison to baseline, per-page performance analysis
- See verification.md for final results.

---

## Complexity Budget

| Category | Budgeted | Actual |
|----------|----------|--------|
| Dev hours (technical fixes) | 30h | 28h |
| Content pieces | 15 + 3 hubs | 15 + 3 hubs |
| Contractor cost | $2,400 (3 pieces @ $800) | $2,400 |
| Tools (Ahrefs, Screaming Frog, SurferSEO) | $297/mo x 3 = $891 | $891 |
| Digital PR / outreach | $0 (in-house) | $0 |
| Survey incentives (early access + swag) | $500 | $340 |
| Podcast booking platform | $49/mo x 2 = $98 | $98 |
| **Total** | **~$3,889 + 30h dev** | **~$3,729 + 28h dev** |
