# File Formats Reference

Templates for all plan directory files used by the SEO planner system. Each template defines the structure, sections, and expected content for its respective file.

---

## Plan Directory Structure

```
plans/
  {client-slug}/
    state.md            # Current state machine position
    plan.md             # The full SEO plan
    decisions.md        # Decision log (what was decided and why)
    findings.md         # Audit findings and research discoveries
    progress.md         # Task tracking and completion status
    verification.md     # Metrics tracking and verification criteria
    summary.md          # Executive summary for stakeholders
    audit/
      technical.md      # Technical SEO audit results
      content.md        # Content audit results
      backlinks.md      # Backlink audit results
      competitors.md    # Competitor analysis
```

---

## state.md

Tracks the current phase of the SEO engagement.

```markdown
# State: {client-name}

## Current Phase
{phase_name}

## Phase History
| Phase | Entered | Exited | Duration | Notes |
|-------|---------|--------|----------|-------|
| discovery | YYYY-MM-DD | YYYY-MM-DD | Xd | Initial audit and research |
| planning | YYYY-MM-DD | YYYY-MM-DD | Xd | Strategy development |
| execution | YYYY-MM-DD | - | ongoing | Implementation in progress |

## Valid Phases
1. **discovery** — Audit the site, research competitors, understand the business
2. **planning** — Build the SEO strategy, topical map, content calendar, technical roadmap
3. **execution** — Implement the plan (technical fixes, content production, link building)
4. **monitoring** — Track results, adjust strategy, report to stakeholders
5. **optimization** — Refine based on data, scale what works, cut what doesn't
6. **maintenance** — Ongoing management, content refresh, link building, reporting
7. **paused** — Engagement on hold (budget, business reasons, seasonal)
8. **completed** — Engagement closed, final report delivered

## Transition Rules
- discovery -> planning (when audit is complete and findings reviewed)
- planning -> execution (when plan is approved by stakeholder)
- execution -> monitoring (when initial implementation is complete, ~30-60 days)
- monitoring -> optimization (when sufficient data exists, ~60-90 days)
- optimization -> maintenance (when targets met or engagement shifts to ongoing)
- any -> paused (stakeholder request)
- paused -> {previous phase} (resumption)
- any -> completed (engagement end)

## Blockers
- [ ] {description of any blocker preventing phase transition}
```

---

## plan.md

The comprehensive SEO plan for the engagement.

