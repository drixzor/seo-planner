# Content Strategy Reference

Framework for building topical authority through structured content architecture. This is not about writing blog posts — it is about systematically covering a topic space so that Google recognizes you as the definitive source.

---

## 1. Topical Map Creation

A topical map is the blueprint for all content. It defines what you will write, how it connects, and what gaps exist.

### Process: Brain Dump to Hierarchy

**Step 1: Brain Dump**
- List every topic, question, and subtopic related to your niche
- Interview domain experts, customer support, sales team
- Mine competitor content (Ahrefs Content Gap, Semrush Topic Research)
- Review forums: Reddit, Quora, niche communities
- Check Google's "People Also Ask" and autocomplete for your core terms
- Review customer FAQs and support tickets

**Step 2: Keyword Research**
- Cluster brain dump topics into keyword groups
- For each cluster, find:
  - Primary keyword (highest volume, most representative)
  - Secondary keywords (related terms, synonyms)
  - Long-tail keywords (specific questions, low competition)
  - Search volume, keyword difficulty, current ranking position
- Tools: Ahrefs Keywords Explorer, Semrush Keyword Magic, Google Keyword Planner, AlsoAsked.com

**Step 3: Build the Hierarchy**
```
Pillar Topic (broad, high volume)
  |-- Cluster 1 (subtopic)
  |     |-- Supporting Article 1a (specific question)
  |     |-- Supporting Article 1b (specific question)
  |     |-- Supporting Article 1c (how-to, tutorial)
  |-- Cluster 2 (subtopic)
  |     |-- Supporting Article 2a
  |     |-- Supporting Article 2b
  |-- Cluster 3 (subtopic)
        |-- Supporting Article 3a
        |-- Supporting Article 3b
```

**Step 4: Gap Analysis**
- Compare your map against top 3 competitors
- Identify topics they cover that you do not
- Identify topics you can cover better or from a unique angle
- Prioritize by: search volume x business relevance x difficulty feasibility

### Topical Map Template
```markdown
## Pillar: [Main Topic]
- Primary KW: [keyword] | Vol: [X] | KD: [X] | Intent: [type]
- URL: /main-topic/

### Cluster: [Subtopic 1]
| Article | Primary KW | Vol | KD | Intent | Status | URL |
|---------|-----------|-----|-----|--------|--------|-----|
| [Title] | [kw] | X | X | info | draft | /main-topic/subtopic/ |
| [Title] | [kw] | X | X | comm | planned | /main-topic/subtopic-2/ |
```

---

## 2. Pillar Page Architecture

Pillar pages are comprehensive, authoritative guides on broad topics. They are the hubs that support clusters of related content.

### Characteristics of a Pillar Page
- Covers the entire topic broadly (2,000-5,000+ words)
- Answers the core question definitively
- Links to every cluster article for deeper dives
- Updated regularly as new cluster articles are published
- Targets a high-volume, competitive keyword
- Structured with clear H2/H3 hierarchy and table of contents
- Includes a variety of content formats (text, images, tables, videos)

### Pillar Page Structure
```
1. Introduction (what, why it matters)
2. Table of Contents (jump links)
3. Section 1: [Subtopic] (overview + link to cluster article)
4. Section 2: [Subtopic] (overview + link to cluster article)
5. Section 3: [Subtopic] (overview + link to cluster article)
...
N. Key Takeaways / Summary
N+1. FAQ Section (with FAQ schema)
N+2. CTA (lead magnet, product, service)
```

### Types of Pillar Pages
| Type | Example | Best For |
|------|---------|----------|
| Guide | "The Complete Guide to [Topic]" | Informational topics |
| What-Is | "What Is [Topic]: Everything You Need to Know" | Definitional topics |
| How-To | "How to [Achieve Goal]: Step-by-Step" | Process/tutorial topics |
| Resource | "Best [Tools/Resources] for [Goal]" | Commercial/comparison topics |

---

## 3. Content Clusters

Cluster articles are the spokes to the pillar hub. Each one targets a specific long-tail keyword and links back to the pillar.

### Cluster Article Guidelines
- Focused on a single specific topic or question (800-2,500 words)
- Targets a long-tail or medium-tail keyword
- Always links back to the pillar page (contextual anchor text)
- Links to 1-2 other relevant cluster articles in the same pillar
- Provides depth the pillar page cannot (case studies, tutorials, data)
- Matches search intent precisely

### Cluster Types
| Type | Purpose | Example |
|------|---------|---------|
| How-To | Step-by-step instructions | "How to Set Up Google Analytics 4" |
| Comparison | Evaluate alternatives | "Ahrefs vs Semrush: Which Is Better for [X]" |
| List | Curated collections | "15 Best Free Keyword Research Tools" |
| Case Study | Real results | "How We Increased Organic Traffic 340% in 6 Months" |
| Definition | Explain concepts | "What Is Topical Authority and Why It Matters" |
| Troubleshooting | Solve problems | "Why Your Pages Are Not Getting Indexed (and How to Fix It)" |
| Data/Research | Original data | "We Analyzed 1,000 SERPs: Here's What We Found" |

