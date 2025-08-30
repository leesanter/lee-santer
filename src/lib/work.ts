// src/lib/work.ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { CategoryKey } from './categories';

export type WorkEntry = CollectionEntry<'work'>;

/* -----------------------------------------------------------------------------
   Sorting & navigation
----------------------------------------------------------------------------- */

/** Items that carry either completedDate (work) or date (posts). */
type WithDates = { data: { completedDate?: Date; date?: Date } };

/** Sort newest → oldest (works for Work and Posts). */
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

/* -----------------------------------------------------------------------------
   Fetch helpers
----------------------------------------------------------------------------- */

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

/* -----------------------------------------------------------------------------
   Category predicates (single source of truth)
----------------------------------------------------------------------------- */

/** True if a work entry belongs to a given category key (Design, Strategy, …). */
export function inCategory(entry: WorkEntry, key: CategoryKey) {
  const list = (entry.data as any).serviceCategories as CategoryKey[] | undefined;
  return Array.isArray(list) ? list.includes(key) : false;
}

/** True if a work entry matches ANY of the given category keys. */
export function inAnyCategory(entry: WorkEntry, keys: CategoryKey[]) {
  const set = new Set(keys);
  const list = (entry.data as any).serviceCategories as CategoryKey[] | undefined;
  return Array.isArray(list) ? list.some((k) => set.has(k)) : false;
}

/** Multi-category filter (front matter `serviceCategories: CategoryKey[]`). */
export async function getWorkByCategory(key: CategoryKey) {
  const all = await getAllWork();
  return all.filter((w) => inCategory(w, key));
}

/** Featured work for a category: explicit slug wins; else newest in cat. */
export async function getFeaturedWorkForCategory(key: CategoryKey, explicitSlug?: string) {
  const all = await getAllWork();
  if (explicitSlug) return all.find((w) => w.slug === explicitSlug) ?? null;
  const inCat = all.filter((w) => inCategory(w, key));
  return inCat[0] ?? null;
}

/* -----------------------------------------------------------------------------
   Testimonials (array-only)
----------------------------------------------------------------------------- */

export type TestimonialVM = {
  quote: string;
  name: string; // derived from personName
  role?: string;
  company?: string;
  workTitle: string;
  workSlug: string;
};

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

export async function getAllWorkTestimonials(): Promise<TestimonialVM[]> {
  const work = await getAllWork();
  return work.flatMap(getTestimonialsForWork);
}

export function hasTestimonials(entry: WorkEntry): boolean {
  return (entry.data.testimonials?.length ?? 0) > 0;
}

export function getRandomTestimonial(
  pool: TestimonialVM[],
  rng: () => number = Math.random
): TestimonialVM | null {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  const i = Math.floor(rng() * pool.length);
  return pool[i] ?? null;
}