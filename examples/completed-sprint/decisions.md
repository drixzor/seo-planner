# Decisions

## D-001: Pillar-cluster architecture over flat blog

**Date:** 2026-01-20
**Phase:** PLAN
**Status:** ACCEPTED

**Context:** Acme's existing blog has 12 posts with no structure. Two options: (A) continue publishing standalone posts targeting whatever keywords look good, or (B) build a pillar-cluster architecture with 3 hub pages and 15 supporting cluster pages with systematic internal linking.

**Options considered:**
1. **Flat blog** — publish 15 posts targeting keywords independently. Simpler, faster to execute. No architectural overhead.
2. **Pillar-cluster** — 3 pillar hubs + 15 cluster pages. Requires URL restructuring, internal linking strategy, and topical planning upfront. Slower to start, but builds topical authority signals.

**Decision:** Option 2 (pillar-cluster).

**Rationale:** At DR 8, we can't compete on individual page authority. Our only path to ranking is demonstrating topical depth. Google's helpful content signals reward sites that cover topics comprehensively. A pillar-cluster structure gives us:
- Internal link equity flowing from hub to clusters and back
- Clear topical relevance signals (URL structure, semantic proximity)
- A scalable framework for Sprint 2+ (add clusters without restructuring)

Ahrefs competitor analysis showed all 3 competitors use hub-and-spoke content architectures. Sites with topical clusters rank 2-3x more keywords per page than flat blog equivalents at similar DR (per Ahrefs' 2025 study on content architecture).

**Trade-offs accepted:** 2 extra days in planning phase. URL restructuring required. More complex editorial calendar.

**Outcome:** The architecture worked. Pillar hubs rank for 3 keywords each (aggregated cluster authority). Cluster pages with links from the hub indexed 40% faster than orphan pages would have.

---

## D-002: Technical fixes before content

**Date:** 2026-01-20
**Phase:** PLAN
**Status:** ACCEPTED

**Context:** The site has major technical issues (Lighthouse 34, CLS 0.42s, broken sitemap, HTTP blog subdomain). We could start publishing content immediately while fixing technical issues in parallel, or block content until the foundation is solid.

**Options considered:**
1. **Content first, fix in parallel** — start publishing week 1, fix technical issues over 4 weeks alongside.
2. **Technical first, then content** — spend weeks 1-3 on technical fixes, start content in week 4.
3. **Hybrid** — fix critical issues (subdomain migration, sitemap) in week 1, start content in week 2, remaining fixes in parallel.

**Decision:** Option 3 (hybrid, with critical fixes gated).

**Rationale:** Publishing content on a site with a broken sitemap and HTTP blog subdomain is like pouring water into a leaky bucket. Google can't properly discover or index pages when the sitemap 404s and the blog is on a separate HTTP subdomain with no authority. However, waiting 3 full weeks to publish any content wastes indexing time.

Compromise: the subdomain migration (T1) and sitemap fix (T3) are prerequisites for content. CLS, schema, images, and other fixes can happen in parallel without blocking content publication.

**Trade-offs accepted:** Slight risk of publishing content before all CWV issues resolved (CLS might affect rankings). Accepted because CLS fix was deployed by end of week 2, and new content wouldn't rank immediately anyway.

**Outcome:** Blog migration completed Jan 24. First content published Jan 27. No traffic loss from migration (2-day dip, full recovery by Jan 28). All 8 technical fixes completed by Feb 8.

---

## D-003: PIVOT from head terms to long-tail keywords

**Date:** 2026-02-08
**Phase:** EXECUTE -> PLAN (pivot)
**Status:** ACCEPTED (pivot trigger)

**Context:** Sprint Plan v1 targeted competitive head terms: "product analytics tool" (KD 67, vol 5,400), "user behavior tracking software" (KD 54, vol 2,100), "A/B testing platform" (KD 61, vol 3,800). After 3 weeks of execution, zero movement in rankings.

**Evidence triggering pivot:**
- 3 weeks post-publish, none of the 4 published pieces appeared in top 100 for target keywords
- Ahrefs re-analysis: top 10 results for "product analytics tool" are ALL DR 65+ (Amplitude, Mixpanel, Heap, G2, Capterra)
- Estimated time to rank: 8-14 months at current DR trajectory
- Meanwhile, one article ("product analytics vs web analytics", KD 8) reached position 34 in just 12 days

**Decision:** Pivot all keyword targets to long-tail (KD 8-28). Rewrite content briefs for 11 remaining pieces. Add programmatic comparison pages (see D-004).

**Rationale:** The data is unambiguous. We're a DR 8 site trying to outrank DR 75 sites on their primary keywords. This isn't a content quality problem — it's a domain authority math problem. Long-tail keywords with KD <30 are where we can realistically rank within this sprint. The "vs web analytics" result proves the thesis: low-KD keywords with clear intent are rankable at our authority level.

The pivot costs 2 days of replanning but saves 8+ weeks of publishing content that won't rank. Every day spent targeting unrankable keywords is wasted.

**Trade-offs accepted:** Lower search volume per keyword (avg 430 vs 3,766). Total addressable volume from organic: ~7,500/mo vs ~11,300/mo. Accepted because ranking for 15 keywords at avg position 12 delivers more traffic than ranking for 0 keywords.

**Outcome:** Long-tail strategy worked. 6 keywords reached top 20 within 6 weeks of pivot. "A/B test sample size calculator" (KD 28) reached position 4 and drives 40% of new organic traffic. Would not have ranked for any head terms in this timeframe.

---

## D-004: Programmatic SEO for comparison pages

**Date:** 2026-02-09
**Phase:** PLAN (v2)
**Status:** ACCEPTED

**Context:** After the pivot to long-tail, we identified a pattern: "[competitor] alternative" and "[competitor] vs [competitor]" keywords have low KD (6-19) and clear commercial intent. There are ~30 such combinations for our space. Writing each manually would take 60+ hours.

**Options considered:**
1. **Manual comparison pages** — write 5-6 comparison pages by hand at ~4h each.
2. **Programmatic comparison pages** — build a template, populate with structured competitor data, generate 15-20 pages.
3. **Skip comparisons** — focus only on educational content.

**Decision:** Option 2 (programmatic), but limited scope. Build template for "[Acme] vs [Competitor]" pages only (not competitor-vs-competitor). Start with 1 manual page as template validation, then scale to 5 programmatic pages.

**Rationale:** Comparison keywords convert at 3-5x the rate of educational keywords (users actively evaluating tools). The template approach lets us cover more ground with less effort. Limiting to "Acme vs X" pages (not "X vs Y") keeps content genuine — we can speak authentically about our own product.

Risk: Google may see thin/duplicate content if pages are too templated. Mitigation: each page gets a unique 300-word editorial section with honest pros/cons. Template provides structure (feature table, pricing comparison, use case fit), editorial provides unique value.

**Trade-offs accepted:** Programmatic pages are inherently thinner than hand-written guides. Quality floor is lower. Requires dev time for template system (4h).

**Outcome:** Built 1 page manually ("Amplitude vs Acme Analytics"), performed well. Created 4 more programmatically. Average word count: 1,400 (template 900 + editorial 500). 2 of 5 pages indexed and ranking within 4 weeks. The manual "Amplitude vs Acme" page ranks #8 for "amplitude alternative for startups." Programmatic pages averaging position 28 — indexing but not yet ranking well. Will need content enrichment in Sprint 2.

---

## D-005: Digital PR over paid backlinks

**Date:** 2026-01-22
**Phase:** PLAN
**Status:** ACCEPTED

**Context:** With DR 8, backlink acquisition is critical for the sprint. Two schools of thought: (A) buy links from link vendors/PBNs for fast results, or (B) earn links through digital PR, original research, and linkable assets.

**Options considered:**
1. **Buy links** — $100-300/link from established vendors. Could acquire 15-20 links in 30 days. DR boost would be immediate.
2. **Digital PR + linkable assets** — original research survey, free tool (calculator), guest posts, HARO, podcast appearances. Slower, less predictable, but safer.
3. **Hybrid** — buy 5-10 links for quick DR boost while building earned links in parallel.

**Decision:** Option 2 (digital PR only, no purchased links).

**Rationale:**
- **Risk/reward:** Google's SpamBrain update (2025) specifically targets link schemes. A DR 8 site suddenly acquiring 20 links from link networks is a classic spam pattern. One manual penalty and we lose the entire sprint investment.
- **Sustainability:** Purchased links stop when you stop paying. Earned links compound. The survey report and calculator will attract links for months/years.
- **Cost:** Comparable. 20 purchased links at $150 avg = $3,000. Digital PR budget = $438 (survey incentives + podcast platform). The survey alone earned 7 links.
- **Quality:** Purchased links are typically DR 20-30 with low relevance. Our earned links include ProductCoalition (DR 52), Mind the Product (DR 61, pending), and 3 niche analytics blogs (DR 25-40). Higher quality, higher relevance.

The only argument for purchased links is speed. But our content needs 4-8 weeks to index and settle in rankings anyway. The earned links arrive on a similar timeline.

**Trade-offs accepted:** Less predictable timeline. Some outreach efforts will fail (HARO response rate ~3%). Total link count may be lower.

**Outcome:** 15 new referring domains acquired (target was 10). DR moved from 8 to 18. Zero spam risk. The "State of Product Analytics 2026" survey was the standout asset — 7 links from a single piece, including 2 from DR 45+ sites. The A/B test calculator earned 3 links organically (people finding it useful and linking to it). Total outreach sent: 163 pitches, 15 links earned (9.2% conversion — well above 2-5% industry average, likely because the survey data was genuinely novel).