---

## 4. Internal Linking Strategy

Internal links distribute authority, establish topical relationships, and guide users through your content.

### Hub-and-Spoke Model
```
                    Pillar Page
                   /    |    \
                  /     |     \
        Cluster A  Cluster B  Cluster C
           |  \       |         |  \
          A1   A2     B1       C1   C2
```
- Every cluster article links to its pillar (1 link, contextual)
- Pillar links to every cluster article (from relevant section)
- Related clusters link to each other (1-2 cross-links)
- Deep cluster articles link to parent cluster

### Internal Linking Rules
1. **3-5 internal links per article** (minimum for meaningful connection)
2. **Descriptive anchor text** (not "click here" — use the target keyword or close variant)
3. **Link from high-authority pages to pages you want to rank** (authority flows downstream)
4. **Contextual links only** (placed naturally within content, not forced lists at bottom)
5. **Update old articles** to link to new articles (do not only link forward)
6. **Fix orphan pages** (pages with zero internal links pointing to them)
7. **Breadcrumb links** on every page (reinforce site hierarchy)
8. **Related posts** sections (automated or curated, bottom of articles)

### Internal Link Audit
- Crawl site and export internal link data
- Identify: orphan pages, pages with < 3 internal links, broken internal links
- Map link equity flow (which pages receive the most internal links)
- Ensure top-priority pages receive the most internal links

---

## 5. Search Intent Mapping

Every keyword has an intent. Mismatching intent means the page will never rank, regardless of quality.

### Intent Types
| Intent | Signal | Content Type | SERP Features |
|--------|--------|-------------|---------------|
| **Informational** | "what is", "how to", "why", "guide" | Blog post, guide, tutorial | Featured snippets, PAA, knowledge panel |
| **Navigational** | Brand name, product name | Homepage, product page | Site links, knowledge panel |
| **Commercial** | "best", "review", "vs", "top" | Comparison, review, list | Product carousels, reviews |
| **Transactional** | "buy", "price", "discount", "near me" | Product page, pricing page | Shopping results, local pack |

### Intent Verification Process
1. Google the target keyword
2. Analyze the top 10 results:
   - What type of content ranks? (blog, product page, video, tool)
   - What format? (list, guide, comparison, step-by-step)
   - What depth? (short answer, comprehensive guide)
   - What angle? (beginner, advanced, specific use case)
3. Match your content type, format, depth, and angle to what ranks

### Intent Mapping Template
```markdown
| Keyword | Volume | Intent | Content Type | Format | Angle | Assigned To |
|---------|--------|--------|-------------|--------|-------|-------------|
| [kw] | X | Info | Blog | How-to | Beginner | [writer] |
| [kw] | X | Comm | Blog | Comparison | Decision | [writer] |
```

---

## 6. Content Briefs

A content brief is the spec document for every piece of content. It ensures consistency, quality, and SEO alignment.

### Content Brief Template

```markdown
# Content Brief: [Working Title]

## Target
- **Primary Keyword**: [keyword] (Volume: X, KD: X)
- **Secondary Keywords**: [kw1], [kw2], [kw3]
- **Search Intent**: [informational / commercial / transactional]
- **Target URL**: /category/page-slug/

## SERP Analysis
- **Current ranking**: [position or "not ranking"]
- **Top 3 competitors**: [URL1], [URL2], [URL3]
- **Content type that ranks**: [guide / list / comparison / tool]
- **Average word count (top 5)**: [X words]
- **Featured snippet opportunity**: [yes/no, type: paragraph/list/table]

## Content Requirements
- **Word count target**: [X-Y words]
- **Title tag**: [draft, max 60 chars]
- **Meta description**: [draft, max 155 chars]
- **H1**: [exact H1]

## Outline
### H2: [Section 1]
- Key points to cover
- [Secondary keyword to include]

### H2: [Section 2]
- Key points to cover

### H2: [Section 3]
- Key points to cover

### H2: FAQ
- Q: [question from PAA]
- Q: [question from PAA]

## Internal Links
- Link TO: [pillar page URL], [related article URL]
- Link FROM (update these old articles): [URL1], [URL2]

## External References
- [Authoritative source to cite]
- [Data to reference]

## Media
- [ ] Hero image
- [ ] [X] supporting images/diagrams
- [ ] [Video embed if applicable]

## CTA
- Primary CTA: [what action should the reader take]
- Lead magnet / offer: [if applicable]

## Notes
- [Special instructions for writer]
- [Unique angle or differentiator]
```

---

## 7. Content Production Pipeline

