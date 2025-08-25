import { defineCollection, z } from 'astro:content';

/**
 * Content Collections schema
 * - case-studies: drives /work and /services selections
 * - insights: drives /insights
 *
 * Notes:
 * - We use explicit `slug` to keep URLs stable even if filenames change.
 * - `heroAlt` is required for accessibility.
 * - `displayServices` are decorative; deep-links are resolved via a Service Anchor Map during render.
 */

const CategoryEnum = z.enum(['Strategy', 'Design', 'Development', 'Growth']);
const LayoutHintEnum = z.enum(['text', 'text+gallery', 'full-bleed']);

const caseStudies = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),

      // Images are real ImageMetadata (AstroImage only; no fallbacks)
      hero: image(),
      heroAlt: z.string().default(''),

      // Dates are real Dates everywhere
      completedDate: z.coerce.date(),

      displayServices: z.array(z.string()).default([]),

      // Canonical external link
      siteUrl: z.string().url().optional(),

      // Case study “rich sections”
      sections: z
        .array(z.object({ title: z.string(), prose: z.string() }))
        .default([]),

      // Simple gallery rows; first image per row for now
      galleries: z
        .array(
          z.object({
            images: z.array(
              z.object({
                src: image(),
                alt: z.string().optional(),
              })
            ),
          })
        )
        .default([]),

      expertiseCategories: z
        .array(z.enum(['Strategy', 'Design', 'Development', 'Growth']))
        .default([]),
      highlightInExpertise: z
        .array(z.enum(['Strategy', 'Design', 'Development', 'Growth']))
        .default([]),
      highlightPriority: z.number().optional(),
      workFilterCategory: z.enum(['Strategy', 'Design', 'Development', 'Growth']),

      internalTags: z.array(z.string()).default([]),
      ogImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const insights = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(160),
      date: z.coerce.date(),
      hero: image(),
      heroAlt: z.string().optional().default(''),
      tags: z.array(z.string()).default([]), // internal-only; no routes
      ogImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = {
  'case-studies': caseStudies,
  insights,
};
