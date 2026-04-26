# SCORE Framework Reference

The SCORE framework is the core evaluation rubric for SEO projects. It provides a structured way to assess where a site stands, what needs to happen, and how to measure progress.

**S**ite Optimization | **C**ontent Production | **O**utside Signals | **R**ank Enhancement | **E**valuate Results

---

## S — Site Optimization

Technical SEO health, loading speed, mobile experience, and crawlability.

### Scoring Criteria

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | Critical | Major technical issues blocking indexation or rendering. Site not crawlable, broken SSL, no sitemap, major speed issues. |
| 3-4 | Poor | Multiple technical issues hurting performance. Some pages not indexed, slow load times, mobile issues, missing schema. |
| 5-6 | Adequate | Basics covered but room for improvement. Site is crawlable and indexed, but speed, schema, or architecture need work. |
| 7-8 | Good | Strong technical foundation. Fast loading, mobile-optimized, proper schema, clean architecture. Minor issues remain. |
| 9-10 | Excellent | Best-in-class technical SEO. All Core Web Vitals green, comprehensive schema, perfect crawlability, no errors. |

### What to Assess
- [ ] Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Lighthouse Performance score (target 90+)
- [ ] Mobile-first design (responsive, 16px+ fonts, proper tap targets)
- [ ] SSL/HTTPS (valid cert, no mixed content)
- [ ] robots.txt (properly configured, not blocking important pages)
- [ ] XML sitemap (submitted, accurate, no errors)
- [ ] Canonical tags (self-referencing, no conflicts)
- [ ] Structured data (relevant schema types, no errors)
- [ ] Crawl errors (Search Console: zero critical errors)
- [ ] Site architecture (flat, logical, breadcrumbs)
- [ ] Redirect chains (none, all 301s resolve in one hop)
- [ ] JavaScript rendering (content visible to Googlebot)
- [ ] Indexation ratio (indexed pages / total pages > 90%)

### Key Metrics
| Metric | Source | Target |
|--------|--------|--------|
| Lighthouse Performance | PageSpeed Insights | 90+ |
| LCP | CrUX / PSI | < 2.5s |
| CLS | CrUX / PSI | < 0.1 |
| INP | CrUX / PSI | < 200ms |
| Crawl errors | Search Console | 0 critical |
| Indexation ratio | Search Console | > 90% |
| Mobile usability errors | Search Console | 0 |

---

## C — Content Production

Topical authority, content quality, production pipeline, and content coverage.

### Scoring Criteria

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | Critical | Little or no content. No topical strategy, thin pages, no regular publishing. |
| 3-4 | Poor | Some content exists but no strategy. Random topics, inconsistent quality, no topical map. |
| 5-6 | Adequate | Content strategy exists. Topical map started, regular publishing, but gaps in coverage and quality. |
| 7-8 | Good | Strong content program. Complete topical map, consistent quality, regular publishing, good internal linking. |
| 9-10 | Excellent | Dominant topical authority. Comprehensive coverage, original research, pillar+cluster architecture, high E-E-A-T. |

### What to Assess
- [ ] Topical map (exists, complete, prioritized)
- [ ] Pillar pages (comprehensive, well-structured, linked to clusters)
- [ ] Content clusters (supporting articles for each pillar, cross-linked)
- [ ] Content quality (E-E-A-T signals, depth, uniqueness, readability)
- [ ] Content freshness (regular updates, declining pages refreshed)
- [ ] Search intent match (every page matches its target intent)
- [ ] Content briefs (standardized, used for every piece)
- [ ] Production pipeline (planning -> writing -> editing -> publishing -> monitoring)
- [ ] Publishing cadence (consistent, sustainable, goal-driven)
- [ ] Content gaps vs competitors (identified, plan to fill)
- [ ] Internal linking (hub-spoke model, no orphan pages, 3-5 links per article)
- [ ] Writer team (qualified writers, editorial standards, style guide)
- [ ] On-page SEO (titles, metas, headings, images optimized)

### Key Metrics
| Metric | Source | Target |
|--------|--------|--------|
| Total indexed pages | Search Console | Growing monthly |
| Organic landing pages | Analytics | Growing monthly |
| Content coverage vs topical map | Manual | > 70% |
| Average time on page | Analytics | > 2 minutes |
| Pages per session | Analytics | > 1.5 |
| Engagement rate | GA4 | > 50% |
| Content freshness | Manual | No page > 12mo without update |

---

## O — Outside Signals

Backlink profile, brand mentions, social signals, and external authority.

