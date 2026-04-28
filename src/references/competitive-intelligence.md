# Competitive Intelligence Reference

Adversarial methodology for analyzing competitors. The goal is not to describe what competitors built — it is to identify where they are weak, what they tried and abandoned, and where their moats are thinner than they look. Strategy is bounded by the quality of this audit.

---

## 1. The Adversarial Framing

A descriptive competitor audit lists what competitors have. An adversarial audit identifies what they cannot defend.

### Why Descriptive Audits Fail
- They list page counts but not which pages rank — sitemap size is not effective surface area.
- They mark every advantage as "established" without quantifying replication cost — you cannot strategize against a moat you have not measured.
- They tolerate `[estimated]` numbers throughout — strategy built on guesses repeats the guess in execution.
- They miss what competitors tried and abandoned — failed templates are the strongest signal of where not to compete.

### Evidence Tier Rubric

Every numeric claim or factual finding gets exactly one tier label. No bare numbers.

| Tier | Definition | Source examples |
|------|------------|-----------------|
| `confirmed` | Directly observed from a primary source within 30 days | Live page fetch, Ahrefs/SEMrush/Similarweb pull, GSC competitor data, site:operator result |
| `inferred` | Derived from a confirmed source via documented logic | "Page count from sitemap.xml × 0.4 indexation ratio (confirmed via site:)" |
| `estimated` | Educated guess; must include reasoning + closest available proxy | "Domain rating ~25 estimated from referring domain count" |

If a check cannot reach `inferred`, mark it `estimated` with the reasoning. If it cannot reach `estimated`, drop the check rather than fabricating a number.

### The Moat Concept

A moat is any advantage that costs significantly more to replicate than to maintain. Moats are not the same as advantages — most advantages are commodity-replicable in 1-3 months. Moats take years.

**Common moats**:
- Authority accumulation (referring domains earned over 5+ years)
- Brand recognition and direct/branded search volume
- Content depth in a niche where production scales sub-linearly
- Exclusive data or partnerships
- Network effects (user-generated content, marketplace liquidity)

**Common non-moats** (mistaken for moats):
- A specific feature competitors can copy in a sprint
- "We've been doing this longer" without measurable trust signals
- A keyword ranking that depends on a single high-quality page

When in doubt, measure replication cost in months. Under 6 months is not a moat.

---

## 2. Sitemap Classification

Pull every competitor's `sitemap.xml`. Classify pages by template. Count each class.

### Process

1. Fetch `https://competitor.com/sitemap.xml` (and any nested sitemap indexes).
2. Sample 20-50 URLs per detected pattern. Open each — check page structure, content density, internal link count.
3. Group URLs by template based on URL pattern + page structure:
   - `/blog/[slug]` → editorial articles
   - `/cities/[city]/[category]` → programmatic location-category
   - `/products/[slug]` → product detail
   - `/companies/[slug]` → entity detail (programmatic if generated from DB)
   - `/topic/[slug]` → topic hub
   - `/search?q=` → faceted search results (often noindex but sometimes indexed)
4. For each class, record: URL count, average word count (sample), unique content per page (rough estimate), indexed status (site: search a sample of 10 URLs).

### What to Output

```
| Template | URL count (sitemap) | Indexed sample | Avg word count | Class |
|----------|---------------------|----------------|----------------|-------|
| /blog/[slug] | 142 | 9/10 | 1800 | editorial |
| /cities/[city]/[category] | 1,547 | 4/10 | 320 | programmatic-thin |
| /companies/[slug] | 3,200 | 2/10 | 110 | programmatic-orphan |
```

Class taxonomy:
- `editorial` — original, manually written
- `programmatic-rich` — generated but with unique data per page (e.g., real product data, real listings)
- `programmatic-thin` — generated, mostly templated, weak unique content
- `programmatic-orphan` — generated, low/zero internal links, low indexation
- `hub` — manually curated index/category page
- `utility` — search results, filter pages, pagination

### Why This Matters

A competitor with 5,000 sitemap URLs but only 800 indexed is not a 5,000-page site — it is an 800-page site with 4,200 pages of crawl budget waste. That is a structural weakness you can exploit by being selective rather than copying their volume.

---

## 3. Traffic-Per-Page Signals

Domain-level traffic estimates lie. A site can rank for 200 head terms via one strong page and have 1,500 dead pages dragging average authority. Page-level data exposes this.

### When You Have Paid Tools

**Ahrefs**: Site Explorer → Top Pages report. Sort by traffic. Note the long-tail decay — at what page rank does traffic drop below 10 visits/month?

**SEMrush**: Domain Overview → Pages report. Same analysis.

