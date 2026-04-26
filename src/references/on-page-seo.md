# On-Page SEO Reference

45-point checklist for optimizing individual pages to rank and convert. Every page published should pass this checklist before going live.

---

## Title Tags (Points 1-5)

### 1. Primary Keyword in Title
- Include the primary keyword as close to the beginning as possible
- Do not force it if it reads unnaturally — readability beats placement

### 2. Title Length
- Target 50-60 characters (Google truncates at ~60 characters / 600px)
- Check pixel width, not just character count (W is wider than i)
- Use a SERP preview tool to verify display

### 3. Unique Titles
- Every page must have a unique title tag
- No duplicate titles across the site (check with Screaming Frog)

### 4. CTR Optimization
- Include power words that drive clicks: "Best", "Guide", "2026", "Free", "Proven", "Step-by-Step"
- Use numbers when possible: "7 Ways to...", "15 Best..."
- Add brackets/parentheses for visual separation: "[Case Study]", "(Updated 2026)"
- A/B test titles for important pages (track CTR in Search Console)

### 5. Brand in Title
- Append brand name at the end for branded recognition: "Page Title | Brand Name"
- For homepage and core pages, lead with brand: "Brand Name | Tagline"
- Omit brand from title if it causes truncation of important keywords

---

## Meta Descriptions (Points 6-8)

### 6. Compelling Meta Description
- Write a persuasive 1-2 sentence summary that sells the click
- Include a clear value proposition: what will the reader learn or gain?
- End with a call to action: "Learn how", "Discover", "Get started", "Find out"

### 7. Keyword in Meta Description
- Include the primary keyword naturally (Google bolds matching terms)
- Include 1-2 secondary keywords if they fit naturally
- Google rewrites meta descriptions ~70% of the time — write for humans, not bots

### 8. Meta Description Length
- Target 120-155 characters (Google truncates at ~155 characters / 920px on desktop)
- Mobile shows fewer characters (~120) — front-load the important message
- Every page must have a unique meta description

---

## Heading Hierarchy (Points 9-12)

### 9. Single H1 Tag
- Every page has exactly one H1 tag
- H1 includes the primary keyword (or a close variant)
- H1 matches the search intent (it should clearly communicate what the page is about)

### 10. H2 Subheadings
- Use H2 tags for major sections of the page
- Include secondary keywords in H2s where natural
- H2s should create a logical outline (someone reading just H2s understands the page structure)

### 11. H3-H6 Hierarchy
- Use H3 for subsections within H2 sections
- Never skip heading levels (H2 -> H4 without H3 is bad practice)
- Headings create the page's semantic structure for both users and search engines

### 12. Heading Formatting
- Keep headings concise (5-10 words)
- Use sentence case or title case consistently across the site
- Do not use headings purely for styling — use CSS for visual emphasis
- Include question-format headings for FAQ sections (helps win PAA boxes)

---

## URL Structure (Points 13-15)

### 13. Short, Descriptive URLs
- Target 3-5 words after the domain
- Include the primary keyword
- Remove stop words (a, the, and, of, in) unless they aid readability

```
Good: /seo-checklist/
Good: /on-page-seo-guide/
Bad:  /the-ultimate-guide-to-on-page-seo-optimization-for-beginners/
Bad:  /p?id=4521
```

### 14. URL Hierarchy
- URL path should reflect site structure: `/category/page-name/`
- Keep important pages shallow (2-3 levels maximum)
- Use hyphens as separators (not underscores or spaces)
- All lowercase

### 15. URL Permanence
- Do not change URLs after publishing (if you must, use 301 redirects)
- Do not include dates in URLs unless the content is inherently time-bound (news)
- Do not include page numbers or session IDs in URLs

---

## Image Optimization (Points 16-21)

### 16. Descriptive Alt Text
- Every image has alt text that describes the image content
- Include the relevant keyword if the image relates to it (do not stuff)
- Alt text serves accessibility — describe what is in the image for screen readers
- Keep alt text under 125 characters

