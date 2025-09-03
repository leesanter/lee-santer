# Lee Santer — Astro v5 Portfolio

A production-focused Astro build that mirrors the existing Webflow design while adding a lean, type-safe content layer and a modern motion/theming system.

- **Astro v5 + Content Collections**
- **Section-driven theming** (light/dark by section, no public toggle)
- **Tokenised design system** (palette + motion tokens)
- **Work/Services/Insights** helpers + JSON‑LD, sitemap, and caching
- **New motion system**: attribute-based effects, reveal wipe, lightweight parallax
- **Header overlay logic** that stays readable over heroes
- **Strict build checks** in CI (unknown service keys fail the build)

> Style guide: `/style-guide`

---

## Table of contents

1. [Quick start](#quick-start)  
2. [Scripts](#scripts)  
3. [Key concepts](#key-concepts)  
4. [Project structure](#project-structure)  
5. [Environment variables](#environment-variables)  
6. [Design system](#design-system)  
   - [Tokens (including motion)](#tokens-including-motion)  
   - [Typography & layout](#typography--layout)  
7. [Theming & header behavior](#theming--header-behavior)  
8. [Motion system](#motion-system)  
   - [Attribute API](#attribute-api)  
   - [Reveal (wipe)](#reveal-wipe)  
   - [Parallax](#parallax)  
   - [Groups, delays & thresholds](#groups-delays--thresholds)  
9. [Content helpers](#content-helpers)  
10. [Components](#components)  
    - [WorkCard](#workcardastro)  
    - [WorkListing](#worklistingastro)  
    - [ClientSection & Testimonials](#clientsection--testimonials)  
11. [Pages & routing](#pages--routing)  
12. [CI & scripts](#ci--scripts)  
13. [BEM naming](#bem-naming)  
14. [Troubleshooting](#troubleshooting)  

---

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run dev server
npm run dev

# 3) Type/syntax check
npm run check

# 4) Build + preview
npm run build && npm run preview
```

---

## Scripts

```jsonc
// package.json (core scripts)
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "generate:og": "node ./scripts/generate-og.mjs",
    "validate:service-links": "node ./scripts/validate-service-links.mjs"
  }
}
```

- `check`: Astro’s type/syntax checks (fast, low-noise).
- `generate:og`: renders OG images into `/public/og` (Satori + Resvg).
- `validate:service-links`: verifies service keys map to valid category/anchors.

---

## Key concepts

- **Single source of truth** for categories & content helpers:
  - `src/lib/categories.ts` — canonical keys/slugs + `toSlug/fromSlug`.
  - `src/lib/services.ts` — category/service helpers (memoised).
  - `src/lib/work.ts` — sort/filter, featured selection, next/prev.
  - `src/lib/content/index.ts` — re-exports for pages/components.

- **Section-driven theming**: the *section in view* controls the site scheme.
  Add `data-scheme="light|dark"` on sections (legacy `data-bg-color` also read).

- **Motion system**: no heavy libs. Attribute-based effects handled by a small controller
  (`MotionController.astro`) and `_motion.scss`. Works with `prefers-reduced-motion` and
  plays even if the element loads already in view.

---

## Project structure

```
src/
  components/
    atoms/
      TestimonialQuote.astro
    molecules/
      WorkCard.astro
    organisms/
      ClientSection.astro
      SiteHeader.astro
      SiteFooter.astro
      WorkListing.astro
    utils/
      SEO.astro
      HeadAssets.astro
      FontAssets.astro
      CookieConsent.astro
      ScrollListener.astro
      MotionController.astro     ← NEW (replaces ThemeController)
  content/
    work/ …
    insights/ …
    services/ …
    config.ts
  layouts/
    Base.astro
  lib/
    categories.ts
    services.ts
    work.ts
    content/index.ts
    format.ts
    md.ts
    theme.ts                    (legacy helper, now superseded by MotionController)
  pages/
    index.astro
    work/index.astro
    work/[slug].astro
    work/[category].astro
    services/[category].astro
    insights/[slug].astro
    404.astro
  styles/
    main.scss
    _tokens.scss                ← updated motion tokens
    _theme.scss
    _base.scss
    _typography.scss
    _layout.scss
    _ui.scss
    _utilities.scss
    _motion.scss                ← NEW
scripts/
  generate-og.mjs
  validate-service-links.mjs
public/
  _headers
  og/…
```

> Ensure `main.scss` imports the motion partial: `@use './motion';`

---

## Environment variables

```env
PUBLIC_SITE_NAME="Lee Santer"
PUBLIC_HTML_LANG="en-GB"
PUBLIC_SITE_URL="https://example.com"
INDEXING=true

PUBLIC_THEME_COLOR="#000000"
PUBLIC_FAVICON="/favicon.svg"
PUBLIC_MANIFEST="/site.webmanifest"
PUBLIC_FONT_PRELOADS="/fonts/InterVariable.woff2,/fonts/InterVariable-Italic.woff2"
```

---

## Design system

### Tokens (including motion)

`src/styles/_tokens.scss` (simplified, consistent naming):

```css
:root {
  /* PRIMITIVES */
  --ease-std: cubic-bezier(0.2, 0, 0.2, 1);
  --ease-emph: cubic-bezier(0.2, 0.8, 0.2, 1);

  --dur-100: 120ms;
  --dur-200: 200ms;
  --dur-300: 320ms;
  --dur-600: 600ms;
  --dur-1200: 1200ms;

  /* UI interaction semantics */
  --ui-ease: var(--ease-std);
  --ui-duration: var(--dur-200);

  /* Scheme flips */
  --scheme-ease: cubic-bezier(.2, 0, 0, 1);
  --scheme-fg-duration: var(--dur-200);
  --scheme-bg-duration: var(--dur-300);
  --scheme-shadow-duration: var(--dur-200);

  /* Motion system (effects + reveal) */
  --anim-ease: var(--ease-std);
  --anim-step: var(--dur-100);
  --anim-duration: var(--dur-600);
  --reveal-duration: var(--dur-1200);
  --anim-distance: 16px;
}
```

Global scheme flip transitions (already wired):

```css
/* Smooth scheme flips driven by html[data-scheme] */
:where(html[data-scheme]) :where(
  body, header, footer, section, article, aside, nav,
  h1,h2,h3,h4,h5,h6, p, li, a, blockquote,
  .btn, .chip, .tag, .card, .work-card, .site-header,
  input, textarea, select, svg, .icon, .prose
) {
  transition:
    color            var(--scheme-fg-duration)     var(--scheme-ease),
    background-color var(--scheme-bg-duration)     var(--scheme-ease),
    border-color     var(--scheme-fg-duration)     var(--scheme-ease),
    fill             var(--scheme-fg-duration)     var(--scheme-ease),
    stroke           var(--scheme-fg-duration)     var(--scheme-ease),
    box-shadow       var(--scheme-shadow-duration) var(--scheme-ease);
}
```

### Typography & layout

- Headings `h1…h6` + `.prose` spacing already set.  
- Section vertical rhythm tokens keep top/bottom padding tidy (first/last rules account for fixed header).

---

## Theming & header behavior

- **Who controls the scheme?** Sections do. Add `data-scheme="light|dark"` on any section (legacy `data-bg-color` still supported).
- **When does it flip?** A “decision line” measured from the top of the viewport. Default **25%** of viewport height.
  - Override per page: `<html data-motion-line="0.3">` (30%).
- **Header over heroes:** The header is transparent at the top. Add the helper class `.on-dark` to make links/icons invert while transparent over a dark hero. The header automatically becomes solid/light once scrolled.
- **No flicker:** First paint suppresses transitions; MotionController re-enables once initial scheme is applied.

---

## Motion system

- Pure attribute API; no extra wrappers needed.  
- Respects `prefers-reduced-motion`.  
- Animations trigger even if elements are in view on load.

`src/components/utils/MotionController.astro` — centralizes:
- scheme flipping
- effect triggers (`data-anim`)
- parallax
- group staggering

### Attribute API

Add one attribute to opt-in:

| Attribute | Values | Notes |
|---|---|---|
| `data-anim` | `reveal`, `fade`, `fade-up`, `slide-left`, `slide-right`, `pop`, `blur-in` | Effect to apply |
| `data-anim-delay` | integer steps (0,1,2,…) | Each step = `--anim-step` (default 120ms) |
| `data-anim-duration` | milliseconds | Overrides `--anim-duration` (default 600ms) |
| `data-anim-distance` | CSS length | Overrides slide/fade distance (default 16px) |
| `data-anim-once` | `"false"` | Replay when scrolled out/in again |
| `data-anim-threshold` | 0–1 | Per‑element decision line (fraction of viewport height) |
| `data-reveal-from` | `right` (default), `left` | Reveal direction |
| `data-parallax` | number (e.g. `10`) | Amount in % the inner image travels |
| `data-anim-group` | any | Enables auto-stagger for child `[data-anim]` |
| `data-anim-stagger` | milliseconds | Group stagger (default 90ms) |
| `data-anim-order` | CSS selector | Which children to stagger (default `:scope > [data-anim]`) |

### Reveal (wipe)

No wrapper needed; uses a `::before` overlay.

```html
<figure data-anim="reveal">
  <img src="/img.jpg" alt="…" />
</figure>

<!-- Flip direction if needed -->
<figure data-anim="reveal" data-reveal-from="left">…</figure>
```

### Parallax

Wrapper declares parallax + sizing; inner image uses `.parallax-target`.

```html
<figure data-anim="reveal" data-parallax="10" data-size="hero">
  <Image class="parallax-target" … />
</figure>
```

Sizing helpers (in `_motion.scss`):

```css
/* Pick ONE per instance */
[data-parallax] { min-block-size: var(--frame-min-h, auto); aspect-ratio: var(--frame-ratio, auto); }
[data-parallax][data-size="hero"]   { min-block-size: 100svh; }
[data-parallax][data-size="banner"] { aspect-ratio: 16 / 9; }
[data-parallax][data-size="square"] { aspect-ratio: 1 / 1; }
```

> Non‑parallax reveals keep natural height automatically.

### Groups, delays & thresholds

```html
<div data-anim-group data-anim-stagger="120">
  <h2 data-anim="fade-up">Title</h2>
  <p data-anim="fade-up" data-anim-delay="1">Lead</p>
  <a class="btn" data-anim="fade-up" data-anim-delay="2">CTA</a>
</div>
```

Tune the global decision line per page via `<html data-motion-line="0.3">`.

---

## Content helpers

- `getAllWork()` — newest → oldest (drafts excluded)
- `getWorkForHome(limit)` — weighted *featured* then backfill newest
- `inCategory(entry, key)` / `inAnyCategory(entry, keys)` — category predicates
- `getWorkByCategory(key)` — filtered list
- `getFeaturedWorkForCategory(key, explicitSlug?)` — explicit slug wins; else newest in cat
- `nextPrev(items, currentSlug)` — circular navigation
- `mapServiceKeysToLinks(keys)` — strict mapping of service keys → `{label, href?}` (CI enforces unknown keys)

> Formatting: `formatDate(date, 'MMM yyyy')` used across case metadata.

---

## Components

### `WorkCard.astro`

**Props**

```ts
type ServiceLink = { label: string; href: string | null };

interface Props {
  href: string;
  title: string;
  img: ImageMetadata;
  alt: string;
  services?: ServiceLink[]; // optional; renders as chips
  compact?: boolean;        // optional; smaller layout variant
  class?: string;           // optional; extra classes
}
```

**Usage (listing)**

```astro
<WorkCard
  href={`/work/${entry.slug}`}
  title={entry.data.title}
  img={entry.data.featuredImage}
  alt={entry.data.featuredAlt ?? entry.data.title}
  services={await mapServiceKeysToLinks(entry.data.services)}
/>
```

**Usage (next project, compact)**

```astro
<WorkCard
  compact
  class="nextprev__card"
  href={`/work/${next.slug}`}
  title={next.data.title}
  img={next.data.featuredImage}
  alt={next.data.featuredAlt ?? next.data.title}
  services={(await mapServiceKeysToLinks(next.data.services)).map(({label, href}) => ({label, href: href ?? null}))}
/>
```

### `WorkListing.astro`

- **Controlled**: pass `entries` (already filtered/sorted).  
- **Autonomous**: pass `category='all' | Category` + `includeSlugs`/`excludeSlugs`/`limit`/`shuffle`.
- Filter chips: `showFilter`, `active` slug (e.g. `'all'`, `'design'`, `'growth'`).
- Precomputes `WorkCard` props, including `services` via `mapServiceKeysToLinks`.

### `ClientSection` & Testimonials

- `getTestimonialsForWork(entry)` returns array of `{quote, name, role?, company?, workTitle, workSlug}`.
- `TestimonialQuote.astro` props:
  - `quote`, `name`, `role?`, `company?`, `workTitle?`, `workSlug?`, `showWorkLink?` (default `true`).

---

## Pages & routing

- `/work` — grid listing with optional filter chips  
- `/work/[slug]` — case study detail
  - Hero: `data-anim="reveal" data-parallax="10" data-size="hero"` + `.parallax-target`
  - Sections: `data-anim="fade-up"` on content blocks
  - Theming: `data-scheme="dark"` on hero header; `data-scheme="light"` on meta/overview
  - Next project: `WorkCard compact`
- `/services/[category]` — category overview, optional FAQ JSON‑LD
- `/insights/[slug]` — BlogPosting JSON‑LD, hero image via `<Image>`
- 404 present

---

## CI & scripts

- GitHub Actions (`.github/workflows/ci.yml`):
  - `npm run check`, `astro sync`, and **build**
  - `STRICT_SERVICES=true` ➜ build fails on unknown `services` keys
- `scripts/validate-service-links.mjs` — verifies `services` keys → anchor links
- `scripts/generate-og.mjs` — outputs OG images to `/public/og`

`public/_headers` tuned for caching: long for assets, short for HTML.

---

## BEM naming

- **Entry (case detail)**: `entry`, `entry__header`, `entry__hero`, `entry__title`, `entry__wrapper`, `entry__intro`, `entry__meta`, `entry__services`, `entry__services-list`, `entry__date`, `entry__site`, `entry__overview`, `entry__body`, `entry__section`, `entry__image`, `entry__image--main`, `entry__nav`.
- **Work cards/listing**: `work-card`, `work-card--compact`, `work-grid`.
- **Next/prev**: `nextprev`, `nextprev__card`, `nextprev__media`, `nextprev__body`, `nextprev__eyebrow`, `nextprev__title`.

---

## Troubleshooting

**Scheme flips feel late/early**  
- Tweak the decision line per page: `<html data-motion-line="0.3">` (0–1).  
- Or per element: `data-anim-threshold="0.35"`.

**Header colors look wrong over hero**  
- Ensure the hero section is marked `data-scheme="dark"`.
- Ensure the header has `.is-transparent on-dark` at the top of the page and only gains background when solid (ScrollListener handles solid state).

**Parallax element collapses**  
- Parallax images are absolutely positioned; the wrapper must define **size**. Use `data-size="hero"`, `style="--frame-ratio: 3 / 2"`, or `style="--frame-min-h: 60svh"`.

**Reveal doesn’t play on load**  
- MotionController primes `data-anim-state="ready"` and triggers after two `requestAnimationFrame` ticks; ensure `_motion.scss` is imported in `main.scss` and there are no custom transforms on parents overriding the transition.

**Migrating from `RevealImage.astro`**  
- Remove the component and add attributes: `data-anim="reveal"` (and optionally `data-parallax` + `.parallax-target`).

---

Happy building ✌️
