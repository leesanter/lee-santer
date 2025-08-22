# Content Collections Spec (v1) — Case Studies, Insights, Internal Tags

**Goal:** Lock the content shapes before we build. This keeps routing, filters, and templates stable and avoids refactors later.

> Implementation note: These schemas assume Astro Content Collections + MD/MDX bodies.

---

## 1) Case Studies (collection: `case-studies`)

### Purpose
Structured data for portfolio work. Drives `/work` (index), `/work/[slug]` (detail), and “Selected project” picks on `/services/{category}` pages.

### Fields (required unless marked optional)
- **title** — string. Human-readable title of the project.
- **slug** — string. Lowercase, kebab-case, unique, stable once published.
- **summary** — string (≤160 chars). One/two-sentence overview for cards & OG.
- **hero** — image (local asset path). Used as the first visual; must have **alt** text.
- **completedDate** — date. Month-level fine (use first day of month, e.g., `2025-04-01`).
- **displayServices** — array of strings. Decorative list (e.g., “User Interface Design”, “Webflow”). May deep-link via the Service Anchor Map.
- **siteUrl** — url (optional). External link to the live site.
- **sections** — array (1–n) of:
  - **title** — string (e.g., “Visual Direction”, “Development Approach”).
  - **prose** — rich text/MDX (short paragraphs).
  - **gallery** — array of images (optional).
  - **layoutHint** — enum (optional): `text` | `text+gallery` | `full-bleed`.
- **metrics** — array of objects (optional): `{ label: string, value: string }`.
- **galleryTop** — array of images (optional). Shown near the hero if present.
- **ogImage** — image (optional). Overrides default social image.
- **featured** — boolean (optional). For “featured on Home/Work” if needed later.
- **draft** — boolean (optional; default `false`). Excluded from lists when true.

**Categorisation & selection (drives filters & services pages)**
- **expertiseCategories** — array (1–3) of enum: `Strategy` | `Design` | `Development` | `Growth`.
- **highlightInExpertise** — array (0–4) of enum as above. **Editorial rule:** treat as **single-select in practice** (at most one category per project should be highlighted).
- **highlightPriority** — number (default `999`). Used only when highlighted; lower = higher priority.
- **workFilterCategory** — enum (single): `Strategy` | `Design` | `Development` | `Growth`. Powers the `/work` chip filter.

**Internal tags (optional)**
- **internalTags** — array of strings from the canonical vocabulary (see §3). Not routed; used for “related content” logic only.

### Validation & editorial rules
- `summary` ≤160 chars.  
- `hero` must include descriptive `alt` (empty alt only if decorative).  
- `sections.length >= 1`.  
- `expertiseCategories.length >= 1`.  
- `workFilterCategory` required.  
- If `highlightInExpertise` is set, also set a sensible `highlightPriority` (e.g., `1`–`3`).  
- If `siteUrl` is present, it must be a full URL (`https://…`).

### Sorting
- `/work`: by `completedDate` (desc). `featured: true` may be bubbled first if you choose to use it later.

### Example (Forma)
```yaml
---
title: "Forma"
slug: "forma"
summary: "A crisp, restrained site for a modern architecture studio—clarity first, imagery-led."
hero: "../../assets/case-studies/forma/hero.avif"
heroAlt: "Homepage showing a minimalist grid with large architectural imagery"
completedDate: 2025-04-01
displayServices:
  - "Content Strategy & Planning"
  - "User Interface Design"
  - "Webflow"
siteUrl: "https://example.com"   # replace with live URL
sections:
  - title: "Visual Direction"
    prose: |
      A muted palette, considered typography, and a strong grid underpin the identity.
      Imagery is given room to breathe; interactivity is minimal and purposeful.
    gallery:
      - "../../assets/case-studies/forma/gallery-01.avif"
  - title: "Development Approach"
    prose: |
      Built in Webflow with a flexible CMS. Consistent hierarchy, responsive behaviour,
      and accessibility were considered from the start.
expertiseCategories: ["Strategy", "Design"]
highlightInExpertise: ["Strategy"]  # editorially one category max
highlightPriority: 1
workFilterCategory: "Strategy"
internalTags: ["Architecture", "CMS"]
ogImage: "../../assets/case-studies/forma/og.jpg"
draft: false
---

Main body copy can live here if you prefer some narrative below the structured sections.
```