```html
Good: alt="on-page SEO checklist infographic showing 45 optimization points"
Bad:  alt="image"
Bad:  alt="seo seo checklist seo optimization seo tips seo guide"
```

### 17. Descriptive File Names
- Rename files before uploading: `on-page-seo-checklist.webp` not `IMG_4521.jpg`
- Use hyphens between words
- Include relevant keywords naturally

### 18. Image Compression
- Compress all images before uploading (TinyPNG, ShortPixel, Squoosh)
- Target: < 200KB for standard images, < 100KB for thumbnails
- Hero images: < 500KB maximum

### 19. Modern Formats
- Serve WebP or AVIF (30-50% smaller than JPEG/PNG)
- Use `<picture>` element for format fallback
- Use responsive images with `srcset` for different screen sizes

### 20. Lazy Loading
- Add `loading="lazy"` to all below-the-fold images
- Do NOT lazy load the hero image or first visible image (hurts LCP)
- Lazy load iframes (YouTube embeds, maps)

### 21. Image Dimensions
- Always specify `width` and `height` attributes (prevents CLS)
- Use CSS `aspect-ratio` for responsive containers
- Serve images at the size they display (do not serve 2000px images in 400px containers)

---

## Content Quality (Points 22-28)

### 22. E-E-A-T Signals
- **Experience**: Show first-hand experience with the topic (personal examples, original data, screenshots)
- **Expertise**: Author credentials visible (author bio, byline, link to author page)
- **Authoritativeness**: Cite authoritative sources, link to them
- **Trustworthiness**: Contact page, about page, privacy policy, clear business identity

### 23. Content Depth
- Cover the topic comprehensively — answer all likely follow-up questions
- Check "People Also Ask" and include answers to related questions
- Analyze top-ranking competitors: what do they cover that you do not?
- Depth does not mean length — be comprehensive without being verbose

### 24. Content Freshness
- Include the current year in the title or H1 when relevant ("Best SEO Tools 2026")
- Display "Last updated" date visibly on the page
- Update content when information changes (tools, prices, statistics, best practices)
- Add new sections as the topic evolves

### 25. Content Uniqueness
- Every page must offer unique value not available elsewhere
- Do not rewrite competitor content — add your own analysis, data, experience
- Original research, proprietary data, unique frameworks add massive value
- Check for accidental duplicate content with Copyscape or Siteliner

### 26. Readability
- Write at a 7th-9th grade reading level (Hemingway Editor, Readable.com)
- Short paragraphs (2-4 sentences)
- Short sentences (under 20 words average)
- Use simple words over complex ones
- Active voice over passive voice
- Avoid jargon unless writing for expert audiences (and define it when first used)

### 27. Content Formatting
- Use bullet points and numbered lists for scannable content
- Bold key phrases and takeaways
- Use tables for comparative data
- Break up text with relevant images every 300-500 words
- Use blockquotes for quotes and callouts
- Include a table of contents for articles > 1,500 words

### 28. Multimedia
- Include at least one relevant image per article
- Add video when it adds value (tutorials, demonstrations, explainers)
- Use custom graphics, charts, or infographics for data
- Embed relevant social media posts, tweets, or examples
- All media should load fast and have proper alt text/transcripts

---

## Keyword Optimization (Points 29-33)

### 29. Keyword in First 100 Words
- Include the primary keyword naturally within the first 100 words of body content
- The introduction should clearly establish what the page is about

### 30. Keyword in Headings
- Primary keyword in H1
- Secondary keywords distributed across H2s
- Long-tail variations in H3s
- Never force keywords — readability and natural language take priority

### 31. Keyword Density
- No specific target — write naturally
- Rough guideline: primary keyword appears 3-5 times per 1,000 words
- Use LSI/related terms throughout (Google understands synonyms and context)
- If you are thinking about keyword density, you are thinking about it wrong — write for the reader

### 32. Keyword Variations
- Use synonyms, related terms, and natural language variations
- Tools: Google's "related searches", Ahrefs keyword suggestions, AlsoAsked
- NLP entities: include names, places, brands, concepts that Google associates with your topic

