# Services (a.k.a. “Expertise”) — structure & SEO (v1.1)

**Nav label:** “Expertise”  
**Primary route:** `/services`  
**301:** `/expertise` → `/services`  
**Subpages:** `/services/strategy`, `/services/design`, `/services/development`, `/services/growth`  
**No tag pages:** `/tags/*` will not be generated.

---

## Page purposes
- **/services (hub):** Positioning + routing + proof (light). Orients the visitor, explains outcomes, and routes them to the right subpage.  
- **/services/{category} (subpages):** Depth. Outcomes, process, deliverables, selected project, and FAQs per category.

---

## `/services` (hub) — required sections
1) **H1 + value proposition** — who you help, what outcomes you create, your edge.  
2) **Who I’m a fit for** — short bullets; filters the right clients in.  
3) **Service tiles** — 4 cards (Strategy, Design, Development, Growth) with blurbs + CTAs to subpages.  
4) **How I work (snapshot)** — 4–6 steps, single-line each (long form lives on subpages).  
5) **Proof** — client logos or 1–2 short testimonials.  
6) **Global FAQs** — common objections (pricing, stack choice, performance & a11y, availability).  
7) **Primary CTA** — book a chat or email.

### Optional (hub): single **Featured case study**
- Show **at most one** project on the hub as a hero/micro card to break up content.  
- No per-category case studies on the hub while the library is small.  
- **Selection (in order):**
  1) Explicit config value (e.g. `servicesHubFeature` = case study slug), else  
  2) Case study with the **lowest `highlightPriority`** across all categories (i.e. your “best”), tie-break by most recent `completedDate`.  
- Must be non-draft, have a hero image, and a summary.  
- It’s acceptable if this project also appears on a service subpage as that category’s selected project.

**SEO (hub):**
- Title: `Services — Lee Santer`  
- Meta description: ≤160 chars; outcome-oriented  
- JSON-LD: `Service` (aggregate) + `FAQPage` if FAQs present  
- Internal links: to each subpage, to `/work`, and (if shown) to the Featured case study

---

## `/services/{category}` — required sections
- **H1 + outcome-focused intro** (avoid tool jargon in the headline)  
- **Problems I solve** (bullet list)  
- **Approach** (3–5 steps; concise)  
- **Deliverables** (clear bullets; plain English)  
- **Selected project** (auto-selected; see logic below)  
- **Category-specific FAQs** (3–5)  
- **CTA**

**Content depth target:** ~600–900 words + at least one visual.

**SEO (subpages):**
- Title: `{Category} Services — Lee Santer`  
- Meta description: ≤160 chars, benefits-led  
- JSON-LD: `Service` (category) + `FAQPage` if FAQs present  
- Canonical: the subpage URL itself

---

## “Selected project” selection logic (deterministic for subpages)
For each category page (Strategy/Design/Development/Growth):
1) Consider case studies whose **Expertise categories** include this category.  
2) If any of those are marked in **Highlight-in-Expertise** for this category, choose the one with the **lowest highlight priority**; if tied, choose the most recent **completed date**.  
3) If none are marked for highlight, choose the most recent **completed date** among the eligible studies.  
4) If no eligible studies exist, show a tasteful empty state (“Case study coming soon”) and a CTA.

**Editorial rule:** Do not hardcode project picks on service pages; they must come from case study data so the site stays in sync.

---

## Work index integration
- `/work` shows a chip filter: **All, Strategy, Design, Development, Growth**.  
- Each case study carries a **Work filter category** (single enum) that drives visibility under these chips.  
- This is independent of “display services” (which are descriptive only).

---

## Accessibility & performance gates (apply to hub + subpages)
- Headings hierarchical; skip-to-content link present.  
- Focus visible; keyboard navigable.  
- Colour contrast AA minimum.  
- `prefers-reduced-motion` respected; motion purely class-driven.  
- LCP ≤ 1.8s on mid-tier mobile; CLS < 0.05.  
- Fonts: WOFF2 only; ≤2 files; preload only what’s critical.

---

## FAQs — starter copy (edit tone later)

**Global (hub)**
- *How do you price projects?* Fixed price for defined briefs; day rate for explorations or retainers. Clear milestones; no surprise fees.  
- *Which platform is right for me?* Custom (primarily Astro) for performance/control; Webflow for editor access; WordPress for existing estates; Shopify for ecommerce. I’ll recommend the right fit.  
- *Can you work with our existing brand/site?* Yes. I improve clarity, performance and accessibility without a risky rebuild.  
- *Performance & accessibility?* Non-negotiable. I target AA and an LCP ≤ 1.8s.  
- *Availability?* Typical lead time 1–3 weeks; small retainers available.

**Strategy**
- *What’s the output of a strategy engagement?* Clear positioning, IA, a content plan, and a prioritised delivery roadmap.  
- *Do we need strategy if we already have copy?* Usually. Structure and priorities change outcomes more than extra words.

**Design**
- *Do you design systems?* Yes—token-first, lightweight components appropriate to your scale.  
- *Can you iterate on our current UI?* Absolutely; typography, spacing and states tightened without a full rebrand.

**Development**
- *Custom Website Development vs Webflow?* Custom (primarily Astro) for performance and control; Webflow for speed and in-house editing. We’ll choose based on your constraints.  
- *Will we be able to edit content?* Yes—options from simple CMS to hand-off docs, depending on stack.

**Growth**
- *What’s in a maintenance retainer?* Updates, small improvements, monitoring and a monthly report.  
- *Do you run CRO experiments?* Yes—low-risk tests tied to specific goals.

---

## Editorial standards (so pages read consistently)
- UK English; plain language; outcome-led.  
- Avoid tool names in headings; mention tech in body copy.  
- Each page has a single primary CTA (avoid decision paralysis).  
- Subpages should not duplicate the hub intro; each must earn its existence.

---

## Decision log (v1.1)
- Nav label “Expertise”; `/services` route; 301 `/expertise` → `/services`.  
- **No per-category case studies on the hub** while the library is small. Optional **single Featured case study** is allowed.  
- No public tag pages.  
- Case study “display services” may deep-link to sub-service anchors via the **Service Anchor Map**.  
- **Custom Website Development** replaces “Astro Front-end Builds” (anchor `#custom-website-development`).  
- Deterministic “Selected project” logic governed by case study metadata, not hardcoded.
