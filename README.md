# Lee Santer — Astro Portfolio

Lean, production-oriented Astro build with semantic HTML, sensible defaults, and a small “motion + theming” layer:

- Token-driven design system (palette → semantic theme tokens)
- Reusable shell (Base layout, Header, Footer, SEO, Head/Font assets, Cookie Consent)
- Content Collections for **Work**, **Services**, **Insights**
- Clean listings (pagination where relevant) + optional RSS
- Self-hosted variable fonts with preloads
- Small attribute-driven motion system (`data-anim`, `data-parallax`)
- Section-driven theming via `data-scheme="light|dark"` + stable header overlay logic
- Strict link checking for Services (`lint:links`)

> Style guide: visit `/style-guide`.

---

## Table of contents

1. [Quick start](#quick-start)  
2. [Scripts](#scripts)  
3. [Environment & modes](#environment--modes)  
4. [Project structure](#project-structure)  
5. [Site settings](#site-settings)  
6. [Design system](#design-system)  
7. [Theming & header behaviour](#theming--header-behaviour)  
8. [Motion system](#motion-system)  
9. [Content helpers](#content-helpers)  
10. [Components](#components)  
11. [Images & assets](#images--assets)  
12. [SEO, Sitemap, Robots & RSS](#seo-sitemap-robots--rss)  
13. [Fonts](#fonts)  
14. [Accessibility & performance](#accessibility--performance)  
15. [Clone-for-client checklist](#clone-for-client-checklist)  
16. [Go-live checklist](#go-live-checklist)  
17. [Deploy](#deploy)  
18. [Security headers & CSP](#security-headers--csp)  
19. [Maintenance & backporting](#maintenance--backporting)  
20. [Troubleshooting](#troubleshooting)  
21. [Licence](#licence)

---

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run dev server
npm run dev

# 3) Type/syntax checks (optional)
npm run check

# 4) Build + preview production
npm run build && npm run preview
```

---

## Scripts

```jsonc
// package.json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "lint:links": "node scripts/validate-service-links.mjs"
  }
}
```

- `check`: Astro’s type/syntax checks (fast).
- `format`: Prettier across the repo.
- `typecheck`: TS type checking w/o emit.
- `lint:links`: verifies Services link mappings stay in sync.

---

## Environment & modes

> Keep **`.env.example`** as documentation. Use mode files locally:
>
> - `.env.development` (used by `astro dev`)
> - `.env.production` (used by `astro build` / `astro preview`)

Minimum you’ll care about:

- **Dev** (quiet & safe):
  ```env
  INDEXING=false
  PUBLIC_SITE_URL=""
  PUBLIC_ENABLE_RSS=false
  ```
- **Prod** (local preview mirrors live):
  ```env
  INDEXING=true
  PUBLIC_SITE_URL="https://leesanter.co.uk"
  PUBLIC_ENABLE_RSS=false
  ```

**Git ignore (recommended):**
```
# Ignore all real envs; keep example tracked
.env*
!.env.example
```

Hosts (Netlify/Cloudflare/etc.): set the same keys in the host’s **Environment Variables** UI.

---

## Project structure

```
src/
  components/
    atoms/
      LogoRow.astro
      TestimonialQuote.astro
    molecules/
      InsightCard.astro
      WorkCard.astro
    organisms/
      ClientSection.astro
      ContactForm.astro
      InsightsList.astro
      SiteHeader.astro
      SiteFooter.astro
      WorkList.astro
    utils/
      CookieConsent.astro
      FontAssets.astro
      HeadAssets.astro
      MotionController.astro
      ScrollListener.astro
      SEO.astro
  content/
    work/…          # case studies (MD/MDX)
    insights/…      # posts (MD/MDX)
    services/…      # service pages (MD/MDX)
    config.ts       # content collections config
  layouts/
    Base.astro
    Minimal.astro   # wraps Base with header/footer off
  lib/
    categories.ts
    constants.ts
    content.ts
    format.ts
    readTime.ts
    services.ts
    site.ts
    work.ts
  pages/
    index.astro
    style-guide.astro
    work/
      index.astro
      [slug].astro
      [category].astro
    services/
      index.astro
      [slug].astro
    insights/
      [...page].astro
      [slug].astro
    rss.xml.ts
    robots.txt.ts
  styles/
    main.scss
    _tokens.scss
    _theme.scss
    _motion.scss
    _base.scss
    _typography.scss
    _layout.scss
    _ui.scss
    _utilities.scss
scripts/
  validate-service-links.mjs
public/
  _headers
  _redirects
  # favicons, manifest, og/default, fonts…
```

---

## Site settings

`src/lib/content.ts` exposes a `getSiteSettings()` that reads values such as:

- site name, default description, default OG image, twitter handle, brand logo path

These feed into `SEO.astro` so pages have sensible defaults.

---

## Design system

**Tokens** (`_tokens.scss`) define the palette and motion constants.  
**Theme** (`_theme.scss`) maps tokens to roles; switch per section using `data-scheme="light|dark"`.

Typography defaults (`_typography.scss`), layout primitives (section spacing, `.container` sizes, stack utilities) and UI primitives (buttons, inputs) live under `/styles`.

---

## Theming & header behaviour

- Add `data-scheme` to the section/area that should define colours beneath the header.
- `ScrollListener.astro` applies body classes for scroll direction/idle; the header uses these to switch between transparent/solid safely.
- When a hero sits behind the header, combine “transparent + on-dark” at the top; it will pin to a light scheme automatically after the hero scrolls past.

---

## Motion system

Attribute-based animation (wipe reveal, fades, slides, pop, blur) powered by `MotionController.astro` + `_motion.scss`. Respects `prefers-reduced-motion`.

**Common attributes**

- `data-anim="reveal|fade|fade-up|slide-left|slide-right|pop|blur-in"`
- `data-anim-delay="0|1|2…"` (steps)
- `data-anim-group` + `data-anim-stagger="120"` (auto-stagger children)
- `data-anim-threshold`, `data-anim-once="false"`
- `data-parallax="10"` (+ `.parallax-target` img; optional sizing helpers via `data-size="hero|banner|square"`)

---

## Content helpers

See `src/lib/*` for single-source helpers:

- `getAllWork()`, `getWorkForHome(limit)`
- `inCategory(entry, key)`, `getWorkByCategory(key)`
- `mapServiceKeysToLinks(keys)` (strict mapping; fails in CI when `STRICT_SERVICES=true`)
- `getLatestInsights(limit)`, `getAllPosts()`, etc.

---

## Components

- **SiteHeader.astro** — sticky header; accessible dropdowns; scheme aware.
- **SiteFooter.astro** — dark footer with CTA + link columns.
- **SEO.astro** — titles, canonicals, Open Graph/Twitter, JSON-LD; optional RSS discovery.
- **HeadAssets.astro / FontAssets.astro** — manifest, favicons, theme colour; preloads.
- **CookieConsent.astro** — respects GPC; injects GTM only after opt-in.
- **ScrollListener.astro** — body scroll classes used by header.
- **WorkCard.astro / InsightCard.astro** — listing cards.
- **WorkList.astro / InsightsList.astro** — organism-level wrappers:
  - **Controlled**: pass `entries` (already filtered/sorted)
  - **Autonomous**: `category`, `limit`, `includeSlugs`, `excludeSlugs`, `shuffle`
  - Own their **empty-state** copy to keep pages clean

---

## Images & assets

- Put static files in `/public` (use absolute paths like `/images/hero.jpg`).
- For MD/MDX entries, keep images next to the content where practical.
- Provide a fallback OG image at `/public/og/default.png` (or set `PUBLIC_OG_IMAGE`).

---

## SEO, Sitemap, Robots & RSS

- **Canonicals** — `SEO.astro` emits **one self-referential canonical per page**, using `PUBLIC_SITE_URL` when set.
- **Sitemap** — enabled only when **`INDEXING=true` and `PUBLIC_SITE_URL` is set**. Emits `sitemap-index.xml`.
- **Robots** — `/robots.txt`:
  - Dev/staging (INDEXING=false):  
    ```
    User-agent: *
    Disallow: /
    ```
  - Prod (INDEXING=true):  
    ```
    User-agent: *
    Allow: /
    Sitemap: https://your-domain.tld/sitemap-index.xml
    ```
- **RSS** — `/rss.xml` (Insights feed) only when `PUBLIC_ENABLE_RSS=true`. `SEO.astro` adds a discovery link when enabled.

Paginated Insights pages can be marked `noindex,follow` (we currently set `noindex` on pages > 1).

---

## Fonts

Self-hosted variable Inter by default. Override via `FontAssets.astro` and `/public/fonts`. Optional preload overrides via `PUBLIC_FONT_PRELOADS`.

---

## Accessibility & performance

- Skip link to `#main`
- Keyboard-operable nav/disclosures; visible focus rings
- Respects `prefers-reduced-motion`
- Images: `loading="lazy"`, `decoding="async"`, meaningful `alt`
- Lean components; zero client-JS for category filtering (real routes)

---

## Clone-for-client checklist

1) **Identity** — swap `/public` icons; update `site.webmanifest` `name`/`short_name`; set `PUBLIC_THEME_COLOR`.  
2) **Domain** — set `PUBLIC_SITE_URL`; use `INDEXING=false` on staging.  
3) **Head & SEO** — default title/description; `PUBLIC_OG_IMAGE`.  
4) **Nav & footer** — update items; `Cookie preferences` button triggers `window.showCookiePreferences?.()`.  
5) **Analytics & consent** — set `PUBLIC_GTM_ID`; bump `PUBLIC_CONSENT_VERSION` when copy/purposes change.  
6) **Content** — add first Work/Services/Insights entries.  
7) **Headers** — `_headers` present (HSTS, Referrer, Permissions, CSP-Report-Only).  
8) **Smoke** — `npm run build && npx serve dist`; check `/`, list pages, detail, `/robots.txt`, `/sitemap-index.xml`, `/rss.xml` (if enabled).

---

## Go-live checklist

- `PUBLIC_SITE_URL` and `INDEXING=true` in production  
- Canonicals & OG correct on key pages  
- Accessibility: keyboard flows & focus rings  
- Lighthouse sanity on Home/list/detail  
- Header/nav: no flicker; mobile parent links clickable  
- Cookie consent: GPC respected; GTM loads only after consent  
- Forms wired (if used)  
- `/robots.txt` shows `Allow: /` + absolute `sitemap-index.xml`

---

## Deploy

### Netlify
- Build: `npm run build`  
- Publish: `dist`  
- Environment:
  - **Production:** `PUBLIC_SITE_URL`, `INDEXING=true`, plus any analytics keys
  - **Previews/Branches:** `INDEXING=false`

### Other static hosts
Serve `dist/`. For SSR, install the relevant Astro adapter.

---

## Security headers & CSP

`public/_headers` ships defaults (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Start CSP in **Report-Only**, add 3rd-party origins you need, then enforce.

---

## Maintenance & backporting

When you find a generic improvement during client work, make the minimal change here and tag a release. Keep it light.

---

## Troubleshooting

- **Late/early scheme flips** — adjust global line: `<html data-motion-line="0.3">` or per-element `data-anim-threshold`.  
- **Parallax element collapses** — add a sizing helper: `data-size="hero"` or set `--frame-ratio` / `--frame-min-h`.  
- **Reveal doesn’t play on load** — ensure `_motion.scss` is imported and no parent overrides transforms.  
- **Dev shows sitemap warning** — set `INDEXING=false` or leave `PUBLIC_SITE_URL` empty in `.env.development`.  
- **RSS 404** — enable with `PUBLIC_ENABLE_RSS=true` (and rebuild).

---

## Licence

MIT (change if you need something different).
