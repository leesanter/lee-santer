// src/lib/services.ts
import { getCollection, type CollectionEntry } from 'astro:content';
import { keyToSlug, type CategoryKey, type CategorySlug, slugToKey } from './categories';

// Build toggle: fail CI on unknown service keys referenced by work entries.
// Read from either import.meta.env (Vite/Astro) or process.env (Node/CI).
const STRICT_SERVICES =
  String((import.meta as any)?.env?.STRICT_SERVICES ?? process.env.STRICT_SERVICES ?? 'false')
    .toLowerCase() === 'true';

export type ServiceEntry = CollectionEntry<'services'>;

/** Sub-services only (exclude kind === 'category'); sorted by `order`. */
export async function getAllServices(): Promise<ServiceEntry[]> {
  const all = await getCollection(
    'services',
    (s) => !s.data.draft && (s.data as any).kind !== 'category'
  );
  return all.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));
}

/** Map sub-service keys (filenames) → { label, href } pointing at /services/{category}#{anchor} */
export async function mapServiceKeysToLinks(keys: string[]) {
  const services = await getAllServices(); // sub-services only
  const byKey = new Map(services.map((s) => [s.slug.split('/').pop()!, s]));

  return keys.map((key) => {
    const svc = byKey.get(key);
    if (!svc) {
      const msg = `[work] Unknown serviceKey "${key}" — expected a file in /src/content/services/**/${key}.md`;
      if (STRICT_SERVICES) {
        throw new Error(msg);
      }
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
  const cats = await getCollection(
    'services',
    (e) => !e.data.draft && (e.data as any).kind === 'category'
  );
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
