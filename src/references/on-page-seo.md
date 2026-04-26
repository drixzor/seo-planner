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
