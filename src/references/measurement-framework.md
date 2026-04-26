# SEO Measurement Framework

A structured approach to measuring SEO progress, diagnosing failures, and making
data-driven decisions about whether to continue, pivot, or extend a sprint.

---

## 1. The 5-Why Root Cause Analysis Framework

When an SEO metric misses its target, don't just record the miss — diagnose WHY.

### Process

For each failed verification check:

1. **Why did this target miss?** Identify the immediate, observable cause.
   - Example: "Only 5 of 20 pages have meta descriptions."

2. **Why does that condition exist?** Identify the contributing factor.
   - Example: "The execution plan only covered 12 pages; 8 pages were missed."

3. **Why wasn't it caught during execution?** Identify the failed defense.
   - Example: "No page inventory check was run after execution to verify coverage."

4. **Why didn't the plan account for this?** Identify the planning gap.
   - Example: "The content audit missed dynamically rendered pages that don't exist as static files."

5. **What would prevent this in the future?** Identify the systemic fix.
   - Example: "Add a post-execution sweep step that counts meta tags across ALL rendered pages, not just source files."

### When to Stop

- Stop at the level where you find an **actionable** root cause.
- Level 2 is the minimum depth for any failure.
- Level 5 is only needed for systemic or recurring failures.
- If you reach level 5 and still haven't found an actionable cause, the problem is likely environmental (EXTERNAL_FACTOR) or structural (needs a fundamentally different approach).

---

## 2. Root Cause Classification

Every failure gets classified into exactly ONE of these four categories.

### WRONG_TARGET
**Definition**: The target itself was unrealistic given the site's current authority, resources, or timeline.

**Signals**:
- Target keyword KD is much higher than site DR
- Traffic targets assume growth rates unsupported by site authority
- Timeline is too short for the type of SEO work planned
- Targets were set without baseline data

**Examples**:
- Targeting KD 50 keywords when site DR is 12
- Expecting 4x traffic growth in 30 days from content alone
- Setting "position 1" targets for competitive head terms

**Recommended action**: PIVOT with adjusted targets. Recalculate using the KPI target formulas (Baseline x 1.5/2.5/4.0) with accurate baselines. Replace high-KD keywords with viable alternatives.

### POOR_EXECUTION
**Definition**: The strategy was sound but the implementation was incomplete or incorrect.

**Signals**:
- Tasks marked "Completed" but verification shows they're not actually done
- Schema markup has syntax errors
- Content was created but doesn't follow the brief (wrong keywords, missing sections)
- Internal links point to non-existent pages

**Examples**:
- Schema added but JSON is invalid
- Meta descriptions written but not saved to the actual files
- 12 of 20 planned pages were completed, 8 were skipped

**Recommended action**: CONTINUE with the current plan. Fix execution errors and re-run the incomplete tasks. The strategy doesn't need to change.

### EXTERNAL_FACTOR
**Definition**: Something outside the project's control changed after the plan was set.

**Signals**:
- Google algorithm update during the sprint
- Competitor launched competing content
- Hosting provider had downtime affecting indexation
- Domain was penalized for reasons unrelated to current work
- Search intent shifted (new SERP features, format changes)

**Examples**:
- Rankings dropped across the board after a core update
- Competitor published a comprehensive guide on the same topic
- CDN misconfiguration caused pages to return 503 for a week

**Recommended action**: DOCUMENT the external event, assess whether the current strategy is still valid, and re-evaluate. Do not blame execution for external changes.

### INSUFFICIENT_TIME
**Definition**: The strategy and execution are correct, but SEO results take time to materialize.