### Scoring Criteria

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | Critical | No backlink profile. Zero or near-zero referring domains, no brand presence. |
| 3-4 | Poor | Minimal backlinks. Low DR, few referring domains, no active link building. |
| 5-6 | Adequate | Growing backlink profile. Some quality links, foundational backlinks done, but no systematic strategy. |
| 7-8 | Good | Strong backlink profile. Consistent referring domain growth, quality links, active digital PR. |
| 9-10 | Excellent | Dominant authority. High DR, strong link velocity, links from top publications, strong brand presence. |

### What to Assess
- [ ] Domain Rating / Domain Authority (Ahrefs DR, Moz DA)
- [ ] Number of referring domains (total and growth rate)
- [ ] Quality of referring domains (DR distribution, relevance)
- [ ] Anchor text profile (natural distribution, not over-optimized)
- [ ] Link velocity (new referring domains per month)
- [ ] Toxic links (spammy, PBN, irrelevant — identified and managed)
- [ ] Competitor backlink gap (who links to competitors but not to you)
- [ ] Foundational backlinks (directories, social profiles, DR 90+ platforms)
- [ ] Digital PR (data-driven content, statistics pages, journalist relationships)
- [ ] Brand signals (branded search volume, brand mentions without links)
- [ ] Social presence (active profiles, engagement, sharing)

### Key Metrics
| Metric | Source | Target |
|--------|--------|--------|
| Domain Rating | Ahrefs | Growing (site-dependent) |
| Referring domains (total) | Ahrefs | Growing monthly |
| New referring domains/month | Ahrefs | 10-30+ depending on stage |
| Referring domain quality | Ahrefs | > 50% DR 20+ |
| Toxic link ratio | Ahrefs | < 5% |
| Branded search volume | Search Console | Growing quarterly |

---

## R — Rank Enhancement

Active experiments, optimizations, and tactics to improve existing rankings.

### Scoring Criteria

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | Critical | No optimization activity. Content published and forgotten, no testing or improvement. |
| 3-4 | Poor | Occasional updates. Some pages refreshed, but no systematic approach. |
| 5-6 | Adequate | Regular optimization. Content refresh schedule, some A/B testing, featured snippet targeting. |
| 7-8 | Good | Active growth program. Systematic content refresh, title testing, snippet optimization, internal link updates. |
| 9-10 | Excellent | Data-driven optimization machine. Continuous experimentation, rapid iteration, clear process for scaling winners. |

### What to Assess
- [ ] Content refresh program (declining pages identified and updated)
- [ ] Title tag testing (CTR optimization via Search Console data)
- [ ] Featured snippet targeting (paragraph, list, table formats optimized)
- [ ] "Striking distance" keywords (positions 4-20, plan to push to top 3)
- [ ] Quick wins identified (high-impression, low-CTR pages)
- [ ] SERP feature targeting (FAQ, HowTo, video, image packs)
- [ ] Page consolidation (thin pages merged, cannibalizing pages resolved)
- [ ] Conversion rate optimization (CTAs, lead magnets, forms)
- [ ] New content format experiments (video, tools, infographics, podcasts)
- [ ] Competitor monitoring (tracking competitor content and rankings)
- [ ] Growth experiments documented (hypothesis -> test -> result -> action)

### Key Metrics
| Metric | Source | Target |
|--------|--------|--------|
| Pages in positions 1-3 | Search Console | Growing monthly |
| Pages in positions 4-10 | Search Console | Decreasing (moving to 1-3) |
| Average CTR | Search Console | Improving monthly |
| Featured snippets owned | Ahrefs/Semrush | Growing |
| Content refreshes/month | Internal | 4-8+ |
| Experiments running | Internal | 2-4 at any time |

---

## E — Evaluate Results

Tracking KPIs, analyzing ROI, and making data-driven decisions.

### Scoring Criteria

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | Critical | No tracking. No analytics, no reporting, no understanding of performance. |
| 3-4 | Poor | Basic tracking only. GA4 installed but not configured, occasional manual checks, no reporting cadence. |
| 5-6 | Adequate | Regular reporting. Monthly reports, key metrics tracked, but no deep analysis or attribution. |
| 7-8 | Good | Data-driven decisions. Automated dashboards, weekly monitoring, clear KPIs, ROI tracked. |
| 9-10 | Excellent | Full attribution and optimization loop. Every action tracked to outcome, forecasting, automated alerts, continuous improvement. |