**Similarweb**: Less reliable for SEO but gives a directional check on engagement (bounce, time-on-page) per page.

What to extract per competitor:
- Total estimated organic traffic (domain)
- Top 10 pages by traffic + their templates
- Top 10 pages by KW count + overlap with our target keywords
- Number of pages with > 100 monthly traffic (effective surface area)
- Long-tail decay slope: pages 1-10 vs 50-100 vs 100+

### When You Don't Have Paid Tools

Use proxies. Each proxy is `inferred` evidence at best.

**Proxy 1 — Indexation ratio**: `site:competitor.com` count vs sitemap URL count. Low ratio (< 50%) suggests programmatic bloat with low traffic.

**Proxy 2 — Backlink concentration**: free Ahrefs/Moz preview will show top-10 pages by referring domains. Heavily concentrated backlinks on a few pages = those pages do all the ranking work.

**Proxy 3 — Internal linking signals**: crawl with Screaming Frog (free for 500 URLs). Pages with 50+ internal inbound links are the site's PageRank sinks — usually their best-performing pages.

**Proxy 4 — Manual SERP check**: for each of your top 20 target keywords, check positions 1-10. Count which competitor pages appear. Competitors that show up across many SERPs but always at positions 6-10 are flailing — not actually winning the niche.

### Output

Mark each finding with evidence tier. Include:
- "Estimated effective surface area: 800 pages (inferred — 23% indexation × 3,500 sitemap URLs, sampled 50 URLs)"
- "Top page concentration: 60% of estimated traffic on top 10 pages (confirmed via Ahrefs Top Pages)"

---

## 4. Dead Page Detection

Identifying competitor pages that exist but generate no value. These are signals of bloat, abandoned strategy, or thin programmatic content.

### Signals

- **Soft-404s**: returns 200 but the page is functionally empty ("No results found", "0 jobs available", placeholder copy).
- **Orphan pages**: in sitemap but no internal links pointing to them. Find via crawler — compare sitemap-listed URLs vs URLs found by following links.
- **Zombie content**: indexed but receives no traffic for 6+ months. You will not see this directly without GSC access — proxy via "no backlinks + no internal links + thin content + thin metadata" as a flag.
- **Stale-content patterns**: blog posts dated 2019 with no updates, pages referencing deprecated products, broken citations.

### Process

1. From sitemap, sample 50 URLs that look likely-thin (programmatic templates, deep nesting, generic slugs).
2. Open each. Score 1-5 on: unique content density, last-update signal, internal link count visible on page.
3. Run `site:competitor.com inurl:[template-prefix]` to count indexed pages of that template type.
4. Compare sitemap count vs indexed count for that template.
5. Flag templates with > 50% drop (sitemap → indexed) as candidate dead-page graveyards.

### Why This Matters

A competitor that has 2,000 dead programmatic pages is paying a Helpful Content tax on their whole domain. Your strategy can exploit this two ways:
1. Avoid the same template if their dead-page ratio suggests it does not work in this niche.
2. Pursue a leaner version (smaller volume, higher per-page quality) that beats their bloated version on average.

---

## 5. Failed Template Detection

Pages, sections, or whole content types that competitors built and later abandoned. The single highest-signal source of "do not do this" intelligence.

### Archive.org Workflow

1. Open `https://web.archive.org/web/*/competitor.com/*`.
2. Look at navigation snapshots from 1-3 years ago vs today. What sections existed then but are gone now?
3. For removed sections, check if URLs still resolve. Common patterns:
   - `/blog/` exists but the latest post is 18 months old → blog effort abandoned
   - `/learn/` returns 404 but archive shows 50 pages → entire section pulled
   - `/cities/[city]` exists for 3 cities but archive shows 50 → programmatic city pages were pruned
4. Capture: what was abandoned, when (rough date range from archive snapshots), how (full removal vs noindex vs left-as-orphan).

### Site:Operator with Date Filters

`site:competitor.com/blog/` then sort by date. If most results are old, the blog is dead. If newer dates exist but are sparse, the cadence collapsed.

### Internal Signal: Removed Nav Links

If a competitor's current navigation has no link to a section that the archive shows linked from main nav 2 years ago, that section is on a path to deletion. Pages that exist but receive zero internal links are end-of-life.

### Output

For each abandoned template, record:
- Template type (programmatic city pages, salary tools, blog, comparison pages, etc.)
- Approximate launch date (archive earliest snapshot)
- Approximate abandonment date (last snapshot with content updates or nav presence)
- Why it likely failed (your hypothesis, with evidence)

### Why This Matters