```markdown
# SEO Plan: {client-name}

## Overview
- **Site**: {url}
- **Industry**: {industry/niche}
- **Business Model**: {how they make money}
- **SEO Goal**: {primary objective — traffic, leads, revenue, visibility}
- **Timeline**: {engagement duration}
- **Budget**: {monthly budget for content, tools, links}
- **Start Date**: {YYYY-MM-DD}
- **SCORE Baseline**: {S: X, C: X, O: X, R: X, E: X = XX/50}

## Target Audience
- **Primary**: {who they are, what they search for}
- **Secondary**: {additional audience segments}
- **Search behavior**: {typical queries, intent types, buying journey}

---

## 1. Topical Map

### Pillar 1: {Topic}
| Article | Primary Keyword | Volume | KD | Intent | Priority | Status |
|---------|----------------|--------|-----|--------|----------|--------|
| {title} | {keyword} | X | X | {type} | P1 | {status} |

### Pillar 2: {Topic}
| Article | Primary Keyword | Volume | KD | Intent | Priority | Status |
|---------|----------------|--------|-----|--------|----------|--------|
| {title} | {keyword} | X | X | {type} | P1 | {status} |

### Pillar 3: {Topic}
(continue as needed)

---

## 2. Content Calendar

### Month 1
| Week | Title | Type | Keyword | Writer | Status |
|------|-------|------|---------|--------|--------|
| W1 | {title} | Pillar | {kw} | {name} | {status} |
| W1 | {title} | Cluster | {kw} | {name} | {status} |
| W2 | {title} | Cluster | {kw} | {name} | {status} |

### Month 2
(continue pattern)

### Month 3
(continue pattern)

---

## 3. Technical Fixes

Priority order for technical SEO fixes identified in the audit.

| # | Issue | Impact | Effort | Owner | Deadline | Status |
|---|-------|--------|--------|-------|----------|--------|
| 1 | {issue} | High | Low | {who} | {date} | {status} |
| 2 | {issue} | High | Medium | {who} | {date} | {status} |
| 3 | {issue} | Medium | Low | {who} | {date} | {status} |

---

## 4. Link Building Plan

### Month 1 — Foundation
- [ ] Set up foundational backlinks (directories, social profiles)
- [ ] Begin HARO/Connectively responses (target: 5-10/week)
- [ ] Identify 20 guest post prospects
- [ ] Internal linking audit and fixes
- Target: +10-15 new referring domains

### Month 2 — Growth
- [ ] Publish first linkable asset (statistics page / free tool / data report)
- [ ] Guest post outreach (pitch 10, publish 2-3)
- [ ] Broken link building (identify 20 opportunities)
- [ ] Continue HARO responses
- Target: +15-20 new referring domains

### Month 3 — Acceleration
- [ ] Digital PR campaign launch (data-driven content + journalist outreach)
- [ ] Resource page link building (identify 15 targets)
- [ ] Promote linkable assets
- [ ] Continue all ongoing channels
- Target: +20-30 new referring domains

---

## 5. KPI Targets

### 90-Day Targets
| Metric | Baseline | 30-Day | 60-Day | 90-Day |
|--------|----------|--------|--------|--------|
| Organic sessions/month | {X} | {target} | {target} | {target} |
| Indexed pages | {X} | {target} | {target} | {target} |
| Keywords in top 10 | {X} | {target} | {target} | {target} |
| Keywords in top 3 | {X} | {target} | {target} | {target} |
| Referring domains | {X} | {target} | {target} | {target} |
| Domain Rating | {X} | {target} | {target} | {target} |
| Organic conversions/month | {X} | {target} | {target} | {target} |

### 6-Month Targets
| Metric | Baseline | Target | Growth |
|--------|----------|--------|--------|
| Organic sessions/month | {X} | {target} | {X%} |
| Organic revenue/month | {X} | {target} | {X%} |
| Keywords in top 10 | {X} | {target} | {+X} |
| Domain Rating | {X} | {target} | {+X} |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Algorithm update | Medium | High | Diversify traffic sources, focus on quality |
| Content velocity too slow | Medium | Medium | Prioritize highest-impact content first |
| Technical issues block indexation | Low | High | Monitor Search Console weekly |
| Competitor launches aggressive SEO | Medium | Medium | Monitor and differentiate |
| Budget cut mid-engagement | Low | High | Show early wins, report ROI monthly |
```

---

## decisions.md

Log of significant decisions made during the engagement.

```markdown
# Decisions: {client-name}

## Decision Log

### DEC-001: {Decision Title}
- **Date**: YYYY-MM-DD
- **Phase**: {discovery/planning/execution/etc.}
- **Context**: {What situation prompted this decision?}
- **Options Considered**:
  1. {Option A} — {pros/cons}
  2. {Option B} — {pros/cons}
  3. {Option C} — {pros/cons}
- **Decision**: {What was decided}
- **Rationale**: {Why this option was chosen}
- **Impact**: {What this changes in the plan}
- **Owner**: {Who is responsible for execution}
- **Review Date**: {When to revisit this decision}

### DEC-002: {Decision Title}
(same structure)
```

---

## findings.md

Research findings and audit discoveries.

```markdown
# Findings: {client-name}

## Audit Findings

### Technical SEO
| # | Finding | Severity | Category | Recommendation | Status |
|---|---------|----------|----------|----------------|--------|
| T1 | {finding} | Critical/High/Medium/Low | Speed/Crawl/Index/Schema/Mobile | {what to do} | {open/fixed} |

### Content
| # | Finding | Severity | Category | Recommendation | Status |
|---|---------|----------|----------|----------------|--------|
| C1 | {finding} | Critical/High/Medium/Low | Coverage/Quality/Structure/Intent | {what to do} | {open/fixed} |

### Backlinks
| # | Finding | Severity | Category | Recommendation | Status |
|---|---------|----------|----------|----------------|--------|
| B1 | {finding} | Critical/High/Medium/Low | Profile/Quality/Toxic/Gap | {what to do} | {open/fixed} |

### Competitive
| # | Finding | Category | Implication | Opportunity |
|---|---------|----------|-------------|-------------|
| X1 | {finding} | Content/Links/Technical/Keywords | {what it means} | {how to exploit} |

## Research Notes
- {Date}: {Observation or insight from research}
- {Date}: {Observation or insight from research}

## Key Insights
1. {Most important insight from the audit}
2. {Second most important insight}
3. {Third most important insight}
```

---

## progress.md

