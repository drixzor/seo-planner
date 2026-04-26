# Sprint Summary

**Site:** acmeanalytics.com
**Sprint:** 2026-01-15 to 2026-04-15 (90 days)
**Outcome:** PARTIAL SUCCESS (5 of 7 success criteria met)

---

## Results at a Glance

| Metric | Before | After | Target | Met? |
|--------|--------|-------|--------|------|
| SCORE | 7/25 | 14/25 | 15/25 | No (-1) |
| Organic sessions/month | 2,400 | 5,100 | 10,000 | No (51%) |
| Keywords in top 20 | 0 | 6 | 10 | No (60%) |
| Domain Rating | 8 | 18 | 20 | No (90%) |
| Lighthouse Performance | 34 | 78 | 90 | No (87%) |
| Core Web Vitals | 0/3 green | 3/3 green | 3/3 | Yes |
| Referring domains | 23 | 38 | 45 | No (84%) |
| Organic signups | 8/mo | 34/mo | 30/mo | Yes |
| Bounce rate (organic) | 71% | 56% | 50% | No (close) |

Traffic doubled (+113%). Signups quadrupled (+325%). But we fell short of the ambitious 10K sessions target by about half.

---

## What Happened

### Phase 1: Audit (Jan 15-18, 3 days)
Discovered the site was in worse shape than expected. Blog on a separate HTTP subdomain splitting domain authority. Lighthouse at 34. Zero keyword-targeted content. DR 8 with no editorial backlinks. SCORE 7/25 — starting from near zero.

### Phase 2: Plan v1 (Jan 18-22, 4 days)
Built a pillar-cluster content strategy targeting 3 topic areas with 15 cluster pages. Original keyword targets were competitive head terms (KD 54-67). Plan approved and execution began.

### Phase 3: Execute + Pivot (Jan 22 - Apr 1)
Technical fixes completed ahead of schedule (all 8 done by Feb 6). Blog subdomain migration went cleanly. Content publishing started Jan 27.

**The pivot (Feb 8):** After 3 weeks, zero ranking movement on head terms. Ahrefs re-analysis confirmed what should have been obvious: a DR 8 site cannot rank for KD 60+ keywords in 90 days. Meanwhile, one low-KD article had already reached position 34 in 12 days.

Shifted all keyword targets to long-tail (KD 8-28). This was the right call — it saved the sprint — but it cost 3 weeks of content aging. Those 3 weeks explain most of the gap between actual (5,100) and target (10,000) traffic.

Content production stayed on schedule. 15 cluster pages + 3 pillar hubs + 5 comparison pages published. Survey launched, 142 responses collected, report published. Outreach yielded 15 new referring domains (target was 10).

The breakout: the A/B test sample size calculator reached position 4 within 18 days and now drives 41% of all organic traffic. Interactive tools are dramatically underrated for SEO.

### Phase 4: Measure + Close (Apr 1-15)
Two-week measurement window confirmed traffic trajectory. Growth is compounding — March was +38% over February, April tracking +22% over March. The content flywheel is spinning but hasn't reached full velocity.

---

## Key Decisions and Their Outcomes