### What to Assess
- [ ] Analytics setup (GA4 properly configured, events tracked)
- [ ] Search Console monitoring (weekly review of performance)
- [ ] Rank tracking (primary keywords tracked weekly, tool in use)
- [ ] Traffic segmentation (organic, branded vs non-branded, by page, by cluster)
- [ ] Conversion tracking (goals, events, attribution)
- [ ] Revenue attribution (organic traffic -> leads -> revenue)
- [ ] Reporting cadence (weekly quick check, monthly deep report, quarterly review)
- [ ] Dashboard (automated, accessible to stakeholders)
- [ ] Competitive benchmarking (visibility vs competitors tracked)
- [ ] ROI calculation (SEO investment vs organic revenue)
- [ ] Forecasting (traffic and revenue projections based on current trajectory)

### Key Metrics
| Metric | Source | Target |
|--------|--------|--------|
| Organic sessions | GA4 | Growing monthly |
| Organic conversions | GA4 | Growing monthly |
| Organic revenue | GA4 + CRM | Positive ROI within 6-12 months |
| Keyword visibility | Ahrefs/Semrush | Growing |
| Non-branded organic traffic | Search Console | > 60% of total organic |
| Cost per organic acquisition | Internal | Decreasing over time |

---

## SCORE Summary Card

Use this to quickly assess a site's overall SEO maturity:

```markdown
## SCORE Assessment: [Site Name]
## Date: [YYYY-MM-DD]
## Assessor: [Name]

| Component | Score (0-10) | Key Issue | Priority Action |
|-----------|-------------|-----------|-----------------|
| **S**ite Optimization | /10 | [biggest issue] | [what to fix first] |
| **C**ontent Production | /10 | [biggest issue] | [what to fix first] |
| **O**utside Signals | /10 | [biggest issue] | [what to fix first] |
| **R**ank Enhancement | /10 | [biggest issue] | [what to fix first] |
| **E**valuate Results | /10 | [biggest issue] | [what to fix first] |
| **TOTAL** | /50 | | |

### Overall Rating
- 0-15: Critical — fundamental issues, start from scratch
- 16-25: Below Average — significant gaps, focus on foundations
- 26-35: Average — basics covered, optimize and grow
- 36-45: Above Average — strong foundation, focus on scaling
- 46-50: Excellent — world-class, maintain and innovate
```

---

## Sprint Readiness Assessment

Before starting any sprint (typically 2-4 week cycles), verify readiness:

### Pre-Sprint Checklist
- [ ] SCORE assessment completed (baseline established)
- [ ] Top 3 priorities identified from SCORE gaps
- [ ] Sprint goal defined (specific, measurable)
- [ ] Resources allocated (writer availability, tools access, development capacity)
- [ ] Access verified (Search Console, Analytics, CMS, SEO tools, hosting)
- [ ] Competitor baseline captured (their current rankings, DR, content count)
- [ ] Stakeholder alignment (goals, timelines, budget approved)

### Sprint Structure
```
Week 1: Technical fixes + content planning
Week 2: Content production + link building outreach
Week 3: Content production + optimization experiments
Week 4: Publishing + monitoring + sprint review
```

---

## 90-Day Milestone Targets

### Month 1 (Foundation)
- [ ] Technical audit complete, all critical issues fixed
- [ ] Topical map created (at least 50% complete)
- [ ] First pillar page published
- [ ] 4-6 cluster articles published
- [ ] Foundational backlinks set up (directories, social profiles)
- [ ] Analytics and tracking verified
- [ ] Rank tracking initialized for 50+ target keywords

### Month 2 (Growth)
- [ ] Remaining technical issues fixed
- [ ] Topical map 80%+ complete
- [ ] 8-12 new articles published (2 pillars + clusters)
- [ ] Internal linking audit complete
- [ ] First digital PR / linkable asset created
- [ ] HARO/Connectively responses started (5-10/week)
- [ ] Guest post outreach initiated (5-10 prospects)
- [ ] Content refresh: top 5 declining pages updated
- [ ] First rankings movement visible for long-tail keywords

### Month 3 (Acceleration)
- [ ] 8-12 new articles published
- [ ] First backlinks from outreach acquired
- [ ] Featured snippet optimization for top opportunities
- [ ] Quick-win pages optimized (positions 4-10 pushed toward top 3)
- [ ] Growth experiments designed and launched (title tests, content formats)
- [ ] 90-day review: SCORE re-assessment
- [ ] Organic traffic baseline established (meaningful comparison possible)
- [ ] ROI projection updated based on actual data

---

## Go / No-Go Criteria

### When to Proceed with Investment
- SCORE total > 20 (or clear path to it within 30 days)
- Technical foundation is solid or fixable within 2 weeks
- Content strategy is defined and resourced
- Business has clear conversion path from organic traffic
- Budget allows 6-12 month commitment (SEO is not a quick fix)
- Client/stakeholder understands timeline expectations

