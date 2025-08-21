Bootstrapped from astro-starter@v1.1.1

# Astro Starter — Minimal, Accessible, Client-Ready

A clean Astro starter focused on real-world delivery:

- Semantic HTML, accessible patterns, and sensible defaults
- **Token-driven design system** (palette + semantic theme tokens)
- Reusable layout utilities and components (Header, Footer, SEO, Cookie Consent)
- Content Collections (Markdown/MDX) with a ready-to-go Blog
- Manual pagination (no framework helpers), RSS feed, Robots & Sitemap
- Built-in **Style Guide** page for quick visual QA
- Self-hosted variable fonts with preloads
- CI on PRs + sensible security headers (CSP in Report-Only by default)

> Style guide: `/style-guide`

---

## Table of contents

1. [Quick start](#quick-start)  
2. [Scripts](#scripts)  
3. [Project structure](#project-structure)  
4. [Environment variables](#environment-variables)  
5. [Design system](#design-system)  
   - [Tokens & theme](#tokens--theme)  
   - [Typography](#typography)  
   - [Layout](#layout)  
   - [UI primitives](#ui-primitives)  
   - [Utilities](#utilities)  
6. [Theming & header behavior](#theming--header-behavior)  
7. [Components](#components)  
   - [SiteHeader](#siteheaderastro)  
   - [SiteFooter](#sitefooterastro)  
   - [SEO](#seoastro)  
   - [HeadAssets & FontAssets](#headassetsastro--fontassetsastro)  
   - [CookieConsent](#cookieconsentastro)  
   - [ScrollListener](#scrolllistenerastro)  
   - [ContactForm](#contactformastro)  
   - [PostCard](#postcardastro)  
8. [Images & assets](#images--assets)  
9. [Content: Blog collection](#content-blog-collection)  
10. [Duplicate a collection (Blog → Services/Portfolio)](#duplicate-a-collection-blog--servicesportfolio)  
11. [SEO, Sitemap, Robots & RSS](#seo-sitemap-robots--rss)  
12. [Fonts](#fonts)  
13. [Accessibility & performance](#accessibility--performance)  
14. [Clone-for-client checklist](#clone-for-client-checklist)  
15. [Go-live checklist](#go-live-checklist)  
16. [Deploy](#deploy)  
17. [Security headers & CSP](#security-headers--csp)
18. [Maintenance & backporting](#maintenance--backporting)
19. [Troubleshooting](#troubleshooting)
20. [Licence](#licence)

---

## Quick start

This repo uses **npm** by default (`package-lock.json`). If you prefer pnpm or yarn, swap the commands and commit the matching lockfile.

```bash
# 1) Install deps
npm install     # or: pnpm install / yarn

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

**Optional (only if configured):**
- `"lint": "eslint ."` — requires an ESLint config.
- `"test": "vitest"` — if you add tests.

---

## Project structure

```
src/
  components/
    atoms/
      Button.astro
    molecules/
      PostCard.astro
    organisms/
      SiteHeader.astro
      SiteFooter.astro
    utils/
      SEO.astro
      CookieConsent.astro
      ScrollListener.astro
      HeadAssets.astro
      FontAssets.astro
  content/
    blog/
      welcome-to-the-starter.md
    config.ts
  layouts/
    Base.astro
    Minimal.astro
    Article.astro
  lib/
    constants.ts
  pages/
    index.astro
    blog/
      index.astro
      page/[page].astro
      [...slug].astro
    rss.xml.ts
    robots.txt.ts
    404.astro
    500.astro
    style-guide.astro
  styles/
    main.scss
    _tokens.scss
    _theme.scss
    _base.scss
    _typography.scss
    _layout.scss
    _ui.scss
    _utilities.scss
    fonts.css
public/
  fonts/InterVariable.woff2
  fonts/InterVariable-Italic.woff2
  favicon.svg
  icon-192.png
  icon-512.png
  apple-touch-icon.png
  og-default.jpg
  site.webmanifest
.github/workflows/ci.yml
.editorconfig
.nvmrc
```

`styles/main.scss` imports partials in this order:

```
@use "tokens";
@use "theme";
@use "base";
@use "typography";
@use "layout";
@use "ui";
@use "utilities";
```

Page-scoped styles (like `/style-guide`) live in that page’s `<style lang="scss">` block.

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

# Branding / Head assets
PUBLIC_THEME_COLOR="#1d2d44"
PUBLIC_FAVICON="/favicon.svg"
PUBLIC_APPLE_TOUCH_ICON="/apple-touch-icon.png"
PUBLIC_MASK_ICON="/safari-pinned-tab.svg"
PUBLIC_MASK_ICON_COLOR="#000000"
PUBLIC_MANIFEST="/site.webmanifest"        # <— HeadAssets reads this key

# Analytics / Consent
PUBLIC_GTM_ID=""
PUBLIC_CONSENT_VERSION="1"                 # bump when consent text/purposes change

# Optional: override font preloads used by <FontAssets />
# PUBLIC_FONT_PRELOADS="/fonts/InterVariable.woff2,/fonts/InterVariable-Italic.woff2"
```

**Type-safe env (optional):** add `src/env.d.ts` typings for `import.meta.env` keys so your IDE and builds catch mistakes early.

---

## Design system

### Tokens & theme

- **Palette tokens** (`_tokens.scss`): brand colours + neutral ramp  
  `--palette--primary`, `--palette--secondary`, `--palette--tertiary`,  
  `--palette--neutral-50 … --palette--neutral-950`, plus white/black/transparent.

- **Semantic theme tokens** (`_theme.scss`): map palette → roles and support light/dark schemes:
  ```css
  :root {
    --bg-colour: var(--palette--white);
    --heading-colour: var(--palette--neutral-900);
    --text-colour: var(--palette--neutral-600);
    --text-muted: #6f7377;
    --link-colour: var(--palette--primary);
    --link-hover-colour: var(--palette--neutral-900);
    --border-colour: rgba(26,26,26,.15);
    --focus-ring-colour: var(--palette--primary);
  }
  [data-scheme="dark"] {
    --bg-colour: var(--palette--neutral-900);
    --heading-colour: var(--palette--white);
    --text-colour: #e6e6e6;
    --text-muted: #ffffff99;
    --link-colour: var(--palette--primary);
    --link-hover-colour: var(--palette--white);
    --border-colour: rgba(255,255,255,.2);
    --focus-ring-colour: var(--palette--primary);
  }
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

- Header inherits the page scheme by default but can be **forced** per page:
  ```html
  <header class="site-header" data-scheme="light">…</header>
  <header class="site-header" data-scheme="dark">…</header>
  ```
- Transparent over-hero overlay: add `.is-transparent on-dark` to keep links/icons white until the header goes solid.
- “Pin only when solid”: the header hides on scroll down and reappears on scroll up *with* a background; transitions for background/transform are aligned.

---

## Components

### `SiteHeader.astro`

Sticky header with hover dropdowns (desktop) and accessible disclosure submenus (mobile). Independent scheme control via `data-scheme` and overlay helpers. Scroll behavior powered by `ScrollListener` body classes.

### `SiteFooter.astro`

Dark footer with CTA, three link columns, and legal row. Uses scoped footer tokens for contrast and borders.

### `SEO.astro`

Canonical URL generation, Open Graph/Twitter, fallback OG image, optional JSON-LD via `structuredData` prop.

### `HeadAssets.astro` & `FontAssets.astro`

Manifest, favicons, theme colour, and local font preloads. `PUBLIC_MANIFEST` lets you override the manifest path.

### `CookieConsent.astro`

Lightweight banner that **respects GPC** and loads **GTM only after “Accept all”**. Consent Mode v2 signals are queued before GTM. Public API: `window.showCookiePreferences()` to reopen the banner (used by the footer link).

### `ScrollListener.astro`

Adds body classes for scroll direction/idle to coordinate header show/hide.

### `ContactForm.astro`

Unstyled form primitives (Netlify-compatible) with success/error states.

### `PostCard.astro`

Simple blog card example for Content Collections.

---

## Images & assets

- Place static files in `/public`. Reference with absolute paths (`/images/hero.jpg`).  
- In Markdown body, prefer relative images housed next to content entries:
  ```md
  ![Caption](./images/example.jpg)
  ```
- OG default: `/og-default.jpg` (1200×630).  
- PWA/App icons: `/icon-192.png`, `/icon-512.png` (maskable).  
- Manifest: `/site.webmanifest` referencing your icons.

---

## Content: Blog collection

`src/content/config.ts` uses the schema callback. To allow plain string paths for images, change `image()` fields to a union and coerce in pages.

Add a post:

```mdx
---
title: "Hello World"
description: "First post"
publishDate: 2025-01-01
draft: false
---

Welcome to **Astro**!
```

**Pagination** is manual in `/blog/page/[page].astro`, with `POSTS_PER_PAGE` in `src/lib/constants.ts`.

---

## Duplicate a collection (Blog → Services/Portfolio)

Copy the `blog` folder, adjust the schema in `content/config.ts`, and duplicate the list/detail pages. Update routes/links as needed.

---

## SEO, Sitemap, Robots & RSS

- Sitemap via `@astrojs/sitemap` with `site` set from `PUBLIC_SITE_URL` in `astro.config.mjs`.
- Robots at `/robots.txt` respects `INDEXING` and emits absolute sitemap URLs.
- RSS via `@astrojs/rss` at `/rss.xml` (remove file to disable).

---

## Fonts

Self-hosted variable **Inter** (regular + italic) with preloads. Update `fonts.css` and `/public/fonts` as you change families/weights.

---

## Accessibility & performance

- Skip link to `#main`  
- Keyboard-operable nav + dropdowns; focus rings visible and tokenised  
- `prefers-reduced-motion` respected  
- Images: `loading="lazy"`, `decoding="async"`, meaningful `alt`  
- Lean components and no heavy global imports

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

## Troubleshooting

- **Horizontal scroll on mobile**  
  Ensure `.content-layout` collapses to `1fr` at ≤767px, and that grid children have `min-width: 0`. The style guide includes those guards.

- **Content image import errors**  
  Don’t point `image()` fields to absolute `/public` paths. Use relative images under `src/content/...` or omit and rely on fallbacks.

- **Staging gets indexed**  
  Set `INDEXING=false` in staging env; verify `/robots.txt` shows `Disallow: /`.

- **Canonical/OG URLs wrong**  
  Set `PUBLIC_SITE_URL` and keep `astro.config.mjs` `site` reading from it.

- **GTM loads before consent**  
  CookieConsent only injects GTM after “Accept all”. Ensure `PUBLIC_GTM_ID` is set and bump `PUBLIC_CONSENT_VERSION` if you change wording/purposes.

---

## Licence

MIT by default (replace with your preference).