| Decision | Outcome |
|----------|---------|
| **D-001:** Pillar-cluster over flat blog | Correct. Hub pages rank for 3 keywords each. Cluster pages indexed 40% faster than orphan content would have. |
| **D-002:** Technical fixes before content | Correct. CWV fix lifted rankings domain-wide. Blog migration consolidated authority. |
| **D-003:** PIVOT to long-tail keywords | Correct, but should have been the plan from day 1. A DR 8 site targeting KD 60+ keywords was unrealistic. The 3 weeks spent on head-term content before pivoting is the main reason we fell short of 10K. Lesson: start with the domain authority you have, not the one you want. |
| **D-004:** Programmatic comparison pages | Partially correct. Manual comparison page ranks well (#8). Programmatic pages averaging position 28 — need enrichment. The template approach works but needs higher-quality editorial sections. |
| **D-005:** Digital PR over paid links | Correct. 15 quality referring domains acquired at zero link-buying cost. Survey report was the standout (7 links from one asset). DR moved from 8 to 18, cleanly. |

---

## Lessons Learned

### 1. Match keyword difficulty to your current domain authority
The single biggest mistake was targeting KD 54-67 keywords from a DR 8 domain. The math never worked. Rule of thumb: target keywords where KD <= DR + 15. For a DR 8 site, that means KD <= 23. We learned this empirically at the cost of 3 weeks.

### 2. Interactive tools are disproportionately effective
The A/B test sample size calculator (3 dev days to build) drives more traffic than the other 14 content pieces combined. Tools satisfy search intent perfectly, earn backlinks passively, have low bounce rates, and build brand recognition. Every sprint should include at least one interactive tool.

### 3. Survey data is a backlink magnet
The "State of Product Analytics 2026" survey took ~30 hours of work (design, distribution, analysis, writing) and earned 7 backlinks from DR 25-67 sites. That's $0 in outreach cost for 7 quality links. Original data is genuinely scarce — journalists and bloggers need statistics to cite, and if you're the source, you get the link.

### 4. Technical fixes compound across all pages
Fixing CLS improved rankings not just on affected pages but domain-wide (+1.8 positions on average for unaffected pages). Google's page experience signal is site-level, not page-level. Early technical investment pays dividends on every page you publish afterward.

### 5. Programmatic content needs a quality floor
Templated comparison pages (D-004) underperformed hand-written content. The 4 programmatic pages average position 28 vs the hand-written comparison page at position 8. Programmatic is efficient, but each page needs a genuine editorial layer (not just template fill). Plan for 1h of editorial work per programmatic page.

---

## Financial Summary

| Item | Amount |
|------|--------|
| Contractor content | $2,400 |
| Tools (Ahrefs, Screaming Frog, SurferSEO) | $891 |
| Survey incentives | $340 |
| Podcast booking | $98 |
| **Total cash spend** | **$3,729** |
| Sarah's time (est. 130h @ $75/h internal cost) | $9,750 |
| Jake's time (est. 28h @ $85/h internal cost) | $2,380 |
| **Total loaded cost** | **$15,859** |

**Cost per new organic session:** $15,859 / 2,700 new sessions = $5.87
**Cost per new organic signup:** $15,859 / 26 new signups = $610 (vs $180 CAC from paid ads — organic needs more time to compound)

At current trajectory (traffic growing ~25%/month), break-even with paid CAC expected by month 6 (July 2026).

---

## Sprint 2 Recommendation

**Goal:** Grow from 5,100 to 15,000 monthly organic sessions in 90 days.
**Focus areas:**

1. **Content velocity (60% of effort):** The content flywheel is spinning. 8 keywords are in the "strike zone" (positions 19-37). New supporting content, content refreshes, and internal link building can push these into top 20. Target: 15 new pieces + 5 refreshes.

2. **Interactive tools (20% of effort):** Build 2-3 more tools based on the calculator's success. Candidates: statistical significance calculator, feature adoption rate benchmark, cohort analysis template. Each should take 2-4 dev days.

3. **Link building at scale (15% of effort):** Continue digital PR. Expand HARO cadence. Target builtin.com and smashingmagazine.com from the competitor link gap analysis. Goal: 20 new referring domains, DR 25+.

4. **Technical: Lighthouse to 90 (5% of effort):** Implement Intercom facade pattern (load on interaction). Defer HubSpot script. Should gain 10-15 Lighthouse points.

**Budget estimate:** ~$4,500 cash + similar internal time allocation.

**Expected outcome:** If traffic continues compounding at 25-30%/month with Sprint 2 content acceleration, 15K sessions by July is achievable. The foundation (technical health, topical authority, linking architecture) is now solid. Sprint 2 is about volume and velocity.
