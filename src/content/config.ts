/* ======================================================================
   src/content/config.ts — Astro Content Collections
   - Defines a "blog" collection using Zod schemas (via astro:content)
   - Fields: title, description, publishDate, updatedDate?, heroImage?,
             tags[], draft (default false), ogImage?, canonical?
   - MD files go in /src/content/blog/*.md
   - Use `getCollection("blog")` and `getEntry("blog", slug)` in pages
====================================================================== */
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      publishDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.union([image(), z.string()]).optional(),
      ogImage: z.union([image(), z.string()]).optional(),
      canonical: z.string().url().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { blog };