Task tracking and completion status across all SEO workstreams.

```markdown
# Progress: {client-name}

## Current Sprint: {Sprint Name/Number}
**Period**: YYYY-MM-DD to YYYY-MM-DD
**Goal**: {Sprint goal}

### Technical SEO Tasks
- [x] {Completed task} (YYYY-MM-DD)
- [ ] {In progress task} — {assignee}
- [ ] {Planned task}

### Content Production Tasks
- [x] {Completed: Published "[Title]" targeting [keyword]} (YYYY-MM-DD)
- [ ] {In progress: Writing "[Title]"} — {writer}
- [ ] {Planned: Brief for "[Title]"}

### Link Building Tasks
- [x] {Completed: Submitted to X directories} (YYYY-MM-DD)
- [ ] {In progress: Guest post for [site]} — {assignee}
- [ ] {Planned: Outreach to [targets]}

### Optimization Tasks
- [x] {Completed: Updated title tags on [pages]} (YYYY-MM-DD)
- [ ] {In progress: Featured snippet optimization for [keyword]}
- [ ] {Planned: Internal linking update for [cluster]}

### Monitoring & Reporting Tasks
- [x] {Completed: Monthly report delivered} (YYYY-MM-DD)
- [ ] {Planned: Weekly rank check}

---

## Completed Sprints

### Sprint 1: {Name}
**Period**: YYYY-MM-DD to YYYY-MM-DD
**Goal**: {goal}
**Result**: {outcome, metrics achieved}

| Category | Planned | Completed | Notes |
|----------|---------|-----------|-------|
| Technical | X | X | {notes} |
| Content | X articles | X published | {notes} |
| Links | X outreach | X acquired | {notes} |
| Optimization | X tasks | X done | {notes} |

---

## Cumulative Progress

| Metric | Start | Current | Change |
|--------|-------|---------|--------|
| Articles published | 0 | X | +X |
| Technical issues fixed | 0 | X | +X |
| Referring domains acquired | 0 | X | +X |
| Internal links added | 0 | X | +X |
| Pages optimized | 0 | X | +X |
```

---

## verification.md

Metrics tracking and verification that the SEO plan is working.

```markdown
# Verification: {client-name}

## KPI Dashboard

### Organic Traffic
| Period | Sessions | Users | New Users | Bounce Rate | Engagement Rate |
|--------|----------|-------|-----------|-------------|-----------------|
| Baseline | X | X | X | X% | X% |
| Month 1 | X | X | X | X% | X% |
| Month 2 | X | X | X | X% | X% |
| Month 3 | X | X | X | X% | X% |

### Rankings
| Keyword | Baseline | Month 1 | Month 2 | Month 3 | Target |
|---------|----------|---------|---------|---------|--------|
| {kw} | {pos} | {pos} | {pos} | {pos} | Top 3 |
| {kw} | {pos} | {pos} | {pos} | {pos} | Top 5 |
| {kw} | NR | {pos} | {pos} | {pos} | Top 10 |

### Indexation
| Period | Pages Submitted | Pages Indexed | Ratio | Errors |
|--------|----------------|---------------|-------|--------|
| Baseline | X | X | X% | X |
| Month 1 | X | X | X% | X |
| Month 2 | X | X | X% | X |

### Core Web Vitals
| Metric | Baseline | Current | Target | Status |
|--------|----------|---------|--------|--------|
| LCP | Xs | Xs | < 2.5s | {pass/fail} |
| CLS | X | X | < 0.1 | {pass/fail} |
| INP | Xms | Xms | < 200ms | {pass/fail} |

### Backlink Profile
| Period | Referring Domains | DR | New Links/Month | Lost Links/Month |
|--------|------------------|-----|-----------------|------------------|
| Baseline | X | X | - | - |
| Month 1 | X | X | X | X |
| Month 2 | X | X | X | X |
| Month 3 | X | X | X | X |

### Conversions
| Period | Organic Leads | Organic Revenue | Conv. Rate | Cost/Acquisition |
|--------|--------------|-----------------|------------|-----------------|
| Baseline | X | $X | X% | $X |
| Month 1 | X | $X | X% | $X |
| Month 2 | X | $X | X% | $X |
| Month 3 | X | $X | X% | $X |

---

## Verification Checks

### Weekly
- [ ] Search Console: any new crawl errors?
- [ ] Rank tracker: any significant position changes?
- [ ] Site up and loading properly?
- [ ] No indexation drops?

### Monthly
- [ ] Full traffic report (organic sessions, users, engagement)
- [ ] Rankings report (all tracked keywords)
- [ ] Content published vs planned (on track?)
- [ ] Links acquired vs target (on track?)
- [ ] Core Web Vitals still passing?
- [ ] Conversion tracking working correctly?

### Quarterly
- [ ] Full SCORE re-assessment
- [ ] Competitor benchmark update
- [ ] ROI calculation
- [ ] Strategy review: what is working? what is not?
- [ ] Plan adjustment based on data
- [ ] Stakeholder presentation

---

## Success Criteria

### Minimum Viable Success (3 months)
- [ ] All critical technical issues resolved
- [ ] X+ articles published and indexed
- [ ] X+ new referring domains acquired
- [ ] Organic traffic growing month-over-month
- [ ] First keywords entering top 10

### Target Success (6 months)
- [ ] Organic traffic increased X% from baseline
- [ ] X keywords in top 3 positions
- [ ] X+ referring domains (total)
- [ ] Positive ROI trend (if not yet positive, clear trajectory)
- [ ] Content flywheel established (sustainable production pace)

### Stretch Success (12 months)
- [ ] Organic traffic increased X% from baseline
- [ ] Dominant topical authority in primary niche
- [ ] Organic channel is profitable (clear positive ROI)
- [ ] Self-sustaining content and link acquisition system
- [ ] Reduced dependency on paid acquisition
```

