import { defineCollection, z } from 'astro:content';

const site = defineCollection({
  type: 'data',
  schema: z.object({
    siteName: z.string(),
    defaultDescription: z.string(),
    defaultOgImage: z.string().optional(), // absolute or /path
    twitterHandle: z.string().optional(),  // e.g. '@leesanter'
    brandLogoPath: z.string().optional(),  // e.g. '/src/assets/brand/logo.svg'
    // Optional: keep if you really want it here (env should still win):
    siteUrl: z.string().url().optional(),
  }),
});

const CATEGORIES = z.enum(['Strategy', 'Design', 'Development', 'Growth']);
const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: CATEGORIES,
    anchor: z.string().optional(),           // defaults to file slug (serviceKey)
    intro: z.string().optional(),
    body: z.string().optional(),
    outcomes: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).optional(),
    order: z.number().int().nonnegative().default(999),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    featuredImage: image(),
    featuredAlt: z.string(),
    serviceCategory: CATEGORIES,             // for /work filter only
    services: z.array(z.string()).default([]), // serviceKeys (filenames)
    siteUrl: z.string().url().optional(),
    completedDate: z.coerce.date(),
    featuredHome: z.boolean().default(false),
    featureWeight: z.number().optional(),
    sections: z.array(z.object({
      title: z.string(),
      body: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageAlign: z.enum(['left','right','full']).default('right'),
    })).default([]),
    gallery: z.array(image()).optional(),
    testimonial: z.object({
      quote: z.string(),
      personName: z.string(),
      role: z.string().optional(),
      company: z.string().optional(),
    }).optional(),
    ogImage: image().optional(),
    draft: z.boolean().default(false),
  }),
});

const insights = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    featuredImage: image().optional(),
    featuredAlt: z.string().optional(),
    author: z.string().default('Lee Santer'),
    tags: z.array(z.string()).default([]),
    ogImage: image().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { site, services, work, insights };