### 33. Avoid Keyword Cannibalization
- Only one page per primary keyword (check with `site:example.com "keyword"`)
- If multiple pages target the same keyword, consolidate or differentiate
- Map keywords to pages in a spreadsheet to prevent overlap
- Use Search Console to identify pages competing for the same query

---

## Featured Snippet Optimization (Points 34-36)

### 34. Paragraph Snippets
- Directly answer the question in 40-60 words immediately below a relevant heading
- Use the exact question as the heading (H2 or H3)
- The answer paragraph should be self-contained (no "as mentioned above" references)
- Format: "What is [X]? [X] is [clear definition in 40-60 words]."

### 35. List Snippets
- Use ordered lists (numbered steps) for "how to" queries
- Use unordered lists (bullets) for "types of", "examples of", "best" queries
- Include 5-8 items (Google tends to show 4-8 in snippet, with "more items" link)
- Each list item should start with a bold keyword or action verb

### 36. Table Snippets
- Use HTML `<table>` tags for comparison data, pricing, specifications
- Include clear `<th>` headers
- Keep tables under 5 columns and 8 rows for best snippet display
- Tables work well for "vs" queries, pricing comparisons, feature comparisons

---

## Internal Linking (Points 37-39)

### 37. Contextual Internal Links
- Include 3-5 internal links per article (more for longer content)
- Links should be contextual — placed within relevant sentences, not forced
- Link to pillar pages, related cluster articles, and relevant product/service pages

### 38. Descriptive Anchor Text
- Use descriptive, keyword-rich anchor text
- Vary anchor text (do not use the same anchor for every link to a page)
- Never use "click here" or "read more" as anchor text for SEO-important links

### 39. Link to Deep Pages
- Prioritize linking to pages that need ranking help (not just the homepage)
- Update old articles to link to new articles (reverse chronological linking)
- Ensure every new article links to at least 2 existing relevant articles

---

## User Experience (Points 40-42)

### 40. Above-the-Fold Value
- The first screen should clearly communicate what the page offers
- Headline (H1) + opening paragraph visible without scrolling
- No interstitial pop-ups that block content on mobile
- Hero image or visual that reinforces the topic

### 41. Page Layout
- Content width: 600-800px maximum for readability (60-80 characters per line)
- Adequate white space between sections
- Sidebar (if used) should not distract from main content
- Navigation is clear and consistent across pages
- Mobile layout: single column, no horizontal scrolling

### 42. Engagement Signals
- Reduce bounce rate: compelling intro, clear structure, fast loading
- Increase time on page: depth, multimedia, internal links
- Encourage scroll: visual cues, progressive disclosure, "table of contents" jump links
- Track with: Google Analytics engagement rate, scroll depth, time on page

---

## Conversion Optimization (Points 43-45)

### 43. Call-to-Action (CTA)
- Every article has at least one clear CTA
- Primary CTA appears above the fold AND at the end of content
- CTA matches the page's intent:
  - Informational: "Download our free guide", "Subscribe for updates"
  - Commercial: "Compare plans", "Start free trial"
  - Transactional: "Buy now", "Get a quote"

### 44. Lead Magnets
- Offer relevant downloadable content (checklist, template, ebook, tool)
- Gate behind email capture (but provide enough free value on the page itself)
- Lead magnet should be directly relevant to the page content
- Examples: "Download this 45-point checklist as a PDF"

### 45. Forms and Friction
- Minimize form fields (name + email is often enough)
- Forms are mobile-friendly (large inputs, appropriate input types)
- Clear privacy statement near forms
- Submit button text is specific: "Get the Checklist" not "Submit"
- Thank you page confirms action and suggests next steps

---

## On-Page SEO Quick Audit Template

Use this checklist when auditing or optimizing any page:

