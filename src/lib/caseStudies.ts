import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { SERVICE_ANCHORS } from '../data/serviceAnchors';

export type Category = 'Strategy' | 'Design' | 'Development' | 'Growth';
export type Case = CollectionEntry<'case-studies'>;

export const byDateDesc = (a: Case, b: Case) =>
  b.data.completedDate.getTime() - a.data.completedDate.getTime();

export async function getAllCaseStudies(): Promise<Case[]> {
  const entries = (await getCollection('case-studies', ({ data }) => !data.draft)) as Case[];
  return entries.sort(byDateDesc);
}

export async function getCaseStudiesByCategory(category: Category) {
  const all = await getAllCaseStudies();
  return all.filter((c) => c.data.expertiseCategories.includes(category));
}

export async function pickSelectedForCategory(category: Category): Promise<Case | null> {
  const eligible = await getCaseStudiesByCategory(category);
  if (eligible.length === 0) return null;

  const highlighted = eligible.filter((c) => (c.data.highlightInExpertise || []).includes(category));
  const pool = highlighted.length ? highlighted : eligible;

  const sorted = pool.sort((a, b) => {
    const pa = a.data.highlightPriority ?? 999;
    const pb = b.data.highlightPriority ?? 999;
    if (pa !== pb) return pa - pb;
    return byDateDesc(a, b);
  });

  return sorted[0] ?? null;
}

export function pickNextCaseStudy(all: Case[], current: Case): Case | null {
  const sorted = [...all].sort(byDateDesc);
  const idx = sorted.findIndex((e) => e.slug === current.slug);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % sorted.length;
  return sorted[nextIdx] ?? null;
}

/** Map display service labels → optional deep links (cards can ignore href) */
export function mapDisplayServicesToLinks(labels: string[]) {
  return labels.map((label) => {
    const entry = SERVICE_ANCHORS[label];
    if (!entry) return { label, href: null as string | null };
    return { label, href: `/services/${entry.category.toLowerCase()}#${entry.anchor}` };
  });
}

export async function pickFeaturedForServicesHub(explicitSlug?: string): Promise<Case | null> {
  const all = await getAllCaseStudies();

  // If a specific slug is provided (via config/env) prefer that
  if (explicitSlug) {
    const match = all.find((c) => c.slug === explicitSlug || (c as any).data.slug === explicitSlug);
    if (match) return match;
  }

  // Otherwise: among all highlighted, pick lowest priority → newest; fallback to newest overall
  const highlighted = all.filter((c) => (c.data.highlightInExpertise || []).length > 0);
  const pool = highlighted.length ? highlighted : all;

  const sorted = pool.sort((a, b) => {
    const pa = a.data.highlightPriority ?? 999;
    const pb = b.data.highlightPriority ?? 999;
    if (pa !== pb) return pa - pb;
    return byDateDesc(a, b);
  });

  return sorted[0] ?? null;
}
