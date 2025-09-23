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
  const all = await getCollection('services', (s) => !s.data.draft && s.data.kind === 'service');
  _servicesCache = all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
  return _servicesCache;
}

/** Category overview docs (kind === 'category'), sorted by `order`. */
export async function getAllServiceCategoryOverviews(): Promise<ServiceEntry[]> {
  if (_catOverviewsCache) return _catOverviewsCache;
  const cats = await getCollection('services', (e) => !e.data.draft && e.data.kind === 'category');
  _catOverviewsCache = cats.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

  // Optional hygiene in dev
  if (import.meta.env.DEV) {
    for (const c of _catOverviewsCache) {
      if (!(c.data as any).homeOverview?.trim()) {
        console.warn(`[services] Category “${c.data.title}” is missing homeOverview.`);
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

/** Sub-services for a given category (for accordions on /services). */
export async function getSubServicesForCategory(key: CategoryKey) {
  const all = await getAllServices();
  return all.filter((s) => (s.data.category as CategoryKey) === key);
}

/** Get a sub-service by lander slug (for /services/[slug]). */
export async function getServiceByLanderSlug(slug: string): Promise<ServiceEntry | null> {
  const all = await getAllServices();
  return all.find((s) => (s.data as any).landerSlug === slug) ?? null;
}

/** View model for home “service tiles” slider (category overviews). */
export type CategorySlideVM = {
  key: CategoryKey;
  title: string;
  summary?: string;  // use homeOverview
  href: string;      // /services#{slug}
};

export async function getCategorySlides(): Promise<CategorySlideVM[]> {
  const cats = await getAllServiceCategoryOverviews();
  return cats.map((c) => ({
    key: c.data.category as CategoryKey,
    title: c.data.title,
    summary: (c.data as any).homeOverview,
    href: `/services#${keyToSlug(c.data.category as CategoryKey)}`,
  }));
}

export type ServiceLink = { key: string; label: string; href: string | null };

/**
 * Map sub-service keys (filenames) → { label, href }
 * Prefers lander (/services/{landerSlug}) when present & not draft.
 * Fallback: /services#{anchor}
 */
export async function mapServiceKeysToLinks(keys: string[]): Promise<ServiceLink[]> {
  const services = await getAllServices(); // sub-services only
  const byKey = new Map(services.map((s) => [s.slug.split('/').pop()!, s]));

  return keys.map((key) => {
    const svc = byKey.get(key);
    if (!svc) {
      const msg = `[work] Unknown serviceKey "${key}" — expected a file in /src/content/services/**/${key}.md`;
      if (STRICT_SERVICES) throw new Error(msg);
      if (import.meta.env.DEV) console.warn(msg);
      return { key, label: key, href: null };
    }

    const anchor = (svc.data as any).anchor ?? key;
    const lander = (svc.data as any).landerSlug as string | undefined;
    const isDraft = !!svc.data.draft;

    const href = lander && !isDraft ? `/services/${lander}` : `/services#${anchor}`;

    return { key, label: svc.data.title, href };
  });
}

/** Utility: true if a sub-service has a published lander */
export function hasLander(entry: ServiceEntry): boolean {
  return Boolean((entry.data as any).landerSlug && !entry.data.draft);
}