---

## audit/technical.md

```markdown
# Technical SEO Audit: {client-name}

## Audit Details
- **Date**: YYYY-MM-DD
- **Auditor**: {name}
- **Tools Used**: {Screaming Frog, PageSpeed Insights, Search Console, etc.}
- **Pages Crawled**: {X}

## Executive Summary
{2-3 sentences summarizing the technical health of the site and the most critical issues found.}

## SCORE: Site Optimization = {X}/10

---

## 1. Crawlability
| Check | Status | Notes |
|-------|--------|-------|
| robots.txt exists and is correct | {pass/fail} | {details} |
| XML sitemap exists and is submitted | {pass/fail} | {details} |
| No important pages blocked by robots.txt | {pass/fail} | {details} |
| Crawl errors in Search Console | {X errors} | {details} |
| Crawl budget concerns | {yes/no} | {details} |

## 2. Indexation
| Check | Status | Notes |
|-------|--------|-------|
| Pages submitted vs indexed | {X/Y} | {ratio} |
| Canonical tags present and correct | {pass/fail} | {details} |
| No accidental noindex tags | {pass/fail} | {details} |
| Duplicate content issues | {yes/no} | {details} |
| Thin content pages | {X pages} | {details} |

## 3. Page Speed / Core Web Vitals
| Page Template | LCP | CLS | INP | Performance Score |
|---------------|-----|-----|-----|-------------------|
| Homepage | Xs | X | Xms | X/100 |
| Blog post | Xs | X | Xms | X/100 |
| Category page | Xs | X | Xms | X/100 |
| Product page | Xs | X | Xms | X/100 |

### Speed Issues Found
| Issue | Impact | Fix |
|-------|--------|-----|
| {issue} | {high/medium/low} | {what to do} |

## 4. Mobile
| Check | Status | Notes |
|-------|--------|-------|
| Responsive design | {pass/fail} | {details} |
| Font size >= 16px | {pass/fail} | {details} |
| Tap targets adequate | {pass/fail} | {details} |
| No horizontal scroll | {pass/fail} | {details} |
| Mobile usability errors (GSC) | {X errors} | {details} |

## 5. Structured Data
| Schema Type | Implemented | Valid | Pages |
|-------------|-------------|-------|-------|
| Article | {yes/no} | {yes/no} | {X pages} |
| BreadcrumbList | {yes/no} | {yes/no} | {X pages} |
| FAQ | {yes/no} | {yes/no} | {X pages} |
| Organization | {yes/no} | {yes/no} | Homepage |
| Product | {yes/no} | {yes/no} | {X pages} |

## 6. Site Architecture
| Check | Status | Notes |
|-------|--------|-------|
| URL structure is clean and logical | {pass/fail} | {details} |
| Breadcrumbs present | {pass/fail} | {details} |
| Max click depth | {X clicks} | {target: 3-4} |
| Orphan pages | {X pages} | {details} |
| Internal linking health | {good/fair/poor} | {details} |

## 7. HTTPS / Security
| Check | Status | Notes |
|-------|--------|-------|
| Valid SSL certificate | {pass/fail} | {expires: date} |
| HTTP -> HTTPS redirect | {pass/fail} | {details} |
| No mixed content | {pass/fail} | {details} |
| HSTS enabled | {yes/no} | {details} |

## 8. Redirects / Broken Links
| Issue | Count | Examples |
|-------|-------|---------|
| Redirect chains | {X} | {URLs} |
| Redirect loops | {X} | {URLs} |
| Broken internal links (404) | {X} | {URLs} |
| Broken external links | {X} | {URLs} |

## Priority Actions
| # | Action | Impact | Effort | Deadline |
|---|--------|--------|--------|----------|
| 1 | {action} | High | Low | {date} |
| 2 | {action} | High | Medium | {date} |
| 3 | {action} | Medium | Low | {date} |
```

