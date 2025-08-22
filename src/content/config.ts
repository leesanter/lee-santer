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
      summary: z.string().max(160, 'Keep summaries ≤160 characters'),
      hero: image(),
      heroAlt: z.string().min(2, 'Provide meaningful alt text for the hero image'),
      completedDate: z.coerce.date(),
      displayServices: z.array(z.string()).min(1),
      siteUrl: z.string().url().optional(),
      sections: z
        .array(
          z.object({
            title: z.string(),
            prose: z.string(), // short markdown/MDX prose
            gallery: z.array(image()).optional(),
            layoutHint: LayoutHintEnum.optional(),
          }),
        )
        .min(1),
      metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      galleryTop: z.array(image()).optional(),
      ogImage: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      expertiseCategories: z.array(CategoryEnum).min(1).max(3),
      highlightInExpertise: z.array(CategoryEnum).default([]),
      highlightPriority: z.number().int().positive().default(999),
      workFilterCategory: CategoryEnum,
      internalTags: z.array(z.string()).default([]),
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
