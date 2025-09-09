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
import { CATEGORY_KEYS } from '../lib/categories';
const CATEGORIES = z.enum(CATEGORY_KEYS);

/* =============================================================================
   Services (unified)
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
      anchor: z.string().optional(),
      intro: z.string().optional(),
      // Prefer MD/MDX body going forward:
      body: z.string().optional(),
      outcomes: z.array(z.string()).default([]),
      deliverables: z.array(z.string()).default([]),

      /** Category overview fields (kind === 'category') */
      summary: z.string().optional(),          // short blurb for tiles/cards
      featuredImage: image().optional(),
      featuredAlt: z.string().default(''),
      featuredWorkSlug: z.string().optional(),
      faqs: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(), // HTML-safe; we’ll render as text in JSON-LD
          }),
        )
        .optional(),
    }),
});

/* =============================================================================
   Work (case studies)
   - `description` replaces legacy `summary` (kept as fallback).
   - Optional `seoTitle` / `seoDescription` for fine-grained control.
============================================================================= */
const work = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),

        // SEO overrides (optional)
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),

        // NEW primary description for cards/SEO; legacy kept as fallback.
        description: z.string().optional(),
        summary: z.string().optional(), // deprecated; migrate to `description`

        // Card/hero image (one source used in both places)
        featuredImage: image(),
        featuredAlt: z.string(),

        // Filtering + mapping
        serviceCategories: z.array(CATEGORIES).default([]),
        services: z.array(z.string()).default([]), // sub-service keys (filenames)

        // Meta
        siteUrl: z.string().url().optional(),
        completedDate: z.coerce.date(),

        // Home featuring
        featuredHome: z.boolean().default(false),
        featureWeight: z.number().int().min(0).max(100).default(999),

        // High-level intro (lives next to meta)
        overviewTitle: z.string().default('Project Overview'),
        overview: z.string().optional(), // Markdown; falls back to description when absent

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
              caption: z.string().optional(),
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
      })
      .transform((data) => ({
        ...data,
        // Always expose a `description` value at runtime
        description: data.description ?? data.summary ?? '',
        // Keep `overview` fallback aligned to description (not legacy summary)
        overview: data.overview ?? data.description ?? data.summary ?? undefined,
      })),
});

/* =============================================================================
   Insights (blog)
   - `description` replaces legacy `summary` (kept as fallback).
   - Optional `seoTitle` / `seoDescription`.
============================================================================= */
const insights = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),

        // SEO overrides (optional)
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),

        description: z.string().optional(),
        summary: z.string().optional(), // deprecated; migrate to `description`

        date: z.coerce.date(),
        featuredImage: image().optional(),
        featuredAlt: z.string().optional(),
        author: z.string().default('Lee Santer'),
        tags: z.array(z.string()).default([]), // decorative; no /tags routes (for now)
        ogImage: image().optional(),
        draft: z.boolean().default(false),
      })
      .transform((data) => ({
        ...data,
        // Normalize description shape at runtime
        description: data.description ?? data.summary ?? '',
      })),
});

export const collections = { site, services, work, insights };
