import { getCollection, type CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';

export type SiteSettings = {
  siteName: string;
  defaultDescription: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  brandLogoPath?: string;
  siteUrl?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const entry = await getEntry('site', 'settings');
  return entry?.data ?? null;
}

export type Service = CollectionEntry<'services'>;
export type Work = CollectionEntry<'work'>;
export type Post = CollectionEntry<'insights'>;

const byDateDesc = <T extends { data: { completedDate?: Date; date?: Date } }>(a: T, b: T) =>
  (b.data.completedDate?.getTime?.() ?? b.data.date!.getTime()) -
  (a.data.completedDate?.getTime?.() ?? a.data.date!.getTime());

export async function getAllServices(): Promise<Service[]> {
  const all = await getCollection('services', s => !s.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function mapServiceKeysToLinks(keys: string[]) {
  const services = await getAllServices();
  const idx = new Map(services.map(s => [s.slug.split('/').pop()!, s])); // serviceKey = filename
  return keys.map(key => {
    const svc = idx.get(key);
    if (!svc) {
      console.warn(`[work] Unknown serviceKey "${key}" — link skipped`);
      return { key, label: key, href: null as string | null };
    }
    const category = svc.data.category.toLowerCase();
    const anchor = (svc.data.anchor ?? key);
    return { key, label: svc.data.title, href: `/services/${category}#${anchor}` };
  });
}

export async function getAllWork(): Promise<Work[]> {
  const entries = await getCollection('work', w => !w.data.draft);
  return entries.sort(byDateDesc);
}

export async function getWorkForHome(limit = 4): Promise<Work[]> {
  const all = await getAllWork();
  const featured = all.filter(w => w.data.featuredHome);
  featured.sort((a, b) => {
    const pa = a.data.featureWeight ?? 999;
    const pb = b.data.featureWeight ?? 999;
    return pa !== pb ? pa - pb : byDateDesc(a, b);
  });
  return featured.slice(0, limit);
}

export function nextPrev<T extends { slug: string }>(items: T[], currentSlug: string) {
  const list = [...items];
  const idx = list.findIndex(x => x.slug === currentSlug);
  if (idx < 0) return { next: null, prev: null };
  const next = list[(idx + 1) % list.length] ?? null;
  const prev = list[(idx - 1 + list.length) % list.length] ?? null;
  return { next, prev };
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('insights', p => !p.data.draft);
  return posts.sort(byDateDesc);
}

export type WorkTestimonial = {
  quote: string;
  personName: string;
  role?: string;
  company?: string;
  workTitle: string;
  workSlug: string;
};

export async function getAllWorkTestimonials(): Promise<WorkTestimonial[]> {
  const all = await getAllWork();
  return all
    .filter(w => !!w.data.testimonial)
    .map(w => ({
      ...w.data.testimonial!,
      workTitle: w.data.title,
      workSlug: w.slug,
    }));
}
