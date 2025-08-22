# PR Checklist — Content · Performance · A11y · SEO (v1)

> Paste this at the top of every PR. Tick what you’ve verified. If something is **N/A**, explain why.

## PR Meta
- [ ] **Summary:** What does this PR change and why?
- [ ] **Scope:** New pages/routes? Schema changes? Any breaking changes?
- [ ] **Screenshots/recordings:** Before/after for UI, plus Lighthouse or WebPageTest summary if perf-related.
- [ ] **Issue/Task link:** Jot the reference (if any).

---

## 1) Content & Structure
- [ ] **IA/Routes match locks:** Paths follow `/work`, `/insights`, `/services`, and subpages layout; no `/tags/*` routes.
- [ ] **Case studies:** `title`, `slug`, `summary (≤160)`, `hero (+alt)`, `completedDate`, `displayServices[]`, `expertiseCategories[]`, `workFilterCategory` all present.
- [ ] **Sections:** At least 1 section with `title` + `prose`; galleries optional.
- [ ] **Services hub:** No per-category case studies on `/services` (unless library ≥ 8). Optional single **Featured case study** only.
- [ ] **Service subpages:** Include one **Selected project** chosen by deterministic rules.
- [ ] **Service Anchor Map:** Any linked display services are mapped to stable anchors; unmapped labels render as plain text.
- [ ] **Slugs:** Lowercase kebab, stable; redirects added if any were changed.
- [ ] **Copy standards:** UK English, outcome-led; avoid tool names in headings (mention in body).

**Notes:**

---

## 2) Performance (mobile-focused budget)
- [ ] **LCP target:** ≤ **1.8s** on a mid-tier mobile profile (lab test acceptable for PR).
- [ ] **CLS:** < **0.05** (no layout shifts; width/height set on images).
- [ ] **JS budget:** ≤ **80 KB** gz per page (approximate bundle check).
- [ ] **CSS budget:** ≤ **50 KB** per page.
- [ ] **Fonts:** WOFF2 only; ≤ **2** files total; only one preloaded.
- [ ] **Images:** Local assets preferred; responsive sizes; hero eagerly loaded only if it’s the LCP; lazy elsewhere.
- [ ] **No inline transforms** for motion; use class toggles.

**Notes:**

---

## 3) Accessibility
- [ ] **Keyboard:** All interactive elements reachable and operable; no traps.
- [ ] **Focus:** Visible focus states; skip-to-content link present.
- [ ] **Headings:** Hierarchical, no jumps.
- [ ] **Colour contrast:** AA minimum for text & UI elements.
- [ ] **Alt text:** Descriptive alt on meaningful images; decorative images use empty alt.
- [ ] **Motion:** Respects `prefers-reduced-motion`; reveal/scroll effects are subdued when reduced.

**Notes:**

---

## 4) SEO & Metadata
- [ ] **Titles:** `Page Title — Lee Santer` format (subpages of Services: `{Category} Services — Lee Santer`).
- [ ] **Meta descriptions:** ≤160 chars; benefit-led; unique per page.
- [ ] **Canonical:** Built from `PUBLIC_SITE_URL` + path.
- [ ] **Robots/Sitemap:** Correct per env (`PUBLIC_NOINDEX_ALL` on staging).
- [ ] **JSON-LD:** `Person` site-wide; `Article` for Insights; `CreativeWork` for case studies; `Service` for services pages; `FAQPage` where FAQs exist.
- [ ] **Open Graph/Twitter:** Default OG in place; per-page overrides where provided.

**Notes:**

---

## 5) Motion & Behaviour
- [ ] **IntersectionObserver:** Single IO instance toggles `.is-inview` on opt-in elements.
- [ ] **Header behaviour:** Body classes (`site-scroll--up/down/active/inactive`) used; no layout thrash.
- [ ] **No bespoke per-component observers** added.

**Notes:**

---

## 6) Services & Work integration
- [ ] **Work filter chips:** All/Strategy/Design/Development/Growth work as radio filters (server-rendered).
- [ ] **Selected project (subpages):** Deterministic selection holds (highlight → priority → recency).
- [ ] **Featured case on hub (optional):** Only one; selected via config or fallback logic.
- [ ] **Highlight editorial rule:** At most one highlight category per project in practice.

**Notes:**

---

## 7) Security, Privacy & Env
- [ ] **Security headers:** HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy present (deploy config).
- [ ] **CSP:** Report-Only in place or explicitly deferred.
- [ ] **Consent/analytics:** Disabled by default; IDs only set in production env.
- [ ] **ENV:** `PUBLIC_SITE_URL` set locally/preview/prod as needed.

**Notes:**

---

## 8) Testing
- [ ] **Responsive:** Layout verified at 360, 768, 1024, 1280 widths.
- [ ] **Browsers:** Chrome, Safari, Firefox smoke tests.
- [ ] **Assistive tech (spot check):** Keyboard-only nav + VoiceOver/NVDA quick pass.
- [ ] **404/Empty states:** Present and tasteful (e.g., no Selected project yet).

**Notes:**

---

## Reviewer sign-off
- [ ] I confirm this PR meets the gates above or deviations are justified.
- **Reviewer:** ____________________   **Date:** ___________