```markdown
## Page: [URL]
## Target Keyword: [keyword]
## Date: [YYYY-MM-DD]

### Title & Meta
- [ ] Title includes primary keyword (near beginning)
- [ ] Title is 50-60 characters
- [ ] Title is unique across site
- [ ] Title has CTR hook (number, power word, year)
- [ ] Meta description is compelling and includes keyword
- [ ] Meta description is 120-155 characters

### Headings
- [ ] Single H1 with primary keyword
- [ ] H2s include secondary keywords
- [ ] Heading hierarchy is correct (no skipped levels)
- [ ] Headings create a logical outline

### URL
- [ ] Short, descriptive, keyword-inclusive
- [ ] Lowercase, hyphens, no parameters

### Content
- [ ] Keyword in first 100 words
- [ ] Content matches search intent
- [ ] Comprehensive depth (covers topic fully)
- [ ] Unique value (original insights, data, examples)
- [ ] Good readability (short paragraphs, lists, formatting)
- [ ] E-E-A-T signals present (author, credentials, sources)
- [ ] Updated/fresh (current year, recent data)

### Images
- [ ] All images have descriptive alt text
- [ ] Images compressed and in WebP/AVIF
- [ ] Width/height attributes set
- [ ] Below-fold images lazy loaded

### Links
- [ ] 3-5+ internal links with descriptive anchors
- [ ] Links to pillar page and related clusters
- [ ] External links to authoritative sources

### Snippets
- [ ] Featured snippet opportunity addressed (paragraph, list, or table)
- [ ] FAQ section with schema (if applicable)

### Conversion
- [ ] CTA present (above fold + end of content)
- [ ] Lead magnet relevant to content
- [ ] Forms are mobile-friendly and low-friction

### Technical
- [ ] Canonical tag present (self-referencing)
- [ ] Schema markup implemented (Article, FAQ, BreadcrumbList)
- [ ] Page loads in < 2.5s (LCP)
- [ ] Mobile-friendly
```

---

## Search Intent Diagnosis Framework

A step-by-step process for verifying that your content matches what Google actually wants to rank for a given keyword. Intent mismatch is the most common reason good content fails to rank.

