import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

/* ============================================================================
   Site Settings
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
   Shared types & utilities
============================================================================ */
export type ServiceEntry = CollectionEntry<'services'>;
export type WorkEntry    = CollectionEntry<'work'>;
export type PostEntry    = CollectionEntry<'insights'>;

export type CategoryKey  = 'Strategy' | 'Design' | 'Development' | 'Growth';
export type CategorySlug = 'strategy' | 'design' | 'development' | 'growth';

export const keyToSlug = (k: CategoryKey): CategorySlug =>
  (k.toLowerCase() as CategorySlug);

export const slugToKey = (s: string): CategoryKey =>
  (s[0].toUpperCase() + s.slice(1)) as CategoryKey;

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
   Services (unified collection)
============================================================================ */

/** Sub-services only (exclude kind === 'category'); sorted by `order`. */
export async function getAllServices(): Promise<ServiceEntry[]> {
  const all = await getCollection('services', (s) => !s.data.draft && (s.data as any).kind !== 'category');
  return all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}

/**
 * Map sub-service keys (filenames) → { label, href } deep-linking to
 * /services/{category}#{anchor}
 */
export async function mapServiceKeysToLinks(keys: string[]) {
  const services = await getAllServices(); // sub-services only
  const byKey = new Map(services.map((s) => [s.slug.split('/').pop()!, s]));
  return keys.map((key) => {
    const svc = byKey.get(key);
    if (!svc) {
      if (import.meta.env.DEV) console.warn(`[work] Unknown serviceKey "${key}" — link skipped`);
      return { key, label: key, href: null as string | null };
    }
    const category = keyToSlug(svc.data.category as CategoryKey);
    const anchor = svc.data.anchor ?? key; // default to filename if missing
    return { key, label: svc.data.title, href: `/services/${category}#${anchor}` };
  });
}

/** Category overview docs (kind === 'category'), sorted by `order`. */
export async function getAllServiceCategoryOverviews(): Promise<ServiceEntry[]> {
  const cats = await getCollection('services', (e) => !e.data.draft && (e.data as any).kind === 'category');
  return cats.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}

/** Fetch a category overview by slug (e.g. 'design' → Design). */
export async function getCategoryBySlug(slug: CategorySlug) {
  const key = slugToKey(slug);
  const cats = await getAllServiceCategoryOverviews();
  return cats.find((c) => (c.data.category as CategoryKey) === key) ?? null;
}

/** Sub-services for a given category (for accordions on /services/{category}). */
export async function getSubServicesForCategory(key: CategoryKey) {
  const all = await getAllServices();
  return all.filter((s) => (s.data.category as CategoryKey) === key);
}

/** View model for Home /services slider tiles, based on category overviews. */
export type CategorySlideVM = {
  key: CategoryKey;
  title: string;
  summary?: string;
  image?: unknown; // ImageMetadata | undefined
  alt?: string;
  href: string;    // /services/{slug}
};

export async function getCategorySlides(): Promise<CategorySlideVM[]> {
  const cats = await getAllServiceCategoryOverviews();
  return cats.map((c) => ({
    key: c.data.category as CategoryKey,
    title: c.data.title,
    summary: c.data.summary,
    href: `/services/${keyToSlug(c.data.category as CategoryKey)}`,
  }));
}

/* ============================================================================
   Work (Case Studies)
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

/** Home selection: featured → backfill newest. */
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

/** Category filter (uses front-matter `serviceCategories`). */
export async function getWorkByCategory(category: CategoryKey) {
  const all = await getAllWork();
  return all.filter((w) => (w.data as any).serviceCategories?.includes(category));
}

/** Featured work for a category: explicit slug wins; else newest in cat. */
export async function getFeaturedWorkForCategory(
  key: CategoryKey,
  explicitSlug?: string,
): Promise<WorkEntry | null> {
  const all = await getAllWork();
  if (explicitSlug) return all.find((w) => w.slug === explicitSlug) ?? null;
  const inCat = all.filter((w) => (w.data as any).serviceCategories?.includes(key));
  return inCat[0] ?? null;
}

/* ============================================================================
   Insights (Blog)
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
   Testimonials (array-only)
============================================================================ */

export type TestimonialVM = {
  quote: string;
  name: string;     // derived from personName
  role?: string;
  company?: string;
  workTitle: string;
  workSlug: string;
};

/** Extract testimonials for one work entry (array-only). */
export function getTestimonialsForWork(entry: WorkEntry): TestimonialVM[] {
  const arr = entry.data.testimonials ?? [];
  return arr
    .map((t) => ({
      quote: t.quote.trim(),
      name: t.personName.trim(),
      role: t.role?.trim() || undefined,
      company: t.company?.trim() || undefined,
      workTitle: entry.data.title,
      workSlug: entry.slug,
    }))
    .filter((t) => t.quote && t.name);
}

/** Aggregate all testimonials across work entries. */
export async function getAllWorkTestimonials(): Promise<TestimonialVM[]> {
  const work = await getAllWork();
  return work.flatMap(getTestimonialsForWork);
}
