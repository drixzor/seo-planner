# Findings

## Audit Files

| Audit | File | Key Finding |
|-------|------|-------------|
| Technical | [audit/technical.md](audit/technical.md) | Lighthouse 34. Blog on HTTP subdomain hemorrhaging authority. Broken sitemap (12 of 47 URLs 404). Zero schema markup. CLS 0.42s. |
| Content | [audit/content.md](audit/content.md) | 12 blog posts averaging 480 words. No keyword targeting. No topical map. 4 orphan pages. Bounce rate 89% on blog. |
| Backlinks | [audit/backlinks.md](audit/backlinks.md) | DR 8. 23 referring domains, mostly low-quality directories. Zero editorial links. Competitor gap: 35-55 DR. |
| Competitors | [audit/competitors.md](audit/competitors.md) | 3 competitors analyzed. All have pillar-cluster architectures, DR 35-55, and 10-50x our organic traffic. |

---

## Additional Findings

### F-001: Blog subdomain is actively harming SEO

**Date:** 2026-01-17
**Phase:** AUDIT
**Constraint:** HARD

The blog lives at `blog.acmeanalytics.com` — a separate subdomain served over HTTP (not HTTPS). This means:

1. **Domain authority is split.** Google treats subdomains as semi-separate entities. The 8 backlinks pointing to blog posts contribute to blog.acmeanalytics.com's authority, not acmeanalytics.com. At DR 8, we can't afford to split.
2. **HTTP in 2026 is a ranking penalty.** Chrome shows "Not Secure" warnings. Google has confirmed HTTPS as a ranking signal since 2014.
3. **No internal link equity flows.** Links from the blog to product pages are treated as external links (subdomain boundary), so the blog content doesn't boost product page rankings.

**Impact:** This single issue likely suppresses all blog content rankings by 5-15 positions. Migration to /blog/ subfolder is the highest-ROI technical fix in the entire sprint.

**Resolution:** Migrated to acmeanalytics.com/blog/ on Jan 24 (Step 3). 187 URLs redirected with 301s. GSC showed full reindexing within 6 days. Traffic recovered within 48 hours of migration.

---

### F-002: 340 app routes polluting Google's index

**Date:** 2026-01-17
**Phase:** AUDIT
**Constraint:** SOFT

Screaming Frog discovered that `/app/*` and `/api/*` routes are crawlable and indexed by Google. There are 340 app routes (login, dashboard, settings, onboarding flows) and 89 API documentation routes in Google's index. These pages have near-zero content (app shells with JS-rendered content that Googlebot can't fully render) and 95%+ bounce rates.

**Impact:** Dilutes crawl budget. Google spends time crawling empty app shells instead of content pages. Also creates a confusing site footprint — Google sees 476 pages but only ~50 have real content. The "indexed but low quality" signal may suppress the entire domain.

**Resolution:** Added robots.txt disallow rules for /app/ and /api/ paths (T8). Submitted removal requests in GSC for already-indexed app URLs. After 4 weeks, indexed app pages dropped from 340 to 12 (some cached). Full deindexing expected within 6-8 weeks.

---

### F-003: Competitors all outspend us on content by 5-10x

**Date:** 2026-01-18
**Phase:** AUDIT
**Constraint:** HARD

Competitor analysis reveals a stark content gap:

| Site | Blog Posts | Avg Word Count | Publish Frequency |
|------|-----------|----------------|-------------------|
| Acme Analytics | 12 | 480 | ~1/month (irregular) |
| Userpilot | 287 | 1,850 | 8-10/month |
| Pendo | 412 | 2,100 | 12-15/month |
| LogRocket | 523 | 1,950 | 15-20/month |

We cannot match their volume. This is a hard constraint — budget allows 15 new pieces this sprint vs their 30-60 in the same period.

**Implication:** Must compete on specificity, not volume. Long-tail keywords where competitors haven't invested. Niche topics ("product analytics for small teams", "privacy-compliant tracking") where a single well-targeted page can outrank their tangential coverage.

**Resolution:** This finding directly informed the pivot (D-003). Instead of competing head-on, we targeted the gaps in their content maps.

---

### F-004: Existing content has zero search intent alignment

**Date:** 2026-01-18
**Phase:** AUDIT
**Constraint:** SOFT

Reviewed all 12 existing blog posts. None were written with a target keyword in mind. Titles are company-centric ("Our Journey Building Acme Analytics", "Why We Built Feature X", "Team Update: Q3 Retrospective") rather than search-intent-aligned.

Analysis of the 12 posts:
- 0/12 target a specific keyword with search volume
- 0/12 have meta descriptions optimized for CTR
- 3/12 have H2 subheadings
- Average word count: 480 (Google's avg first-page result: 1,447 words)
- 8/12 have no images
- 4/12 are orphaned (no internal links pointing to them)

**Impact:** These posts generate 0 organic traffic (confirmed via GSC — all 12 posts combined: 47 impressions, 2 clicks in 90 days). They're essentially invisible to search.

**Resolution:** Did not rewrite existing posts (not worth the effort at 480 words each). Instead, built the new pillar-cluster architecture from scratch. Two existing posts ("Our Journey Building Acme Analytics" and "Why We Chose Privacy-First Analytics") were repurposed as supporting evidence in the "privacy-compliant tracking" and "product analytics for small teams" pages (content recycled, original URLs 301'd).

---

### F-005: Sample size calculator is a disproportionate traffic driver

**Date:** 2026-03-28
**Phase:** MEASURE
**Constraint:** GHOST (positive finding, not a constraint)

The A/B test sample size calculator (/ab-testing/sample-size-calculator/) was published on March 10. By March 28 — just 18 days — it:

- Reached position 4 for "a/b test sample size calculator" (1,900 monthly searches)
- Drives 41% of all new organic sessions from the sprint
- Has the lowest bounce rate of any page (23%)
- Earned 3 organic backlinks (people linking to it from blog posts and documentation)
- Average time on page: 4:12 (users actively using the tool)

**Why it outperformed:** Interactive tools satisfy search intent perfectly. Users searching for "sample size calculator" want to USE a calculator, not read about sample sizes. Google rewards pages that fully satisfy intent. The tool also has inherent "stickiness" — users bookmark it and return, signaling engagement quality to Google.

**Implication for Sprint 2:** Invest in 2-3 more interactive tools. Candidates: "Statistical significance calculator", "Feature adoption rate benchmark tool", "Cohort analysis template generator." These are high-volume, low-KD, and naturally attract backlinks.

---

### F-006: CLS fix improved rankings across ALL pages, not just affected ones

**Date:** 2026-02-20
**Phase:** EXECUTE
**Constraint:** GHOST (positive finding)

After deploying the CLS fix (T2) on Feb 1, we observed ranking improvements not just on pages with CLS issues but across the entire domain:

- Pages with CLS issues: avg +4.2 position improvement
- Pages without CLS issues: avg +1.8 position improvement
- GSC "Page Experience" report went from 12% "Good URLs" to 78% within 10 days

**Interpretation:** Core Web Vitals are a site-wide signal, not a page-level signal. Fixing CLS on problematic pages lifted the entire domain's page experience score, which benefited all pages. This validates the decision to prioritize technical fixes before content (D-002).

**Caveat:** Correlation, not proven causation. Other factors (new content publishing, backlinks) were happening simultaneously. But the timing strongly suggests CWV improvement was a contributing factor.
