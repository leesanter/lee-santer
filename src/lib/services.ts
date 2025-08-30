// src/lib/services.ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { keyToSlug, type CategoryKey, type CategorySlug, slugToKey } from './categories';

const RAW_STRICT =
  (import.meta as any)?.env?.STRICT_SERVICES ?? process.env.STRICT_SERVICES ?? 'false';
const STRICT_SERVICES = /^(1|true|yes)$/i.test(String(RAW_STRICT));

export type ServiceEntry = CollectionEntry<'services'>;

// ---- tiny memo ------------------------------------------------------------
let _servicesCache: ServiceEntry[] | null = null;
let _catOverviewsCache: ServiceEntry[] | null = null;

/** Sub-services only (exclude kind === 'category'); sorted by `order`. */
export async function getAllServices(): Promise<ServiceEntry[]> {
  if (_servicesCache) return _servicesCache;
  const all = await getCollection('services', (s) => !s.data.draft && (s.data as any).kind !== 'category');
  _servicesCache = all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
  return _servicesCache;
}

/** Map sub-service keys (filenames) → { label, href } pointing at /services/{category}#{anchor} */
export async function mapServiceKeysToLinks(keys: string[]) {
  const services = await getAllServices(); // sub-services only
  const byKey = new Map(services.map((s) => [s.slug.split('/').pop()!, s]));

  return keys.map((key) => {
    const svc = byKey.get(key);
    if (!svc) {
      const msg = `[work] Unknown serviceKey "${key}" — expected a file in /src/content/services/**/${key}.md`;
      if (STRICT_SERVICES) throw new Error(msg);
      if (import.meta.env.DEV) console.warn(msg);
      return { key, label: key, href: null as string | null };
    }
    const category = keyToSlug(svc.data.category as CategoryKey);
    const anchor = svc.data.anchor ?? key;
    return { key, label: svc.data.title, href: `/services/${category}#${anchor}` };
  });
}

/** Category overview docs (kind === 'category'), sorted by `order`. */
export async function getAllServiceCategoryOverviews(): Promise<ServiceEntry[]> {
  if (_catOverviewsCache) return _catOverviewsCache;
  const cats = await getCollection('services', (e) => !e.data.draft && (e.data as any).kind === 'category');
  _catOverviewsCache = cats.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  // Optional hygiene: warn if no summary (helps keep tiles/pages from being thin)
  if (import.meta.env.DEV) {
    for (const c of _catOverviewsCache) {
      if (!c.data.summary?.trim()) {
        console.warn(`[services] Category “${c.data.title}” is missing a summary.`);
      }
    }
  }

  return _catOverviewsCache;
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

/** View model for home “service tiles” slider (category overviews). */
export type CategorySlideVM = {
  key: CategoryKey;
  title: string;
  summary?: string;
  href: string; // /services/{slug}
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

export type ServiceLink = { key: string; label: string; href: string | null };
