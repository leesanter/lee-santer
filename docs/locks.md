# Project Locks (IA, schema, and non-negotiables) — v1.1

**Purpose:** Freeze the fundamentals so the build doesn’t accrue avoidable debt.

## 1) Information architecture & routes
- `/` (Home)
- `/work` (Case studies index)
- `/work/[slug]` (Case study detail)
- `/insights` (Blog index)
- `/insights/[slug]` (Post detail)
- `/services` (hub; nav label “Expertise”; 301 `/expertise` → `/services`)
- `/services/strategy`, `/services/design`, `/services/development`, `/services/growth`
- `/about`, `/contact`
- **No** `/tags/*` pages.
- Slugs are lowercase kebab and **stable** once published.

## 2) Content model (collections & fields – summary)
### Case studies (required unless marked optional)
- `title`, `slug`, `summary` (≤160 chars), `hero` (+alt), `completedDate`, `displayServices[]` (decorative), `siteUrl` (optional)
- `sections[]`: repeatable { `title`, `prose` (MDX), optional `gallery[]`, optional `layoutHint` }
- `metrics[]` (optional), `galleryTop[]` (optional), `ogImage` (optional), `featured` (optional), `draft` (optional)
- `expertiseCategories[]`: enum from {Strategy, Design, Development, Growth} (1–3)
- `highlightInExpertise[]`: **editorial rule: at most one category per project** (field may be a list, but treat as single-select in practice)
- `highlightPriority`: number (only used when highlighted; lower = higher priority)
- `workFilterCategory`: single enum {Strategy|Design|Development|Growth} for `/work` filter chips

### Insights
- `title`, `slug`, `summary`, `date`, `hero` (+alt), `tags[]` (optional tiny set), `draft` (optional), `ogImage` (optional), body (MDX)

### Tags
- Internal-only; not routed. (Optional later for related-content logic.)

## 3) Work index filtering
- Chips: **All, Strategy, Design, Development, Growth** (radio behaviour).
- Implemented server-side; optional `?category=design` query.

## 4) Services page logic (hub & subpages)
- **Hub `/services`:** no per-category case studies while library < 8 items. Optionally show **one Featured case study** (hero/micro card) to break up content.
  - **Selection order:** explicit config `servicesHubFeature` (slug) → lowest `highlightPriority` across all categories → most recent `completedDate`.
  - Must be non-draft, with hero & summary. It may also appear on a subpage.
- **Subpages `/services/{category}`:** include one **Selected project** chosen deterministically:
  1) From studies whose `expertiseCategories` include the category,
  2) Prefer those in `highlightInExpertise` with the lowest `highlightPriority`,
  3) Tie-break by most recent `completedDate`,
  4) Else pick the most recent,
  5) Else show a tasteful empty state.

## 5) Service Anchor Map (deep-linking)
- See `/docs/service-anchors.md` for canonical labels and anchors.
- Case study `displayServices[]` may deep-link if mapped; otherwise render as plain text.

## 6) Image strategy
- Local assets under `src/assets/...`; AVIF/WEBP preferred.
- Always set `width`/`height` to avoid CLS; descriptive `alt` required.
- One image helper component used everywhere; LCP hero is statically rendered.

## 7) Motion policy
- Single IntersectionObserver toggling `.is-inview` via data attributes.
- Header scroll state via body classes; zero layout thrash.
- Honour `prefers-reduced-motion`; CSS-first animations.

## 8) Fonts
- Single family, WOFF2 only (licensed); system fallback stack.
- Preload only the critical face (usually regular or medium).

## 9) Performance budget (mobile targets)
- LCP ≤ **1.8s**; CLS < **0.05**
- JS ≤ **80 KB** gz; CSS ≤ **50 KB**
- Fonts ≤ **2** files total

## 10) SEO defaults
- Title pattern: `Page Title — Lee Santer`
- Descriptions ≤160 chars
- Canonical = `PUBLIC_SITE_URL` + path
- OG/Twitter defaults; per-page override via front-matter
- JSON-LD: `Person` site-wide; `Article` for Insights; `CreativeWork` for case studies; `Service` for services pages
- `robots.txt`: disallow when `PUBLIC_NOINDEX_ALL=true`
- Sitemap includes all visible routes

## 11) Environment variables (names & intent)
- `PUBLIC_SITE_NAME`, `PUBLIC_HTML_LANG`, `PUBLIC_SITE_LOCALE`
- `PUBLIC_DEFAULT_TITLE`, `PUBLIC_DEFAULT_DESCRIPTION`, `PUBLIC_OG_IMAGE`
- `PUBLIC_TWITTER`
- `PUBLIC_SITE_URL` (**must** be set in prod)
- `PUBLIC_NOINDEX_ALL` (true on staging)
- Consent/analytics IDs blank by default

## 12) Accessibility gates
- Semantic headings; skip-to-content; focus visible; keyboard nav.
- Colour contrast AA; images with alt (blank only if decorative).
- Motion respects `prefers-reduced-motion`.

## 13) Security headers (deploy)
- HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, conservative Permissions-Policy.
- CSP in report-only initially.

## 14) Workflow guardrails
- Branches per feature: `feat/content-collections`, `feat/work-index`, `feat/case-study`, `feat/services-hub`, `feat/services-pages`, `perf/motion`, `chore/seo`.
- Conventional commits; PR template with gates for Content, Performance, A11y, SEO.

## 15) Decision log (v1.1)
- “Expertise” label; `/services` route; 301 `/expertise` → `/services`.
- No public `/tags/*` pages.
- Work filter category is a **single** enum per case study.
- Deterministic “Selected project” logic; no hardcoded picks.
- **Hub** shows zero or one **Featured case study**; no per-category lists until library ≥ 8.
- “Custom Website Development” replaces “Astro Front-end Builds” (anchor `#custom-website-development`).