### When to Pause or Reconsider
- Site has fundamental technical problems that cannot be fixed (platform limitations)
- Business model does not benefit from organic search traffic
- No content resources available (no writers, no subject matter experts)
- Budget only allows 1-2 months (insufficient for ROI)
- Competing against established giants with no differentiation angle
- Site has active Google penalty with no clear resolution path

### Red Flags
- Client expects page 1 rankings in 30 days
- No budget for content production
- No access to technical implementation (cannot make changes to the site)
- History of black-hat SEO (PBNs, link spam, cloaking)
- Site is on a platform that limits SEO control (some website builders)
- Multiple failed SEO engagements with no post-mortem understanding

---

## Exact Scoring Criteria (1-5 Scale)

When a quick 1-5 score is needed instead of the full 0-10 scale above, use these precise definitions. Each score level has concrete, observable criteria so two different assessors produce the same score.

### Site Optimization (S) — 1 to 5

**Score 1: Broken Foundation**
- Lighthouse Performance score < 30
- No HTTPS or SSL certificate errors / mixed content warnings
- Mobile experience broken (no viewport meta tag, horizontal scrolling, tiny text)
- No XML sitemap submitted
- robots.txt missing or blocking important pages
- Multiple critical crawl errors in Search Console

**Score 2: Minimal Viability**
- Lighthouse Performance score 30-60
- HTTPS present but mixed content warnings on some pages
- Mobile works but experience is poor (slow, layout issues, small tap targets)
- XML sitemap exists but contains errors (404 URLs, non-canonical URLs)
- Some schema markup attempted but has validation errors
- Several redirect chains or broken internal links

**Score 3: Solid Basics**
- Lighthouse Performance score 60-80
- HTTPS clean, no mixed content
- Mobile experience good (responsive, readable, functional)
- XML sitemap valid, submitted in Search Console
- Some structured data implemented correctly (BreadcrumbList, Organization)
- Crawl mostly clean with minor issues (a few soft 404s, minor redirect chains)
- Core Web Vitals: 1-2 in "Needs Improvement" range

**Score 4: Strong Technical Foundation**
- Lighthouse Performance score 80-90
- Core Web Vitals mostly green (LCP < 2.5s, CLS < 0.1, INP < 200ms on most pages)
- Full schema markup for relevant page types (Article, Product, FAQ, BreadcrumbList)
- Clean crawl: zero critical errors, < 5 warnings
- Proper canonical tags, hreflang (if international), pagination handling
- JavaScript content fully renderable by Googlebot

**Score 5: Best in Class**
- Lighthouse Performance score 90+
- All Core Web Vitals green across all page templates (verified in CrUX data)
- Comprehensive schema markup covering every page type with zero validation errors
- Zero crawl errors, zero redirect chains, 100% indexation of target pages
- Edge-optimized delivery (CDN, HTTP/3, Brotli compression)
- Proactive monitoring with automated alerts for regressions

### Content Production (C) — 1 to 5

**Score 1: No Strategy**
- Fewer than 10 indexable content pages
- No keyword targeting — content published randomly or not at all
- No topical map or content plan
- No regular publishing cadence
- Content is thin (< 300 words), duplicate, or auto-generated without review

**Score 2: Early Efforts**
- Some keyword targeting on a few pages
- No formal topical map, topics chosen ad hoc
- Irregular publishing (less than 2 pieces per month)
- No content briefs or editorial process
- Internal linking is sparse and unstructured

**Score 3: Organized Production**
- Topical map exists and covers at least 50% of the target topic space
- 1-2 pillar pages published with supporting cluster articles
- Regular publishing cadence (2+ articles per month)
- Content briefs used for most articles
- Internal linking follows a basic hub-and-spoke pattern
- Search intent is considered for new content

**Score 4: Mature Content Program**
- Full topical map with 3+ pillar topics and complete cluster coverage
- Content briefs used for every article, with SERP analysis included
- Publishing cadence of 4+ articles per month
- E-E-A-T signals present (author bios, expert credentials, cited sources)
- Content refresh schedule active (declining pages identified and updated quarterly)
- Strong internal linking with no orphan pages

**Score 5: Dominant Topical Authority**
- Complete topical coverage — recognized as a go-to resource in the niche
- Programmatic SEO or content at scale where applicable
- Regular content refresh cycle (monthly review of declining pages)
- Publishing cadence of 8+ pieces per month (mix of new and updated)
- Original research, proprietary data, or unique frameworks published
- Content contributes measurably to revenue (tracked attribution)