### Stages
```
1. PLANNING       -> Topical map, prioritization, keyword assignment
2. BRIEFING       -> Content brief created and approved
3. WRITING        -> First draft (writer follows brief)
4. EDITING        -> Editorial review (accuracy, readability, brand voice)
5. SEO REVIEW     -> On-page SEO optimization (title, meta, headings, keywords, links)
6. MEDIA          -> Images, graphics, video added
7. FINAL QA       -> Proofread, link check, mobile preview
8. PUBLISHING     -> Publish, submit to Search Console, share on social
9. MONITORING     -> Track rankings at 2w, 4w, 8w, 12w
10. REFRESH       -> Update if rankings plateau or decline
```

### Content Calendar Template
```markdown
| Week | Topic | Keyword | Type | Writer | Status | Publish Date |
|------|-------|---------|------|--------|--------|-------------|
| W1 | [Title] | [kw] | Pillar | [name] | Writing | 2026-05-01 |
| W1 | [Title] | [kw] | Cluster | [name] | Brief | 2026-05-03 |
| W2 | [Title] | [kw] | Cluster | [name] | Planned | 2026-05-08 |
```

### Content Velocity Targets
| Site Stage | Articles/Month | Focus |
|-----------|---------------|-------|
| New site (0-6 months) | 8-12 | Foundation pillars + quick-win clusters |
| Growth (6-18 months) | 12-20 | Expanding topical coverage, filling gaps |
| Mature (18+ months) | 8-12 new + 4-8 updates | New topics + refresh declining content |

---

## 8. Content Refresh Strategy

Published content decays. Regular updates are essential to maintain and grow rankings.

### When to Refresh
- Rankings dropping (was top 5, now page 2+)
- Traffic declining quarter-over-quarter
- Content is > 12 months old with no updates
- SERP landscape has changed (new competitors, new intent)
- Information is outdated (statistics, tools, recommendations)
- New internal pages to link to

### Refresh Process
1. **Identify candidates**: Search Console > Pages sorted by clicks (descending), filter for declining trend
2. **Analyze current performance**: What queries does it rank for? What position? What is the intent match?
3. **Competitive analysis**: What do current top-3 results cover that you do not?
4. **Update content**:
   - Add new sections covering missing subtopics
   - Update outdated statistics, screenshots, examples
   - Improve intro and conclusion
   - Add new internal links (to content published since original)
   - Add FAQ section if missing
   - Improve formatting (shorter paragraphs, more subheadings, visuals)
5. **Update metadata**: Title tag, meta description (improve CTR)
6. **Update publish date** (only if substantial changes were made)
7. **Re-submit** to Search Console
8. **Monitor** at 2w, 4w, 8w

### Refresh Priority Matrix
| Priority | Criteria |
|----------|----------|
| High | High traffic + declining + easy to update |
| Medium | Medium traffic + stable + opportunity to improve |
| Low | Low traffic + stable + minor updates needed |
| Skip | No traffic + no keyword potential + low business value |

---

## 9. Programmatic SEO

Creating pages at scale using templates, data sources, and automation. This is how sites like Zapier, NomadList, and Wise rank for thousands of long-tail queries.

### When to Use Programmatic SEO
- Large number of similar queries with predictable patterns (e.g., "[tool] alternatives", "[city] weather", "[A] vs [B]")
- A data source exists (database, API, public data)
- Templates can create genuinely useful pages (not just keyword-stuffed shells)

### Programmatic SEO Process
1. **Pattern identification**: Find keyword patterns with search volume (e.g., "best [X] for [Y]", "[city] cost of living")
2. **Data sourcing**: Identify or create the data to populate templates (APIs, databases, scraped data, original research)
3. **Template design**: Create a page template that produces genuinely useful content for each variation
4. **Quality control**: Ensure every generated page is:
   - Unique (not duplicate of other generated pages)
   - Useful (provides real value, not just keyword combinations)
   - Accurate (data is correct and up to date)
   - Indexable (not thin content — add unique commentary, analysis, or context)
5. **Internal linking**: Auto-generate contextual links between related programmatic pages
6. **Launch and monitor**: Publish in batches, monitor indexation and rankings

### AI + Human Workflow for Content at Scale
- AI generates first drafts from briefs and data
- Human editor reviews for accuracy, voice, and quality
- SEO specialist optimizes on-page elements
- Never publish AI-only content without human review
- Add unique insights, examples, and analysis that AI cannot generate

### Free Tools Strategy
Create free tools that solve micro-problems in your niche. They attract backlinks, generate traffic, and build topical authority.

Examples:
- Calculators (ROI calculator, pricing estimator)
- Generators (title generator, meta description generator)
- Checkers/Auditors (SEO checker, readability analyzer)
- Converters (unit converter, format converter)
- Templates/Downloadables (spreadsheets, checklists, frameworks)

Why they work:
- High link magnet potential (people link to tools naturally)
- Recurring traffic (users bookmark and return)
- Lead generation (gate advanced features behind email)
- Topical authority signal (Google sees you as a resource hub)