---

## audit/content.md

```markdown
# Content Audit: {client-name}

## Audit Details
- **Date**: YYYY-MM-DD
- **Auditor**: {name}
- **Total Pages Audited**: {X}

## Executive Summary
{2-3 sentences summarizing content health, coverage, and quality.}

## SCORE: Content Production = {X}/10

---

## Content Inventory
| Category | Count | Avg. Word Count | Avg. Traffic/Month | Avg. Engagement |
|----------|-------|----------------|-------------------|-----------------|
| Blog posts | X | X | X | X% |
| Landing pages | X | X | X | X% |
| Product/service pages | X | X | X | X% |
| Resource pages | X | X | X | X% |
| Total | X | - | X | - |

## Content Quality Assessment
| Quality Level | Count | % of Total | Action |
|--------------|-------|-----------|--------|
| High (ranking, traffic, engaging) | X | X% | Maintain and refresh |
| Medium (some traffic, could improve) | X | X% | Optimize and expand |
| Low (thin, no traffic, outdated) | X | X% | Update, consolidate, or remove |
| Duplicate / Cannibalized | X | X% | Merge or differentiate |

## Topical Coverage Gaps
| Topic | Competitor Coverage | Our Coverage | Gap | Priority |
|-------|-------------------|--------------|-----|----------|
| {topic} | {X articles} | {X articles} | {X missing} | High |
| {topic} | {X articles} | {X articles} | {X missing} | Medium |

## Top Performing Content
| Page | Traffic/Month | Top Keyword | Position | Conversions |
|------|--------------|-------------|----------|-------------|
| {URL} | X | {kw} | X | X |

## Underperforming Content (Refresh Candidates)
| Page | Current Traffic | Peak Traffic | Top Keyword | Position | Issue |
|------|----------------|-------------|-------------|----------|-------|
| {URL} | X | X | {kw} | X | {outdated/thin/poor intent match} |

## Content Recommendations
| # | Recommendation | Impact | Priority |
|---|---------------|--------|----------|
| 1 | {recommendation} | High | P1 |
| 2 | {recommendation} | High | P1 |
| 3 | {recommendation} | Medium | P2 |
```

---

## audit/backlinks.md

```markdown
# Backlink Audit: {client-name}

## Audit Details
- **Date**: YYYY-MM-DD
- **Auditor**: {name}
- **Tool**: {Ahrefs / Semrush / Moz}

## Executive Summary
{2-3 sentences summarizing backlink health, authority, and link building opportunities.}

## SCORE: Outside Signals = {X}/10

---

## Profile Overview
| Metric | Value | Industry Benchmark |
|--------|-------|--------------------|
| Domain Rating (DR) | X | X |
| Total Backlinks | X | X |
| Referring Domains | X | X |
| Referring IPs | X | X |
| Dofollow / Nofollow Ratio | X% / X% | 70%+ dofollow |

## Referring Domain Quality
| DR Range | Count | % of Total |
|----------|-------|-----------|
| 70+ | X | X% |
| 50-69 | X | X% |
| 30-49 | X | X% |
| 10-29 | X | X% |
| 0-9 | X | X% |

## Anchor Text Distribution
| Anchor Type | Count | % | Health |
|-------------|-------|---|--------|
| Branded | X | X% | {over/under/healthy} |
| Exact match | X | X% | {over/under/healthy} |
| Partial match | X | X% | {over/under/healthy} |
| Generic | X | X% | {over/under/healthy} |
| Naked URL | X | X% | {over/under/healthy} |

## Link Velocity
| Month | New Referring Domains | Lost Referring Domains | Net |
|-------|-----------------------|----------------------|-----|
| {month} | +X | -X | {net} |

## Toxic Links
| Domain | DR | Reason | Action |
|--------|----|--------|--------|
| {domain} | X | {spam/PBN/irrelevant} | Disavow |

## Competitor Backlink Gap
| Domain | Links to Competitor A | Links to Competitor B | Links to Us | Gap |
|--------|----------------------|----------------------|-------------|-----|
| {domain} | Yes | Yes | No | Outreach |

## Link Building Opportunities
| # | Opportunity | Type | Potential DR | Priority |
|---|-----------|------|-------------|----------|
| 1 | {opportunity} | {guest post/resource/broken link} | X | High |
| 2 | {opportunity} | {type} | X | Medium |
```