### Step 1: Google the Target Keyword
- Use an incognito/private window (avoids personalization bias)
- Search from the target country (use a VPN or Google's country-specific domain if needed)
- Record what you see before clicking any result

### Step 2: Analyze Top 5 Results
For each of the top 5 organic results, note:
- **Content type**: blog post, product page, landing page, tool, video, Wikipedia entry
- **Content format**: how-to guide, listicle, comparison table, step-by-step, definition
- **Content angle**: beginner-focused, expert-level, budget-focused, speed-focused, year-specific
- **Word count**: rough estimate (use a word counter extension or Ahrefs)

Look for the dominant pattern. If 4 out of 5 results are listicles, Google wants a listicle.

### Step 3: Check SERP Features
Each SERP feature signals a specific intent:
- **Featured snippet** (paragraph/list/table) = informational, Google wants a direct answer
- **Shopping results / product carousel** = transactional, searchers want to buy
- **People Also Ask (PAA)** = informational with depth, cover these questions in your content
- **Local pack (map + 3 results)** = local intent, needs LocalBusiness schema + GMB
- **Video carousel** = video intent, consider creating video content
- **Knowledge panel** = navigational/entity, hard to compete with unless you are the entity
- **Image pack** = visual intent, optimize images and consider an image-heavy format

### Step 4: Match Your Content Format to What Ranks
Create content that matches the dominant type, format, and angle. Do not fight the SERP.

### Intent Mismatch Examples (Common Mistakes)

| Keyword | What Ranks (SERP Reality) | Common Mistake | Fix |
|---------|--------------------------|----------------|-----|
| "best CRM" | Comparison listicles (10 Best CRM Software) | Publishing a product page for your CRM | Write a comparison list featuring your CRM alongside competitors |
| "CRM pricing" | Pricing pages with tables and tiers | Publishing a blog post about CRM costs | Create a pricing page with transparent pricing table |
| "how to use CRM" | Step-by-step tutorials with screenshots | Publishing a feature page listing CRM capabilities | Write a tutorial with numbered steps, screenshots, and examples |
| "CRM vs ERP" | Side-by-side comparison articles | Publishing a glossary page defining CRM | Write a detailed comparison with a feature-by-feature table |
| "CRM" (head term) | Mix of definitions, software lists, and Wikipedia | Publishing any single-intent page | Check which sub-intent dominates; usually "what is" + "best" split |

### When Intent is Mixed or Unclear
- If the SERP shows a mix of content types (some blogs, some products), the keyword has **fractured intent**
- Strategy: pick the intent that best matches your business goal and your strongest content type
- Consider creating two pages targeting different intents from the same keyword area
- Monitor which page Google prefers by tracking the ranking URL over 4-8 weeks

---

## Ranking Stagnation Diagnosis

When a page ranks at positions 8-15 for 4+ weeks and stops climbing, use this systematic checklist to diagnose and fix the bottleneck.

### Symptom Recognition
- Page ranked in positions 8-15 consistently for 4+ weeks
- No upward movement despite the page being indexed and receiving impressions
- Possibly slight fluctuation (position 9 one week, position 12 the next) without a clear trend

### Diagnostic Checklist

**Check 1: Is Content Thin Compared to Competitors?**
- Compare your page's word count against the top 3 results
- Compare depth: do they cover subtopics you miss?
- Compare media: do they have images, videos, tables, or interactive elements you lack?
- Fix: expand content to match or exceed top results in depth and comprehensiveness

**Check 2: Is the Page Getting Clicks?**
- In Google Search Console, check the page's CTR for its target keyword
- If CTR is below the expected rate for its position (position 10 should get ~2-3%), the title/meta description is not compelling enough
- Fix: rewrite title tag with a stronger hook (numbers, power words, current year). Rewrite meta description with a clear value proposition and call to action.

**Check 3: Are Competitors' Pages Newer?**
- Check the publication or "last updated" date of the top 3 results
- If they updated within the last 3 months and your page is 12+ months old, freshness is a factor
- Fix: update the page with new data, new sections, and a current "last updated" date

**Check 4: Is Internal Linking Weak?**
- Use Screaming Frog or Ahrefs to count how many internal pages link to this page
- If the top 3 results on competitor sites have significantly more internal links, your page lacks authority flow
- Fix: add contextual internal links from 5-10 relevant, high-traffic pages on your site

**Check 5: Does the Page Have Enough Backlinks?**
- Compare the referring domains pointing to your page vs. the top 3 results' pages
- If competitors have 10-50+ referring domains and you have 0-5, backlinks are the bottleneck
- Fix: prioritize link building to this specific page (guest posts, resource outreach, digital PR)

**Check 6: Was There a Recent Algorithm Update?**
- Check SEO industry news (Search Engine Land, Search Engine Journal, Barry Schwartz on X)
- If a core update happened recently, wait 2-4 weeks for rankings to stabilize before making changes
- Fix: if the update targeted your issue (thin content, low E-E-A-T, spam), address those root causes

### Fix Priority Order
When multiple issues are found, fix in this order (highest impact first):
1. **Content depth and intent match** — most common bottleneck, highest ROI
2. **Title tag and meta description for CTR** — quick win, no content rewrite needed
3. **Internal links** — free, fast, compounds over time
4. **Content freshness update** — moderate effort, signals relevance
5. **Backlink building** — highest effort, longest time to impact but essential for competitive keywords
6. **Wait for algorithm stabilization** — only if a recent update is confirmed

### Stagnation Tracking Table

| Page URL | Target KW | Current Pos. | Weeks Stuck | Diagnosis | Fix Applied | Date Fixed | New Pos. (4w) |
|----------|----------|-------------|-------------|-----------|-------------|------------|---------------|
| /page/ | [kw] | 11 | 6 | Thin content | Added 800 words + 3 images | 2026-05-01 | [check] |
| /page/ | [kw] | 9 | 8 | Low CTR (1.2%) | Rewrote title + meta | 2026-05-03 | [check] |
