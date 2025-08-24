import { defineCollection, z, image } from 'astro:content';

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
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    // 🔒 image metadata (AstroImage only)
    hero: image(),
    heroAlt: z.string().default(''),
    completedDate: z.string(), // or z.date().transform(...) if you prefer
    displayServices: z.array(z.string()).default([]),

    // ✅ canonical field name
    siteUrl: z.string().url().optional(),

    sections: z
      .array(
        z.object({
          title: z.string(),
          prose: z.string(), // markdown string
        })
      )
      .default([]),

    // 🔒 gallery images as image()
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

    expertiseCategories: z.enum(['Strategy', 'Design', 'Development', 'Growth']).array().default([]),
    highlightInExpertise: z.enum(['Strategy', 'Design', 'Development', 'Growth']).array().default([]),
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
