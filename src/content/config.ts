import { defineCollection, z } from 'astro:content';

/* =============================================================================
   Site settings (data)
============================================================================= */
const site = defineCollection({
  type: 'data',
  schema: z.object({
    siteName: z.string(),
    defaultDescription: z.string(),
    defaultOgImage: z.string().optional(), // absolute or /path
    twitterHandle: z.string().optional(),  // e.g. '@leesanter'
    brandLogoPath: z.string().optional(),  // e.g. '/src/assets/brand/logo.svg'
    // Optional fallback; prefer env PUBLIC_SITE_URL at runtime:
    siteUrl: z.string().url().optional(),
  }),
});

/* =============================================================================
   Shared enums
============================================================================= */
const CATEGORIES = z.enum(['Strategy', 'Design', 'Development', 'Growth']);

/* =============================================================================
   Services (unified)
   - ONE collection for BOTH:
     • kind: 'category'  → category hub (Design/Strategy/Development/Growth)
     • kind: 'service'   → sub-service sections (anchors on the hub page)
   - Long-form prose should live in the MD/MDX body (entry.body).
   - NOTE: In Astro v5 the schema callback only provides { image }.
============================================================================= */
const services = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      /** Discriminator */
      kind: z.enum(['service', 'category']).default('service'),

      /** Shared */
      title: z.string(),
      category: CATEGORIES,
      order: z.number().int().nonnegative().default(999),
      draft: z.boolean().default(false),

      /** Sub-service fields (kind === 'service') */
      anchor: z.string().optional(),           // defaults to filename if omitted
      intro: z.string().optional(),
      // Keep for migration convenience; prefer MDX body going forward:
      body: z.string().optional(),
      outcomes: z.array(z.string()).default([]),
      deliverables: z.array(z.string()).default([]),

      /** Category overview fields (kind === 'category') */
      summary: z.string().optional(),          // short blurb (Home cards + /services tiles)
      featuredImage: image().optional(),
      featuredAlt: z.string().default(''),
      featuredWorkSlug: z.string().optional(), // optional explicit case study to feature
      faqs: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          }),
        )
        .default([]),

      /** Optional SEO overrides (page can pass these into <SEO/>) */
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
});

/* =============================================================================
   Work (case studies)
   - serviceCategory drives /work filters
   - services holds sub-service keys (filenames) for deep-link mapping to anchors
   - testimonials: ARRAY ONLY (no legacy single object)
============================================================================= */
const work = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),

      // Card/hero image (one source used in both places)
      featuredImage: image(),
      featuredAlt: z.string(),

      // Filtering + mapping
      serviceCategories: z.array(CATEGORIES).min(1),             // for /work filter only
      services: z.array(z.string()).default([]), // sub-service keys (filenames)

      // Meta
      siteUrl: z.string().url().optional(),
      completedDate: z.coerce.date(),

      // Home featuring
      featuredHome: z.boolean().default(false),
      featureWeight: z.number().int().min(0).max(100).default(999), // lower = higher priority

      // High-level intro (lives next to meta)
      overviewTitle: z.string().default('Project Overview'),
      overview: z.string().optional(), // Markdown; falls back to summary when absent

      // Control where gallery goes (instead of forced interleave)
      galleryPlacement: z.enum(['interleave', 'before', 'after']).default('interleave'),

      // Rich sections (alternating text/media)
      sections: z
        .array(
          z.object({
            title: z.string(),
            /** Write Markdown here; we'll render it */
            body: z.string(),
            image: image().optional(),
            imageAlt: z.string().optional(),
            imageAlign: z.enum(['left', 'right', 'full']).default('right'),
          }),
        )
        .default([]),

      /** Decoupled gallery for standalone images between sections */
      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string().default(''),
            caption: z.string().optional(), // unused now; nice to have later
          }),
        )
        .default([]),

      // Testimonials: array-only
      testimonials: z
        .array(
          z.object({
            quote: z.string(),
            personName: z.string(),
            role: z.string().optional(),
            company: z.string().optional(),
          }),
        )
        .default([]),

      // Open Graph
      ogImage: image().optional(),

      draft: z.boolean().default(false),
    }),
});

/* =============================================================================
   Insights (blog)
============================================================================= */
const insights = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      featuredImage: image().optional(),
      featuredAlt: z.string().optional(),
      author: z.string().default('Lee Santer'),
      tags: z.array(z.string()).default([]), // decorative; no /tags routes (for now)
      ogImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { site, services, work, insights };