---

## 2) Insights (collection: `insights`)

### Purpose
Articles and notes you’ll publish under `/insights`.

### Fields (required unless optional)
- **title** — string.
- **slug** — string (lowercase kebab-case, unique, stable).
- **summary** — string (≤160 chars).
- **date** — date (YYYY-MM-DD).
- **hero** — image (local asset path) + **alt** (optional but recommended).
- **tags** — array of strings from the canonical vocabulary (optional; internal only).
- **ogImage** — image (optional).
- **draft** — boolean (optional; default `false`).

**Computed during build (recommended)**
- **readingTime** — minutes, computed from body word count (assume ~225 wpm).

### Sorting
- `/insights`: by `date` (desc).

### Example
```yaml
---
title: "Design tokens that survive real projects"
slug: "design-tokens-that-survive"
summary: "How to set tokens that won’t implode when the brand evolves."
date: 2025-07-12
hero: "../../assets/insights/tokens/hero.avif"
heroAlt: "Abstract grid with colour swatches"
tags: ["Design", "Front-end", "Accessibility"]
ogImage: "../../assets/insights/tokens/og.jpg"
draft: false
---

MDX body here. Use shortcodes for callouts, image grids, or code samples.
```

---

## 3) Internal Tags (vocabulary, no routes)

### Purpose
Provide a small, shared vocabulary to connect Work & Insights for “related content”. These **do not** generate `/tags/*` pages.

### Canonical set (v1)
- Branding
- UI Design
- Front-end
- Strategy
- Accessibility
- Performance
- WordPress
- Astro

> Keep this set small (≤8). Add sparingly. If you rename a tag, update existing entries in both collections.

### Usage rules
- Case studies: `internalTags` optional, choose up to 3.  
- Insights: `tags` optional, choose up to 3.  
- Use them to fetch related content by overlap (≥1 shared tag), breaking ties by recency.

---

## 4) Acceptance criteria (for templates)

### `/work` (index)
- Lists visible (non-draft) case studies.
- Chip filter: All, Strategy, Design, Development, Growth.
- Filtering is server-rendered; optional `?category=` query.
- Cards show: hero, title, summary (or displayServices snippet), and link.
- No CLS: images rendered with width/height.

### `/work/[slug]` (detail)
- Shows hero, metadata (completed date, display services with deep-links when mapped), sections (with optional galleries), and optional metrics & galleryTop.
- Related case studies: 2 items by shared `workFilterCategory` or `internalTags` (fallback to recent).

### `/insights` (index)
- Lists visible (non-draft) posts by date desc.
- Optional filter by internal tags (not required for v1).

### `/insights/[slug]` (detail)
- Shows hero, date, reading time, body, and related articles (by shared tags or recent).

### `/services` (hub)
- No per-category case studies while library < 8. Optional single **Featured case study** allowed (see `locks.md` v1.1).

### `/services/{category}`
- One **Selected project** per category chosen by deterministic rules (see `locks.md` v1.1).

---

## 5) Editorial checklist
- Every image has meaningful alt (blank only if decorative).
- Summaries are ≤160 chars and read like meta descriptions.
- One primary CTA per page.
- UK English; plain, outcome-led copy.
- Avoid tool names in headings; mention them in body copy.

---

## 6) Failure states & fallbacks
- If a case study has **no** eligible Selected project for a service subpage, show the empty state and CTA.
- If a display service is **unmapped** in the Service Anchor Map, render it as plain text (no link).
- If an OG image is missing, use the default OG image and the `summary` as social text.

---

## 7) Change control
- Schema changes require updating this file and the corresponding templates. Avoid breaking changes once content exists.  
- Slugs are permanent once published; add redirects if you must change them.  
- Keep the internal tag set small; prefer merging similar tags rather than creating new ones.