Failed templates are evidence of niche-specific anti-patterns. If three competitors all tried programmatic salary calculator pages and all abandoned them, that template does not work in this niche — even if it works in others. Strategy must respect this.

---

## 6. Anchor Profile and Link Acquisition

How a competitor earned their backlinks tells you what is replicable and what is structurally locked in.

### Anchor Distribution

Use Ahrefs Site Explorer → Anchors. Categorize:
- **Branded** (competitor name, URL, "click here") — signals organic/natural acquisition
- **Exact-match keyword** ("best CRM software") — signals link building or paid placements
- **Topic-relevant** ("CRM platform comparison") — signals editorial citations
- **Generic** ("read more", "this article") — signals natural inbound

Healthy organic profile: 60-80% branded, 10-20% topic-relevant, 5-15% exact match, rest generic.

A profile with > 30% exact-match anchors signals aggressive link building — likely some PBNs, paid placements, or guest post networks. This is replicable but expensive.

### Acquisition Velocity

Ahrefs → Referring Domains → Growth chart. Look for:
- **Smooth linear growth** — organic editorial accumulation
- **Spikes** — one-time PR hits, viral content, link campaigns
- **Plateaus** — they coasted on existing links for years
- **Decay** — losing more links than gaining (usually means churned partnerships or removed citations)

A spike profile is replicable through PR. A smooth-linear profile (especially > 5 years) is a moat — trust accumulates non-linearly.

### Link Source Classification

Categorize the top 50 referring domains:
- **News / media** — high authority, hard to earn but PR-able
- **Industry / niche publications** — earnable through expertise content
- **Educational / .gov / .edu** — usually gold; check why they linked
- **Resource lists / directories** — easy to replicate (submit to same directories)
- **Affiliate / review sites** — often paid; look for disclosure patterns
- **Forums / community sites** — natural, hard to game

What can you replicate in 90 days? What requires 1-3 years of ongoing relationship building?

---

## 7. SERP Feature Ownership

Featured snippets, image packs, video carousels, knowledge panels, "People also ask" boxes. Owning a SERP feature is often more valuable than ranking position 1.

### Feature Taxonomy

For each of your top 20 target keywords, capture which features exist on the SERP and who owns them:

| Feature | What it looks like | Ownership cost |
|---------|-------------------|----------------|
| Featured snippet (text) | Box at the top with extracted answer | Earnable via question-targeting structure |
| Featured snippet (table/list) | Same but tabular | Easier to win — fewer competitors structure for it |
| People Also Ask | Expandable Q&A boxes | Moderate; question-and-answer page format wins |
| Image pack | Row of images | Hard without strong image SEO; requires alt text + image sitemap |
| Video carousel | Row of YouTube results | Need to publish video; YouTube algorithm dominates |
| Knowledge panel | Right-side entity card | Brand-dependent; comes with entity recognition |
| Local pack | Map + 3 local listings | Local SEO + GBP-dependent |
| Top stories | News carousel | News-publisher-eligible only |

### Ownership Stickiness

Some features are stable; the same site holds them for months. Others churn weekly. Track over 30 days for your top 10 keywords. Sticky features are real moats; churning features are opportunities.

### What to Output

- Per target keyword: features present, current owner, replication cost (low/medium/high)
- Aggregate: which features are uncontested in the niche → fast win opportunities

---

## 8. Moat Quantification

For each competitor, score 0-3 on each moat dimension. Sum gives a rough moat index. Use this to prioritize where you compete head-on vs where you flank.

### Dimensions

**Authority moat (referring domains × age)**
- 0: < 100 referring domains, < 2 years old
- 1: 100-1,000 referring domains, 2-5 years old
- 2: 1,000-10,000 referring domains, 5-10 years old
- 3: 10,000+ referring domains, 10+ years old

**Content depth moat (effective surface area × topical breadth)**
- 0: < 50 indexed pages with traffic
- 1: 50-500 indexed pages with traffic, narrow topical coverage
- 2: 500-5,000 indexed pages with traffic, multiple topical clusters
- 3: 5,000+ indexed pages with traffic, dominant in primary topic

**Brand moat (direct/branded search volume × recognition)**
- 0: No measurable branded search
- 1: Some branded search; recognized in niche only
- 2: Strong branded search; recognized in adjacent niches
- 3: Brand is a category synonym (the "Kleenex" effect)

**Data/partnership moat (exclusive content, integrations, network effects)**
- 0: None
- 1: Some unique data; standard integrations
- 2: Proprietary dataset; valuable partnerships
- 3: Network-effect-locked; data flywheel

### Time-Cost-to-Replicate

For each non-zero dimension, estimate the realistic time to match. Cap at "indefinite" if the moat is truly structural.