**Signals**:
- Content was published less than 6 weeks ago
- Technical changes were made less than 2 weeks ago (Google hasn't recrawled)
- Backlinks were built less than 8 weeks ago
- The metric being measured has a known lag (CrUX is 28-day rolling)

**Examples**:
- New blog posts aren't ranking yet (published 2 weeks ago)
- Core Web Vitals haven't improved in CrUX (changes made 10 days ago)
- Domain authority hasn't changed (backlinks built 1 month ago)

**Recommended action**: EXTEND the sprint. Do NOT pivot. Measure again after the appropriate time window has passed. Premature pivoting is the most common SEO planning mistake.

---

## 3. Convergence Score Formula

Tracks whether the project is improving across sprints.

```
convergence_score = (checks_passing_now - checks_passing_before) / total_checks
```

### Interpretation

| Score Range | Meaning | Action |
|-------------|---------|--------|
| > +0.2 | Strong improvement | Strategy working. Continue and scale. |
| +0.05 to +0.2 | Moderate improvement | Strategy working. Continue, look for optimizations. |
| -0.05 to +0.05 | Stagnant | Investigate why. Check for INSUFFICIENT_TIME vs WRONG_TARGET. |
| -0.2 to -0.05 | Mild regression | Something broke. Check for technical regressions. |
| < -0.2 | Severe regression | CRITICAL. Stop execution. Investigate immediately. Likely EXTERNAL_FACTOR or major POOR_EXECUTION. |

### Per-Check Tracking

Also track individual check movement:

| Movement | Definition | Action |
|----------|-----------|--------|
| Improved | Was FAIL, now PASS | Execution working for this area |
| Same (PASS) | Was PASS, still PASS | Stable. No regression. |
| Same (FAIL) | Was FAIL, still FAIL | Investigate: is this INSUFFICIENT_TIME or POOR_EXECUTION? |
| Regressed | Was PASS, now FAIL | CRITICAL. Something was broken during this sprint. |

Any REGRESSED check is automatically flagged as CRITICAL in the review.

---

## 4. Momentum Tracking (PIVOT Oscillation Detection)

### The Problem
Teams sometimes oscillate between strategies without giving any single strategy enough time to work. Each PIVOT resets the clock, and the project never makes progress.

### Detection
Before executing a PIVOT:
1. Count the number of PIVOTs recorded in `state.md` transition history.
2. Check the time between PIVOTs.

### Thresholds

| Condition | Signal | Action |
|-----------|--------|--------|
| 0-1 PIVOTs in current cycle | Normal | PIVOT if data supports it |
| 2 PIVOTs in current cycle | Warning | Warn user about oscillation risk. Recommend decomposition. |
| 3+ PIVOTs in current cycle | Critical | Strongly recommend stopping PIVOTs. Decompose the problem into smaller, independently testable sub-problems. |
| PIVOT within 2 weeks of previous PIVOT | Red flag | Almost certainly INSUFFICIENT_TIME, not WRONG_TARGET. Extend instead. |

### Decomposition Recommendation
When PIVOT oscillation is detected, recommend:
1. Break the plan into 3-5 independent sub-goals.
2. Execute and measure each sub-goal independently.
3. Only PIVOT the specific sub-goal that fails, not the entire strategy.
4. This prevents "throwing out the baby with the bathwater."

---

## 5. SEO Measurement Timing Rules

Not all SEO metrics are meaningful at all times. Measuring too early produces noise.

### When to Measure What

| Metric Category | Minimum Wait After Implementation | Why |
|-----------------|----------------------------------|-----|
| **Technical fixes** (meta tags, schema, canonical, robots.txt, sitemap) | 1-2 weeks | Google needs to recrawl and reprocess the pages. Submit sitemap and request indexing via GSC to speed up. |
| **Page speed / Core Web Vitals** | 28 days | CrUX (Chrome User Experience Report) is a 28-day rolling average. Lighthouse lab scores change immediately, but field data lags. |
| **New content rankings** | 6-8 weeks | New pages need to be discovered, indexed, and evaluated. Initial ranking signals are unreliable. |
| **Content optimization impact** | 4-6 weeks | Updated content needs recrawling and re-evaluation. |
| **Internal linking changes** | 2-4 weeks | Google needs to recrawl linking pages and redistribute PageRank. |
| **Backlink impact on rankings** | 8-12 weeks | Link equity passes slowly. Google discovers and evaluates links over time. |
| **Domain authority / DR changes** | 3-6 months | Third-party metrics (Ahrefs DR, Moz DA) update infrequently and lag real authority changes. |
| **Organic traffic trends** | 30+ days | Need enough data points to distinguish signal from noise. Weekly fluctuations are normal. |

### What This Means in Practice
- Sprint 1 measurement should focus on **technical verification** (can we confirm the changes are live and correct?), not ranking or traffic changes.
- Sprint 2+ can start evaluating **early ranking signals** if sprint 1 changes are 6+ weeks old.
- **Never mark a metric as FAIL before its measurement window.** Classify as INSUFFICIENT_TIME instead.

---

## 6. Fallback Measurement Strategies

When primary measurement tools are unavailable, use these alternatives.

### Lighthouse Unavailable
| Instead of... | Measure... | How |
|---------------|-----------|-----|
| Performance score | Render-blocking resources | Count `<script>` tags in `<head>` without `defer`/`async` |
| LCP | Largest image/hero size | Check file sizes of hero images and above-fold content |
| CLS | Layout shift risk | Check for images without `width`/`height`, dynamic content injection |
| INP | Input handlers | Check for heavy JavaScript on interactive elements |
| Overall speed | Page weight | Sum all resources (HTML + CSS + JS + images) referenced in the page |

### Google Search Console Unavailable
| Instead of... | Use... | How |
|---------------|--------|-----|
| Indexation count | `site:domain.com` search | Count results (approximate) |
| Crawl errors | Manual link checking | Verify all internal links resolve |
| Search queries | Keyword mapping from content | Infer target keywords from optimized pages |
| Click-through rate | Meta tag quality audit | Compelling titles/descriptions = better CTR (proxy) |

### Ahrefs / SEMrush Unavailable
| Instead of... | Use... | How |
|---------------|--------|-----|
| Domain Rating (DR) | Internal link analysis | Map internal link graph as a proxy for authority distribution |
| Backlink count | GSC Links report | If GSC available; otherwise note as unmeasurable |
| Keyword difficulty | Competitor SERP analysis | Manually check who ranks for target keywords |
| Referring domains | Manual outreach tracking | Track outreach sent and links earned manually |

### Analytics Unavailable
| Instead of... | Use... | How |
|---------------|--------|-----|
| Organic sessions | Server logs | If available, count organic referrer hits |
| Bounce rate | Content quality assessment | Manual assessment of content relevance and structure |
| Conversion rate | CTA presence audit | Verify CTAs exist and are well-positioned |
| User behavior | Content structure analysis | Proper headings, readability, engagement elements |

---

## 7. Putting It All Together

The measurement agent should follow this sequence:

1. **Collect metrics** — run all verification checks, using fallbacks where needed.
2. **Evaluate** — PASS/FAIL each check against plan targets.
3. **Diagnose** — 5-Why root cause analysis on each FAIL.
4. **Classify** — assign each failure to WRONG_TARGET / POOR_EXECUTION / EXTERNAL_FACTOR / INSUFFICIENT_TIME.
5. **Converge** — calculate convergence score vs previous sprint (sprint 2+).
6. **Recommend** — based on classification distribution:
   - Mostly POOR_EXECUTION -> CONTINUE with fixes
   - Mostly WRONG_TARGET -> PIVOT with adjusted targets
   - Mostly INSUFFICIENT_TIME -> EXTEND the sprint
   - Mostly EXTERNAL_FACTOR -> DOCUMENT and re-evaluate
   - Mixed -> DECOMPOSE into sub-problems and address each independently

This framework ensures measurement is never just "did we hit the number?" but always "why or why not, and what do we do about it?"
