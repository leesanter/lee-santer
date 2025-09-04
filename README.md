# Lee Santer — Astro Portfolio (Starter-derived)

A clean Astro build focused on real-world delivery, now with a **lightweight motion system** and **section-driven theming**:

- Semantic HTML, accessible patterns, and sensible defaults
- **Token-driven design system** (palette + semantic theme tokens)
- Reusable layout utilities and components (Header, Footer, SEO, Cookie Consent)
- Content Collections (Markdown/MDX) for Work, Services, Insights
- Manual pagination where relevant, RSS/Robots/Sitemap
- Built-in **Style Guide** for visual QA
- Self-hosted variable fonts with preloads
- CI on PRs + sensible security headers (CSP in Report-Only by default)
- **Attribute-based motion** (`data-anim`, `data-parallax`) with Reveal wipe & parallax
- **Section-driven theming** via `data-scheme="light|dark"` + stable header overlay logic

> Style guide: `/style-guide`

---

## Table of contents

1. [Quick start](#quick-start)  
2. [Scripts](#scripts)  
3. [Project structure](#project-structure)  
4. [Environment variables](#environment-variables)  
5. [Site Settings](#site-settings)
6. [Design system](#design-system)  
   - [Tokens & theme](#tokens--theme)  
   - [Typography](#typography)  
   - [Layout](#layout)  
   - [UI primitives](#ui-primitives)  
   - [Utilities](#utilities)  
7. [Theming & header behavior](#theming--header-behavior)  
8. [Motion system](#motion-system)  
   - [Attribute API](#attribute-api)  
   - [Reveal (wipe)](#reveal-wipe)  
   - [Parallax & sizing helpers](#parallax--sizing-helpers)  
   - [Groups, delays & thresholds](#groups-delays--thresholds)  
9. [Content helpers (Work/Services/Insights)](#content-helpers-workservicesinsights)  
10. [Components](#components)  
   - [SiteHeader](#siteheaderastro)  
   - [SiteFooter](#sitefooterastro)  
   - [SEO](#seoastro)  
   - [HeadAssets & FontAssets](#headassetsastro--fontassetsastro)  
   - [CookieConsent](#cookieconsentastro)  
   - [ScrollListener](#scrolllistenerastro)  
   - [ContactForm](#contactformastro)  
   - [PostCard](#postcardastro)  
   - [WorkCard](#workcardastro)  
   - [WorkListing](#worklistingastro)  
   - [ClientSection & Testimonials](#clientsection--testimonials)  
11. [Images & assets](#images--assets)  
12. [SEO, Sitemap, Robots & RSS](#seo-sitemap-robots--rss)  
13. [Fonts](#fonts)  
14. [Accessibility & performance](#accessibility--performance)  
15. [Clone-for-client checklist](#clone-for-client-checklist)  
16. [Go-live checklist](#go-live-checklist)  
17. [Deploy](#deploy)  
18. [Security headers & CSP](#security-headers--csp)
19. [Maintenance & backporting](#maintenance--backporting)
20. [BEM naming](#bem-naming)
21. [Troubleshooting](#troubleshooting)
22. [Licence](#licence)

---

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run dev server
npm run dev

# 3) Build for prod
npm run build

# 4) Preview the build
npm run preview
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
    "typecheck": "tsc --noEmit"
  }
}
```

- `check`: Astro’s type/syntax checks (fast, low-noise).
- `format`: formats the whole repo with Prettier.
- `typecheck`: optional; useful if you lean on TS types.

**Additional (if present in project):**
- `"generate:og": "node ./scripts/generate-og.mjs"` – Satori + Resvg → `/public/og`
- `"validate:service-links": "node ./scripts/validate-service-links.mjs"` – strict services map check

---

## Project structure

```
src/
  components/
    atoms/
      LogoRow.asrto
      TestimonialQuote.astro
    molecules/
      InsightCard.astro
      WorkCard.astro
    organisms/
      ClientSection.astro
      ContactForm.astro
      InsightsListing.astro
      SiteHeader.astro
      SiteFooter.astro
      WorkListing.astro
    utils/
      CookieConsent.astro
      FontAssets.astro
      HeadAssets.astro
      MotionController.astro   ← central scheme + motion (replaces ThemeController)
      ScrollListener.astro
      SEO.astro
  content/
    work/…                     # case studies (MD/MDX)
    insights/…                 # posts (MD/MDX)
    services/…                 # service pages (MD/MDX)
    config.ts                  # content collections config
  layouts/
    Base.astro
  lib/
    categories.ts              # canonical keys/slugs + toSlug/fromSlug
    constants.ts
    content.ts                 # re-exports site/services/work/insights
    format.ts                  # formatDate()
    insights.ts
    md.ts                      # markdown → HTML
    readTime.ts
    seo.ts
    services.ts                # service/category helpers (memoized, strict map)
    site.ts
    work.ts                    # sorting, nextPrev, featured selection, testimonials
  pages/
    index.astro
    style-guide.astro
    work/
      index.astro              # /work listing
      [slug].astro             # /work/:slug detail
      [category].astro         # /work/:category filtered view
    services/
      [category].astro         # /services/:category detail
      index.astro              # /services listing
    insights/
      [...page].astro          # /insights listing
      [slug].astro             # /insights/:slug detail
    rss.xml.ts                 # /rss.xml (Insights feed via @astrojs/rss)
    404.astro
    500.astro
  styles/
    main.scss                  # imports partials (incl. _motion.scss)
    _tokens.scss               # palette + motion tokens (--dur-*, --ease-*, --anim-*)
    _motion.scss               # attribute-based effects, reveal, parallax sizing helpers
    _theme.scss
    _base.scss
    _typography.scss
    _layout.scss
    _ui.scss
    _utilities.scss
scripts/
  generate-og.mjs
  validate-service-links.mjs
public/
  _headers
  _redirects
  og/…
```

> Note: `ThemeController` and `lib/theme.ts` are no longer used; all scheme flips and motion are handled by `MotionController.astro` + `_motion.scss`.

---

## Environment variables

Create a `.env` at the project root. Example:

```env
# Site
PUBLIC_SITE_NAME="Client Name"
PUBLIC_SITE_LOCALE="en_GB"
PUBLIC_HTML_LANG="en-GB"
PUBLIC_DEFAULT_TITLE="Web & Brand Design"
PUBLIC_DEFAULT_DESCRIPTION="Web design, branding, and front-end development."
PUBLIC_OG_IMAGE="/og-default.jpg"
PUBLIC_TWITTER=""

# Canonicals / Robots
PUBLIC_SITE_URL="https://example.com"     # used by SEO + rss + robots
INDEXING=true                              # false for staging / previews

# Favicons & head assets
PUBLIC_FAVICON="/favicon.svg"              # Prefer SVG (present in /public by default)
# Optional fallbacks:
# PUBLIC_FAVICON_ICO="/favicon.ico"
# PUBLIC_FAVICON_PNG_32="/favicon-32.png"
# PUBLIC_FAVICON_PNG_16="/favicon-16.png"
PUBLIC_APPLE_TOUCH_ICON="/apple-touch-icon.png"
PUBLIC_MASK_ICON="/safari-pinned-tab.svg"
PUBLIC_MASK_ICON_COLOR="#000000"
PUBLIC_MANIFEST="/site.webmanifest"        # Linked by default if present
PUBLIC_THEME_COLOR="#1d2d44"
# PUBLIC_THEME_COLOR_DARK="#000000"

# Analytics / Consent
PUBLIC_GTM_ID=""
PUBLIC_CONSENT_VERSION="1"                 # bump when consent text/purposes change

# Optional: override font preloads used by <FontAssets />
# PUBLIC_FONT_PRELOADS="/fonts/InterVariable.woff2,/fonts/InterVariable-Italic.woff2"
```

**Type-safe env (optional):** add `src/env.d.ts` typings for `import.meta.env` keys so your IDE and builds catch mistakes early.

---

## Site Settings

**Site settings (`src/content/site/settings.json`):**
- `siteName` (string)
- `defaultDescription` (string)
- `defaultOgImage` (string path, e.g. `/og-default.jpg`)
- `twitterHandle` (string, optional)

> Note: Header logo is imported directly from `/src/assets/brand/wordmark.svg` — no `brandLogoPath` key.

---

## Design system

### Tokens & theme

- **Palette tokens** (`_tokens.scss`): brand colours + neutral ramp  
  `--palette--primary`, `--palette--secondary`, `--palette--tertiary`,  
  `--palette--neutral-50 … --palette--neutral-950`, plus white/black/transparent.

- **Semantic theme tokens** (`_theme.scss`): map palette → roles and support light/dark schemes:
  ```css
  :root { /* light defaults */ }
  [data-scheme="dark"] { /* dark overrides */ }
  ```
  Use `[data-scheme="light"|"dark"]` on `html`/`body` or any section to scope colours.

### Typography

Element defaults for `h1`–`h6`, anchors, lists, quotes, and code, plus a `.prose` wrapper for CMS/Rich Text spacing.

### Layout

Sections with vertical padding (`--layout--section-y`), `.container` sizes, stack utilities, and a 12-column `.content-layout`. Mobile collapses to **1 column**; span utilities handle tablet/desktop.

### UI primitives

Generic form controls (inputs/selects/textareas) themed via tokens; buttons with variants: `primary`, `secondary`, `outline`, `text` (+ sizes `sm`, `lg`, `block`). Outline contrast is corrected on dark surfaces.

### Utilities

Text size/weight/alignment helpers, colour helpers, max-width clamps, display/flex/grid helpers, visibility (`.sr-only`).

---

## Theming & header behavior

- **Section-driven:** add `data-scheme="light|dark"` to sections.
- **Decision line:** the scheme flips when the section crosses a line measured from the top of the viewport. Default is **25%** of viewport height; override per page:  
  ```html
  <html data-motion-line="0.3"> <!-- 30% -->
  ```
- **Header overlay:** Keep the header readable over dark heroes by combining `.is-transparent on-dark` at the top of the page. When solid (scroll up/idle), the header pins to a light scheme automatically.

---

## Motion system

Attribute-based effects managed by `MotionController.astro` and `_motion.scss`. Respects `prefers-reduced-motion` and triggers even if elements load in view.

### Attribute API

| Attribute | Values | Notes |
|---|---|---|
| `data-anim` | `reveal`, `fade`, `fade-up`, `slide-left`, `slide-right`, `pop`, `blur-in` | Effect to apply |
| `data-anim-delay` | integer steps (0,1,2,…) | Each step = `--anim-step` |
| `data-anim-duration` | milliseconds | Overrides `--anim-duration` |
| `data-anim-distance` | CSS length | Overrides slide/fade distance |
| `data-anim-once` | `"false"` | Replay when re-entering viewport |
| `data-anim-threshold` | 0–1 | Per-element decision line |
| `data-reveal-from` | `right` (default), `left` | Reveal direction |
| `data-parallax` | number (e.g. `10`) | Amount in % the inner image travels |
| `data-anim-group` | any | Enables auto-stagger for child `[data-anim]` |
| `data-anim-stagger` | milliseconds | Group stagger (default 90ms) |
| `data-anim-order` | CSS selector | Which children to stagger (default `:scope > [data-anim]`) |

### Reveal (wipe)

No wrapper needed; uses a `::before` overlay.

```html
<figure data-anim="reveal">…</figure>
<!-- Flip direction if needed -->
<figure data-anim="reveal" data-reveal-from="left">…</figure>
```

### Parallax & sizing helpers

Wrapper declares parallax + sizing; inner image uses `.parallax-target`.

```html
<figure data-anim="reveal" data-parallax="10" data-size="hero">
  <img class="parallax-target" src="…" alt="…" />
</figure>
```

Sizing helpers (in `_motion.scss`):

```css
/* Pick ONE per instance */
[data-parallax] {
  min-block-size: var(--frame-min-h, auto);
  aspect-ratio: var(--frame-ratio, auto);
}
[data-parallax][data-size="hero"]   { min-block-size: 100svh; }
[data-parallax][data-size="banner"] { aspect-ratio: 16 / 9; }
[data-parallax][data-size="square"] { aspect-ratio: 1 / 1; }
```

> Non-parallax reveals keep natural height automatically.

### Groups, delays & thresholds

```html
<div data-anim-group data-anim-stagger="120">
  <h2 data-anim="fade-up">Title</h2>
  <p data-anim="fade-up" data-anim-delay="1">Lead</p>
  <a class="btn" data-anim="fade-up" data-anim-delay="2">CTA</a>
</div>
```

Tune the global decision line per page via `<html data-motion-line="0.3">` or per element with `data-anim-threshold`.

---

## Content helpers (Work/Services/Insights)

Single source of truth under `src/lib`:

- `getAllWork()` — newest → oldest (drafts excluded)
- `getWorkForHome(limit)` — featured weighting + backfill newest
- `inCategory(entry, key)` / `inAnyCategory(entry, keys)` — membership tests
- `getWorkByCategory(key)` — filtered list
- `getFeaturedWorkForCategory(key, explicitSlug?)` — explicit slug wins; else newest in cat
- `nextPrev(items, currentSlug)` — circular navigation
- `mapServiceKeysToLinks(keys)` — strict mapping of service keys → `{{label, href?}}`

**CI enforcement**: with `STRICT_SERVICES=true`, unknown `services` keys fail the build.

---

## Components

### `SiteHeader.astro`
(Sticky header with hover dropdowns (desktop) and accessible disclosure submenus (mobile). Independent scheme control via `data-scheme` and overlay helpers. Scroll behavior powered by `ScrollListener` body classes.)

### `SiteFooter.astro`
(Dark footer with CTA, three link columns, and legal row. Uses scoped footer tokens.)

### `SEO.astro`
(Canonicals, Open Graph/Twitter, optional JSON-LD, and an automatic RSS discovery link pointing to /rss.xml.)

### `HeadAssets.astro` & `FontAssets.astro`
(Manifest/favicons/theme colour + font preloads.)

### `CookieConsent.astro`
(Respects GPC, injects GTM only after opt-in.)

### `ScrollListener.astro`
(Body classes for scroll direction/idle to coordinate header show/hide.)

### `ContactForm.astro`
(Unstyled form primitives, Netlify-compatible.)

### `PostCard.astro`
(Simple blog card example for Content Collections.)

### `WorkCard.astro`

**Props**

```ts
type ServiceLink = {{ label: string; href: string | null }};

interface Props {{
  href: string;
  title: string;
  img: import('astro:assets').ImageMetadata;
  alt: string;
  services?: ServiceLink[]; // optional; renders as chips
  compact?: boolean;        // optional; smaller layout variant
  class?: string;           // optional; extra classes
}}
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

### ClientSection & Testimonials

- `getTestimonialsForWork(entry)` ⇒ `{{quote, name, role?, company?, workTitle, workSlug}}[]`.
- `TestimonialQuote.astro` props: `quote`, `name`, `role?`, `company?`, `workTitle?`, `workSlug?`, `showWorkLink?` (default `true`).

---

## Images & assets

- Place static files in `/public` (absolute paths like `/images/hero.jpg`).  
- In Markdown/MDX, prefer relative images next to entries.
- OG defaults under `/public/og` if generated.

---

## SEO, Sitemap, Robots & RSS

- Sitemap: via @astrojs/sitemap (uses PUBLIC_SITE_URL / astro.config.mjs site). Draft content is excluded by collection filters.
- Robots: /robots.txt is generated with indexing controlled by INDEXING=true|false and includes an absolute sitemap URL in production.
- RSS (canonical): /rss.xml serves the Insights feed, generated with @astrojs/rss. Absolute URLs come from PUBLIC_SITE_URL (fallbacks to context.site when available).
  - Discovery: SEO.astro injects:
    ```
    <link rel="alternate" type="application/rss+xml" title="Insights — RSS" href="/rss.xml" />
    ```
    (It resolves to an absolute URL when PUBLIC_SITE_URL is set.)
  - Legacy: /insights.xml is permanently redirected to /rss.xml via /public/_redirects.

If you later want a site-wide feed (not just Insights), add a second generator under src/pages/ (e.g. all.xml.ts) and document that separately.

---

## Fonts

Self-hosted variable Inter by default; swap families as needed via `FontAssets` and `/public/fonts`.

---

## Accessibility & performance

- Skip link to `#main`  
- Keyboard-operable nav + dropdowns; focus rings visible and tokenised  
- Respects `prefers-reduced-motion`  
- Images: `loading="lazy"`, `decoding="async"`, meaningful `alt`  
- Lean components, no heavy global libs

---

## Clone-for-client checklist

**15-minute sweep** when starting a fresh client build.

1) **Project identity**  
   Replace `/public/logo.svg`. Update `/public/site.webmanifest` `name`/`short_name`. Set `PUBLIC_THEME_COLOR`.

2) **Domain & URLs**  
   `PUBLIC_SITE_URL` set; keep `astro.config.mjs -> site` reading from env. Use `INDEXING=false` on staging.

3) **Head & SEO**  
   Update default title/description envs. Swap `/og-default.jpg`. Check `SEO.astro` title format.

4) **Nav & footer**  
   Update header nav & footer groups; “Cookie preferences” → `window.showCookiePreferences?.()`.

5) **Analytics & consent**  
   Set `PUBLIC_GTM_ID`. Review banner copy; bump `PUBLIC_CONSENT_VERSION` after changes.

6) **Content collections**  
   Adjust `content/config.ts`; add first entries; confirm routes render.

7) **Security headers**  
   `public/_headers` present (HSTS, Referrer, Permissions, CSP-Report-Only). Add third-party origins as needed; enforce CSP later.

8) **Smoke test**  
   `npm run build && npx serve dist` then click around: `/`, `/blog`, `/blog/page/2`, a post, `/robots.txt`, `/sitemap-index.xml`, `/rss.xml`.

---

## Go-live checklist

- Prod env: `PUBLIC_SITE_URL` set, `INDEXING=true`, analytics keys present  
- Canonicals & OG correct per key page  
- Accessibility: keyboard flows & focus rings OK  
- Performance: Lighthouse on Home, list, detail; image sizes sane  
- Header/nav: no flicker; mobile parent links clickable  
- Cookie consent: GPC respected; GTM loads only after consent  
- Forms: submissions arrive; success/error states OK  
- Icons & manifest render everywhere  
- `/robots.txt` shows `Allow: /` and absolute sitemap URL in production  
- Monitoring/rollback optional but recommended

---

## Deploy

### Netlify
1. Create site from this repo.  
2. Build command: `npm run build`  
3. Publish directory: `dist`  
4. Environment variables:
   - Production: `PUBLIC_SITE_URL` = live domain, `INDEXING=true`
   - Deploy Previews/Branch deploys: `INDEXING=false`
   - Any others you use (GTM, theme colour, etc.)

### Other static hosts
Serve `dist/`. For SSR targets, install the relevant Astro adapter.


---

## Security headers & CSP

`public/_headers` ships sensible defaults (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Start with **CSP in Report-Only** while testing third-party origins; then enforce:

```
/*
  Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-src https://www.youtube.com https://player.vimeo.com
*/
```
Adjust as you add services (Hotjar, Sentry, etc.).


---

## Maintenance & backporting

This starter is intentionally simple. When you find a **generic** improvement while building a client site, you can copy the minimal fix back here and tag a release. Keep it lightweight.

### When to backport (tripwires)
- You hit the **same bug twice** across projects, or
- It’s obviously generic (tokens/scheme hooks, header/nav a11y, grid overflow, cookie banner theming, CSP/SEO standards), or
- A platform change (e.g. Consent Mode/CSP/meta) affects all sites.

### How to backport (2–3 minutes)
1. Make the **minimal** change in this starter (keep client-specific tweaks in the client repo).
2. Commit with a clear type:
   - `fix(header): align solid/transparent transitions; respect data-scheme`
   - `fix(styleguide): prevent grid overflow on small screens`
   - `feat(theme): add --nav-* hooks for header variants`
   - `docs: README—explain “pin only when solid” + cookie reopen`
3. Update `CHANGELOG.md` with one–two bullets.
4. Tag using SemVer:
   - **patch** (`1.1.1`) for bugfixes,
   - **minor** (`1.2.0`) for new non-breaking features,
   - **major** (`2.0.0`) if you change/break public tokens, class names, or component APIs.
5. Push the tag:
   ```bash
   git tag -a v1.1.0 -m "feat(theme): semantic tokens; fix(styleguide): overflow; docs: README"
   git push origin v1.1.0


---

## BEM naming

- **Entry (case detail)**: `entry`, `entry__header`, `entry__hero`, `entry__title`, `entry__wrapper`, `entry__intro`, `entry__meta`, `entry__services`, `entry__services-list`, `entry__date`, `entry__site`, `entry__overview`, `entry__body`, `entry__section`, `entry__image`, `entry__image--main`, `entry__nav`.
- **Work cards/listing**: `work-card`, `work-card--compact`, `work-grid`.
- **Next/prev**: `nextprev`, `nextprev__card`, `nextprev__media`, `nextprev__body`, `nextprev__eyebrow`, `nextprev__title`.

---

## Troubleshooting

- **Scheme flips feel late/early**: Adjust decision line `<html data-motion-line="0.3">` or per-element `data-anim-threshold`.
- **Parallax element collapses**: Add sizing helper: `data-size="hero"` or `style="--frame-ratio: 3 / 2"` / `--frame-min-h: 60svh`.
- **Reveal doesn’t play on load**: Ensure `_motion.scss` is imported and no parent overrides the transform/transition.
- (Keep the rest of your existing list.)

---

## Licence

MIT by default (replace with your preference).