```
| Competitor | Authority | Content | Brand | Data | Total | Time-to-match |
|------------|-----------|---------|-------|------|-------|---------------|
| competitor-a | 3 | 2 | 3 | 1 | 9 | indefinite (brand + authority) |
| competitor-b | 1 | 2 | 0 | 0 | 3 | 12-18 months |
| competitor-c | 0 | 1 | 0 | 0 | 1 | 3-6 months |
```

### Strategic Implication

If a competitor scores 7+ with indefinite time-to-match, you do not compete with them on their dimension. You flank — different keywords, different intent, different format, different vertical. The moat audit tells you where flanking is mandatory.

---

## 9. What We Have They Don't

Audit your own assets adversarially. The strategist will use this to find leverage that competitors cannot copy quickly.

### Our Asset Inventory

For each candidate asset, ask: how long would it take a competitor to replicate?

- **Proprietary data** — internal usage data, customer-survey data, scraped + cleaned datasets
- **Real-time freshness** — live job listings, live inventory, live pricing (vs static competitor data)
- **User-generated content** — reviews, Q&A, forum posts (network-effect-locked once it accumulates)
- **Integrations / partnerships** — exclusive data feeds, official partnerships, certifications
- **Brand/founder recognition** — published research, conference talks, industry voice
- **Geographic-specific advantage** — local presence, language fluency, regulatory expertise
- **Speed of execution** — small team, fast deploy cycle, ability to ship in weeks competitors take quarters to match

### What to Output

- Top 5 unfair advantages, ranked by replication time
- For each: how it shows up on-page (the SEO-readable form), and what content/format strategy can amplify it

### Why This Matters

Strategy that ignores our advantages defaults to copying competitors — which is exactly the failure mode this whole reference exists to prevent. Adversarial competitor audits without an "us" column produce me-too plans.

---

## 10. Synthesizing Adversarial Findings

The output of the adversarial audit feeds the strategist (in STRATEGIZE phase) directly. Format matters — disorganized findings become bad strategy.

### Per-Competitor Scorecard

Required for each top-3 competitor. Length: 30-80 lines per competitor.

```markdown
### Competitor: [name]

**Sitemap classification**
- Total URLs: X
- By template: editorial X, programmatic-rich Y, programmatic-thin Z, orphan W
- Effective surface area (indexed + traffic): N pages [confirmed/inferred via ...]

**Top traffic pages**
- Top 10 pages: [list with template type and approximate monthly traffic]
- Concentration: top-10 pages = X% of estimated traffic [confirmed via Ahrefs]

**Dead/failed**
- Dead-page candidates: X pages of template Y [inferred — sitemap-vs-indexed delta]
- Abandoned templates: [list with archive.org dates]

**Anchor & acquisition**
- Anchor mix: X% branded, Y% exact, Z% topic, W% generic [confirmed via Ahrefs Anchors]
- Acquisition pattern: [smooth/spiky/plateau/decay]
- Replicable share: X% of top-50 referring domains are submission-able directories or pitch-able publications

**SERP features owned**
- [feature]: [keyword] — owner stickiness over 30 days: high/medium/low

**Moat score**
- Authority: X | Content: X | Brand: X | Data: X | Total: X/12
- Time-to-match: [months or indefinite]
- Strategic implication: [head-on / flank / ignore]

**What they got wrong**
- [Specific failed template, broken pattern, or weakness — concrete examples only]
```

### Aggregate: The Strategic Picture

After all per-competitor scorecards, write a 1-page synthesis:

1. **The wedge**: where in this niche is the SERP weakest? (Featured snippets uncontested, intent unsatisfied, freshness gap, depth gap.)
2. **The moats we cannot challenge**: which competitors have indefinite time-to-match scores, on which dimensions. We do not compete with them there.
3. **The patterns that fail in this niche**: failed templates from §5 — explicitly do not pursue these.
4. **Our exploitable advantages**: top 3 from §9 mapped to specific content/format opportunities.
5. **The replicable wins**: anchors, directories, formats, features that any competitor at our authority level can earn in 90 days.

### Handoff to STRATEGIZE

The strategist's `strategy.md` must trace each strategic decision to one or more of the above. Programmatic volume decisions, in particular, must cite:
- Sitemap classification of competitors who tried similar templates (succeeded or abandoned)
- Effective-surface-area math (not just sitemap count)
- Moat score showing why our wedge holds
- At least one item from "What We Have They Don't" that the programmatic template amplifies

If a strategic claim cannot be traced to a finding here, the strategist must either find the evidence or drop the claim. No claim survives without evidence.