---

## audit/competitors.md

```markdown
# Competitor Analysis: {client-name}

## Audit Details
- **Date**: YYYY-MM-DD
- **Auditor**: {name}
- **Competitors Analyzed**: {X}

## Executive Summary
{2-3 sentences summarizing the competitive landscape and key opportunities.}

---

## Competitor Overview
| Metric | Us | Competitor A | Competitor B | Competitor C |
|--------|-----|-------------|-------------|-------------|
| Domain Rating | X | X | X | X |
| Organic Traffic/Month | X | X | X | X |
| Referring Domains | X | X | X | X |
| Indexed Pages | X | X | X | X |
| Blog Posts | X | X | X | X |
| Keywords in Top 10 | X | X | X | X |
| Keywords in Top 3 | X | X | X | X |

## Content Gap Analysis
| Keyword | Volume | Comp A Rank | Comp B Rank | Our Rank | Opportunity |
|---------|--------|------------|------------|----------|-------------|
| {kw} | X | X | X | NR | High |
| {kw} | X | X | NR | X | Low |

## Backlink Gap
| Linking Domain | DR | Comp A | Comp B | Us | Type | Outreach Priority |
|---------------|-----|--------|--------|-----|------|-------------------|
| {domain} | X | Yes | Yes | No | {type} | High |

## Competitor Content Strategy
### Competitor A: {name}
- **Content types**: {blogs, tools, resources, videos}
- **Publishing frequency**: {X articles/month}
- **Top performing content**: {list}
- **Content gaps they have**: {what they miss}
- **Strengths**: {what they do well}
- **Weaknesses**: {where we can beat them}

### Competitor B: {name}
(same structure)

### Competitor C: {name}
(same structure)

## Competitive Advantages
| Area | Our Advantage | How to Exploit |
|------|--------------|----------------|
| {area} | {what we do better} | {action} |

## Competitive Threats
| Threat | Severity | Mitigation |
|--------|----------|------------|
| {threat} | High/Medium/Low | {what to do} |

## Key Takeaways
1. {Most important competitive insight}
2. {Second most important}
3. {Third most important}
```

---

## summary.md

```markdown
# SEO Summary: {client-name}

## Engagement Overview
- **Client**: {name}
- **Site**: {url}
- **Start Date**: {YYYY-MM-DD}
- **Current Phase**: {phase}
- **SCORE**: S:{X} C:{X} O:{X} R:{X} E:{X} = {XX}/50

## Current Status
{2-3 paragraph summary of where things stand. What has been accomplished, what is in progress, what is next.}

## Key Metrics
| Metric | Baseline | Current | Change | Target |
|--------|----------|---------|--------|--------|
| Organic sessions/month | X | X | {+X%} | X |
| Keywords in top 10 | X | X | {+X} | X |
| Referring domains | X | X | {+X} | X |
| Domain Rating | X | X | {+X} | X |
| Organic conversions | X | X | {+X%} | X |

## Wins
- {Major win 1 with data}
- {Major win 2 with data}

## Challenges
- {Challenge 1 and how it is being addressed}
- {Challenge 2 and how it is being addressed}

## Next Steps (Next 30 Days)
1. {Priority action 1}
2. {Priority action 2}
3. {Priority action 3}

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| {risk} | {H/M/L} | {H/M/L} | {plan} |

## Budget / ROI
| Item | Monthly Cost | Total Spent | Organic Revenue | ROI |
|------|-------------|-------------|-----------------|-----|
| Content | $X | $X | - | - |
| Tools | $X | $X | - | - |
| Links | $X | $X | - | - |
| **Total** | **$X** | **$X** | **$X** | **{X%}** |

---

*Last updated: YYYY-MM-DD*
```
