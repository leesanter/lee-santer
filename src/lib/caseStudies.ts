import { getCollection, CollectionEntry } from 'astro:content';
import { SERVICE_ANCHORS } from '../data/serviceAnchors';

export type Category = 'Strategy' | 'Design' | 'Development' | 'Growth';
export type Case = CollectionEntry<'case-studies'>;

const byDateDesc = (a: Case, b: Case) =>
  new Date(b.data.completedDate).getTime() - new Date(a.data.completedDate).getTime();

export async function getAllCaseStudies() {
  const entries = await getCollection('case-studies', ({ data }) => !data.draft);
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

  // Sort by priority then recency
  const sorted = pool.sort((a, b) => {
    const pa = a.data.highlightPriority ?? 999;
    const pb = b.data.highlightPriority ?? 999;
    if (pa !== pb) return pa - pb;
    return byDateDesc(a, b);
  });

  return sorted[0] ?? null;
}

/** Pick one featured case for the /services hub. */
export async function pickFeaturedForServicesHub(explicitSlug?: string): Promise<Case | null> {
  const all = await getAllCaseStudies();
  if (explicitSlug) {
    const match = all.find((c) => c.slug === explicitSlug || c.data.slug === explicitSlug);
    if (match) return match;
  }
  // Lowest priority across all highlighted, then recency; else most recent overall
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

/** Map display services to optional deep links using the anchor map. */
export function mapDisplayServicesToLinks(labels: string[]) {
  return labels.map((label) => {
    const entry = SERVICE_ANCHORS[label];
    if (!entry) return { label, href: null as string | null };
    const href = `/services/${entry.category.toLowerCase()}#${entry.anchor}`;
    return { label, href };
  });
}
