# Service Anchor Map (v1, locked)

**Purpose:** Provide a single source of truth for deep-links from case studies’ “display services” to the correct section on each **/services/{category}** page. Keeps links stable, avoids 404s, and lets you change wording without breaking anchors.

## Naming rules (anchors)
- Lowercase; hyphenated; no punctuation (except hyphens).
- Anchors must exist as visible H2/H3 headings on the destination page.
- Once live, anchors are **stable**. If you rename a section, leave the old anchor id in place as an alias for at least one release.

---

## Canonical list (labels → category + anchor)

### Strategy — `/services/strategy`
- **Brand Positioning & Messaging** → `#brand-positioning-and-messaging`
- **Content Strategy & Planning** → `#content-strategy-and-planning`
- **Information Architecture** → `#information-architecture`
- *(Reserved)* **Market Research & Analysis** → `#market-research-and-analysis`

### Design — `/services/design`
- **Brand & Identity Design** → `#brand-and-identity-design`
- **User Interface Design** → `#user-interface-design`
- **User Experience Design** → `#user-experience-design`
- *(Reserved)* **Design Systems** → `#design-systems`
- *(Reserved)* **Prototyping & Usability Testing** → `#prototyping-and-usability-testing`

### Development — `/services/development`
- **Custom Website Development** → `#custom-website-development`  
  *Public label; copy mentions Astro as the primary tool.*
- **Webflow Implementations** → `#webflow-implementations`
- **WordPress (existing sites)** → `#wordpress-existing-sites`
- **Shopify Builds** → `#shopify-builds`
- *(Reserved)* **Performance & Core Web Vitals** → `#performance-and-core-web-vitals`
- *(Reserved)* **Accessibility (Development)** → `#accessibility-development`
- *(Reserved)* **CMS & Content Modelling** → `#cms-and-content-modelling`

### Growth — `/services/growth`
- **Maintenance & Support** → `#maintenance-and-support`
- **Conversion Rate Optimisation** → `#conversion-rate-optimisation`
- **Analytics & Measurement** → `#analytics-and-measurement`
- **Digital Strategy** → `#digital-strategy`
- *(Reserved)* **A/B Testing & Experimentation** → `#ab-testing-and-experimentation`

---

## Mapping rules
- **Case study display services**: For each string in a case study’s “display services” list, if the label appears in this map, link to `/services/{category}#{anchor}`.
- **Unmapped items**: Render as plain text (no link) to avoid broken anchors.
- **Editorial**: Prefer outcome-oriented labels here; tool names (e.g., Astro) live in the destination page copy.

---

## Change process
- **Add**: Add a new label+anchor here *and* add a matching heading on the destination service page.
- **Rename**: Add the new label/anchor, keep the old anchor in the page (as a hidden or secondary id) for one release.
- **Remove**: Only remove labels/anchors when no live case study points to them.
- **QA**: When publishing a new or edited case study, quickly check that each linked display service resolves to a real anchor on the target page.

---

## Example mappings
- “Content Strategy & Planning” → `/services/strategy#content-strategy-and-planning`
- “User Interface Design” → `/services/design#user-interface-design`
- “Webflow” → `/services/development#webflow-implementations`
- “Custom Website Development” (if used in display) → `/services/development#custom-website-development`