### Outside Signals (O) — 1 to 5

**Score 1: No Backlink Profile**
- Zero or near-zero referring domains (< 10)
- No brand presence on social platforms or directories
- Domain Rating / Domain Authority effectively zero
- No active link building of any kind

**Score 2: Foundational Only**
- Basic directory listings and social profiles created (10-50 referring domains)
- No active outreach or digital PR
- Low DR (< 20), most links are from low-quality or generic sources
- No content designed for link attraction (no data, tools, or research)

**Score 3: Growing Profile**
- 50-200 referring domains, some from quality sources (DR 30+)
- Foundational backlinks complete (directories, social, DR 90+ platforms)
- Some link building activity (HARO responses, occasional guest posts)
- Healthy anchor text distribution (not over-optimized)
- Competitor backlink gap identified but not yet systematically closed

**Score 4: Strong Authority**
- 200+ referring domains with consistent monthly growth (15-30 new/month)
- Active digital PR producing links from DR 50+ publications
- Content assets designed for linkability (statistics pages, free tools, research)
- Anchor text profile looks natural across branded, partial match, and generic
- Competitor gap systematically targeted with outreach campaigns

**Score 5: Dominant Authority**
- 500+ referring domains or DR 60+
- Links from top-tier publications in the niche (earned, not paid)
- Strong brand signals (high branded search volume, unlinked mentions)
- Passive link growth from existing assets (pages that attract links without outreach)
- Toxic link ratio < 2%, clean disavow file maintained

### Rank Enhancement (R) — 1 to 5

**Score 1: Publish and Forget**
- Content published and never revisited
- No rank tracking beyond occasional manual searches
- No experiments, no A/B testing, no optimization of existing pages
- No featured snippet targeting

**Score 2: Occasional Updates**
- Some pages refreshed when obviously outdated
- Rank tracking set up but reviewed infrequently
- No systematic process for identifying optimization opportunities
- Title tags and meta descriptions not tested or optimized for CTR

**Score 3: Regular Optimization**
- Content refresh schedule in place (top 10 declining pages reviewed monthly)
- Featured snippet targeting for key queries (paragraph, list, table formats)
- "Striking distance" keywords identified (positions 4-20) with a plan to push them
- Some title tag testing based on Search Console CTR data

**Score 4: Active Growth Program**
- Systematic content refresh with documented before/after results
- Title tag and meta description testing with measurable CTR improvements
- Featured snippets actively won and defended
- Quick-win pages optimized every sprint (high impressions, low CTR)
- Growth experiments documented (hypothesis, test, result, next action)
- Internal linking updated regularly as new content publishes

**Score 5: Data-Driven Optimization Machine**
- Continuous experimentation across content, titles, formats, and CTAs
- Rapid iteration cycle (test results reviewed weekly, not monthly)
- Process for scaling winners (when a format works, replicate it across clusters)
- Cannibalization detected and resolved proactively
- Automated alerts for ranking drops on key pages
- Every optimization action tracked to organic traffic and revenue impact

### Evaluate Results (E) — 1 to 5

**Score 1: No Tracking**
- No analytics installed, or installed but not configured
- No Search Console access or monitoring
- No understanding of what organic traffic exists or where it comes from
- No reporting of any kind

**Score 2: Basic Tracking**
- GA4 installed but not fully configured (missing event tracking, no goals)
- Search Console connected but reviewed rarely (monthly at best)
- No rank tracking tool in use
- Reports are manual and ad hoc

**Score 3: Regular Reporting**
- GA4 properly configured with key events tracked (form submissions, clicks)
- Search Console reviewed weekly for errors and performance trends
- Rank tracking active for 50+ target keywords
- Monthly report produced with traffic, rankings, and key wins
- Basic segmentation (organic vs other, branded vs non-branded)

**Score 4: Data-Driven Decisions**
- Automated dashboard (Looker Studio, Databox) accessible to stakeholders
- Weekly monitoring cadence with alerts for anomalies
- Clear KPIs tied to business outcomes (leads, revenue, not just traffic)
- Conversion tracking and revenue attribution for organic channel
- Competitive benchmarking tracked quarterly

**Score 5: Full Attribution and Optimization Loop**
- Every SEO action tracked to its outcome (content published -> rankings -> traffic -> conversions -> revenue)
- Forecasting model based on historical data (projected traffic and revenue)
- Automated alerts for traffic drops, ranking changes, and indexation issues
- ROI calculated and reported (SEO investment vs organic revenue generated)
- Continuous improvement loop: data informs next sprint's priorities
