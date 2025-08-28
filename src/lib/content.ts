import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

/* ============================================================================
   Site Settings
   ---------------------------------------------------------------------------
   - Versioned defaults for brand/SEO; env still wins for site URL & robots.
============================================================================ */

export type SiteSettings = {
  siteName: string;
  defaultDescription: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  brandLogoPath?: string;
  siteUrl?: string; // optional fallback; ENV should win
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const entry = await getEntry('site', 'settings');
  return entry?.data ?? null;
}

/* ============================================================================
   Shared types & helpers
============================================================================ */

export type ServiceEntry = CollectionEntry<'services'>;
export type WorkEntry    = CollectionEntry<'work'>;
export type PostEntry    = CollectionEntry<'insights'>;

/** Items that carry either completedDate (work) or date (posts). */
type WithDates = { data: { completedDate?: Date; date?: Date } };

/** Sort newest → oldest. Works for Work (completedDate) and Posts (date). */
export const byDateDesc = <T extends WithDates>(a: T, b: T) => {
  const ta = a.data.completedDate?.getTime?.() ?? a.data.date!.getTime();
  const tb = b.data.completedDate?.getTime?.() ?? b.data.date!.getTime();
  return tb - ta;
};

/** Next/prev in a circular list by slug (assumes caller passes a stable order). */
export function nextPrev<T extends { slug: string }>(items: T[], currentSlug: string) {
  const list = [...items];
  const idx = list.findIndex((x) => x.slug === currentSlug);
  if (idx < 0) return { next: null as T | null, prev: null as T | null };
  const next = list[(idx + 1) % list.length] ?? null;
  const prev = list[(idx - 1 + list.length) % list.length] ?? null;
  return { next, prev };
}

/* ============================================================================
   Services
   ---------------------------------------------------------------------------
   - Sorted by front-matter `order`
   - mapServiceKeysToLinks: converts your work.services keys → label + deep link
============================================================================ */

export async function getAllServices(): Promise<ServiceEntry[]> {
  const all = await getCollection('services', (s) => !s.data.draft);
  return all.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

/**
 * Map service keys (filenames in /content/services/{category}/{key}.md)
 * to {label, href} where href deep-links to: /services/{category}#{anchor}
 *
 * Unknown keys are kept with a null href and a console.warn in dev.
 */
export async function mapServiceKeysToLinks(keys: string[]) {
  const services = await getAllServices();
  // index by filename (last slug segment) → entry
  const idx = new Map(services.map((s) => [s.slug.split('/').pop()!, s]));
  return keys.map((key) => {
    const svc = idx.get(key);
    if (!svc) {
      if (import.meta.env.DEV) {
        console.warn(`[work] Unknown serviceKey "${key}" — link skipped`);
      }
      return { key, label: key, href: null as string | null };
    }
    const category = String(svc.data.category).toLowerCase();
    const anchor = svc.data.anchor ?? key;
    return { key, label: svc.data.title, href: `/services/${category}#${anchor}` };
  });
}

/* ============================================================================
   Work (Case Studies)
   ---------------------------------------------------------------------------
   - Sorted newest → oldest
   - Home selection: featured first (by featureWeight, lower = higher priority),
     then backfill with newest
============================================================================ */

export async function getAllWork(): Promise<WorkEntry[]> {
  const all = await getCollection('work', (w) => !w.data.draft);
  return all.sort(byDateDesc);
}

/** Feature ordering: lower weight first; ties → newer first. */
const byFeatureThenDate = (a: WorkEntry, b: WorkEntry) => {
  const wa = a.data.featureWeight ?? 999;
  const wb = b.data.featureWeight ?? 999;
  if (wa !== wb) return wa - wb;
  return byDateDesc(a, b);
};

/**
 * Home selection:
 *  1) take all featured (`featuredHome: true`) sorted by weight->date, up to limit
 *  2) backfill with newest non-featured to reach limit
 */
export async function getWorkForHome(limit = 4): Promise<WorkEntry[]> {
  const all = await getAllWork();
  const featured = all.filter((w) => w.data.featuredHome).sort(byFeatureThenDate);

  const picked: WorkEntry[] = featured.slice(0, limit);
  if (picked.length < limit) {
    for (const w of all) {
      if (picked.some((p) => p.slug === w.slug)) continue;
      picked.push(w);
      if (picked.length >= limit) break;
    }
  }
  return picked.slice(0, limit);
}

/** Simple category filter if you need it ad-hoc (uses front-matter `serviceCategory`). */
export async function getWorkByCategory(category: WorkEntry['data']['serviceCategory']) {
  const all = await getAllWork();
  return all.filter((w) => w.data.serviceCategory === category);
}

/* ============================================================================
   Insights (Blog)
   ---------------------------------------------------------------------------
   - Sorted newest → oldest
   - Latest list for home widgets
============================================================================ */

export async function getAllPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('insights', (p) => !p.data.draft);
  return posts.sort(byDateDesc);
}

export async function getLatestInsights(limit = 3): Promise<PostEntry[]> {
  const posts = await getAllPosts();
  return posts.slice(0, Math.max(0, limit));
}

/* ============================================================================
   Testimonials
   ---------------------------------------------------------------------------
   - Supports BOTH shapes:
     A) legacy single:   work.data.testimonial = { quote, personName, role?, company? }
     B) new array:       work.data.testimonials = [{ quote/body, name/personName, role?, company? }, ...]
   - VM includes case study slug/title for linking
============================================================================ */

export type TestimonialVM = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  workTitle: string;
  workSlug: string;
};

/** Extract all testimonials for one work entry (supports legacy + new). */
export function getTestimonialsForWork(entry: WorkEntry): TestimonialVM[] {
  const vms: TestimonialVM[] = [];

  // New shape: array
  const arr = (entry.data as any).testimonials as
    | { quote?: string; body?: string; name?: string; personName?: string; role?: string; company?: string }[]
    | undefined;

  if (Array.isArray(arr)) {
    for (const t of arr) {
      const quote = (t.quote ?? t.body ?? '').trim();
      const name = (t.name ?? t.personName ?? '').trim();
      if (!quote || !name) continue;
      vms.push({
        quote,
        name,
        role: t.role?.trim() || undefined,
        company: t.company?.trim() || undefined,
        workTitle: entry.data.title,
        workSlug: entry.slug,
      });
    }
  }

  // Legacy single object
  const legacy = (entry.data as any).testimonial as
    | { quote?: string; body?: string; personName?: string; name?: string; role?: string; company?: string }
    | undefined;

  if (legacy) {
    const quote = (legacy.quote ?? legacy.body ?? '').trim();
    const name = (legacy.personName ?? legacy.name ?? '').trim();
    if (quote && name) {
      vms.push({
        quote,
        name,
        role: legacy.role?.trim() || undefined,
        company: legacy.company?.trim() || undefined,
        workTitle: entry.data.title,
        workSlug: entry.slug,
      });
    }
  }

  return vms;
}

/** Aggregate all testimonials across work entries. */
export async function getAllWorkTestimonials(): Promise<TestimonialVM[]> {
  const work = await getAllWork();
  const all: TestimonialVM[] = [];
  for (const w of work) {
    all.push(...getTestimonialsForWork(w));
  }
  return all;
}
