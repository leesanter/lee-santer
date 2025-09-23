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
   - kind: 'category' (Design / Dev / …) OR 'service' (sub-service)
   - Category docs drive the /services bands + home tiles (no detail page)
   - Sub-service docs can “graduate” to a lander via `landerSlug`
============================================================================= */
const services = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        /** Discriminator */
        kind: z.enum(['service', 'category']).default('service'),

        /** Shared */
        title: z.string(),                // generic title (used everywhere)
        category: CATEGORIES,             // Strategy | Design | Development | Growth
        order: z.number().int().nonnegative().default(999),
        draft: z.boolean().default(false),

        /* ---------- Sub-service (kind === 'service') ---------- */
        anchor: z.string().optional(),    // fallback: filename
        /** Short blurb shown on /services accordion (was `intro`) */
        overviewShort: z.string().optional(),
        /** Legacy alias, migrated → overviewShort */
        intro: z.string().optional(),

        /** Optional free-form long copy (unused on /services) */
        body: z.string().optional(),

        /** Lander route, e.g. /services/custom-website-development */
        landerSlug: z.string().optional(),

        /** SEO overrides for the lander page */
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        ogImage: image().optional(),

        /** Lander view-model (used only when landerSlug is present) */
        lander: z
          .object({
            intro: z
              .object({
                title: z.string().optional(),       // defaults to entry.title
                standfirst: z.string().optional(),  // hero paragraph
                scheme: z.enum(['light', 'dark']).optional(),
                actions: z
                  .array(
                    z.object({
                      label: z.string(),
                      href: z.string(),
                      variant: z.enum(['primary', 'outline', 'text']).default('primary'),
                    }),
                  )
                  .default([]),
              })
              .default({}),

            caseStudies: z
              .object({
                slugs: z.array(z.string()).default([]),   // ['forma', 'northbase']
                columns: z.number().int().min(1).max(3).default(3),
                showServices: z.boolean().default(false),
              })
              .default({ slugs: [] as string[], columns: 3, showServices: false }),

            blurbs: z
              .array(z.object({ title: z.string(), text: z.string() }))
              .default([]),

            /** Image is optional; title+text are required */
            keyServices: z
              .array(
                z.object({
                  title: z.string(),
                  text: z.string().optional(),
                  image: image().optional(),
                  alt: z.string().default(''),
                }),
              )
              .default([]),

            process: z
              .array(z.object({ title: z.string(), text: z.string().optional() }))
              .default([]),

            faqs: z
              .array(z.object({ q: z.string(), a: z.string() }))
              .default([]),
          })
          .optional(),

        /* ---------- Category overview (kind === 'category') ---------- */
        /** Home tile/slider blurb (replaces legacy `summary`) */
        homeOverview: z.string().optional(),

        /** /services band: subtitle (short line) */
        servicesSubtitle: z.string().optional(),
        /** /services band: short paragraph */
        servicesOverview: z.string().optional(),

        /** Optional art + featured case study for the band */
        featuredImage: image().optional(),
        featuredAlt: z.string().default(''),
        featuredWorkSlug: z.string().optional(),
        /** Optional per-band scheme override */
        bandScheme: z.enum(['light', 'dark']).optional(),

        /** Rarely used now; kept for back-compat (ignored on /services) */
        faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),

        /* ---------- Back-compat fields (will be migrated away) ---------- */
        summary: z.string().optional(), // legacy for category tiles
        // outcomes / deliverables deprecated (no longer used)
      })
      .transform((data) => {
        const d: any = { ...data };

        // Category legacy: summary → homeOverview
        if (d.kind === 'category') {
          if (d.summary && !d.homeOverview) d.homeOverview = d.summary;
        }

        // Sub-service legacy: intro → overviewShort
        if (d.kind === 'service') {
          if (d.intro && !d.overviewShort) d.overviewShort = d.intro;
        }

        return d;
      }),
});

/* =============================================================================
   Work (case studies)
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

        // NEW preferred summary
        description: z.string().optional(),
        summary: z.string().optional(), // legacy

        // Card/hero image
        featuredImage: image(),
        featuredAlt: z.string(),

        serviceCategories: z.array(CATEGORIES).default([]),
        services: z.array(z.string()).default([]),

        siteUrl: z.string().url().optional(),
        completedDate: z.coerce.date(),

        featuredHome: z.boolean().default(false),
        featureWeight: z.number().int().min(0).max(100).default(999),

        overviewTitle: z.string().default('Project Overview'),
        overview: z.string().optional(),

        galleryPlacement: z.enum(['interleave', 'before', 'after']).default('interleave'),

        sections: z
          .array(
            z.object({
              title: z.string(),
              body: z.string(),
              image: image().optional(),
              imageAlt: z.string().optional(),
              imageAlign: z.enum(['left', 'right', 'full']).default('right'),
            }),
          )
          .default([]),

        gallery: z
          .array(
            z.object({
              src: image(),
              alt: z.string().default(''),
              caption: z.string().optional(),
            }),
          )
          .default([]),

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

        ogImage: image().optional(),
        draft: z.boolean().default(false),
      })
      .transform((data) => {
        const description = data.description ?? data.summary ?? '';
        if (process.env.NODE_ENV !== 'production' && !data.description && data.summary) {
          console.warn('[content:work] Using legacy "summary"; consider renaming to "description" in', data.title);
        }
        return {
          ...data,
          description,
          overview: data.overview ?? description ?? undefined,
        };
      }),
});

/* =============================================================================
   Insights (blog)
============================================================================= */
const insights = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        description: z.string().optional(),
        summary: z.string().optional(),
        date: z.coerce.date(),
        featuredImage: image().optional(),
        featuredAlt: z.string().optional(),
        author: z.string().default('Lee Santer'),
        tags: z.array(z.string()).default([]),
        ogImage: image().optional(),
        draft: z.boolean().default(false),
      })
      .transform((data) => {
        const description = data.description ?? data.summary ?? '';
        if (process.env.NODE_ENV !== 'production' && !data.description && data.summary) {
          console.warn('[content:insights] Using legacy "summary"; consider renaming to "description" in', data.title);
        }
        return { ...data, description };
      }),
});

export const collections = { site, services, work, insights };
