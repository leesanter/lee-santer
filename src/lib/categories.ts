// src/lib/categories.ts

/** Canonical category keys (human-readable) */
export const CATEGORY_KEYS = ['Strategy', 'Design', 'Development', 'Growth'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** Canonical category slugs (URL-safe) */
export const CATEGORY_SLUGS = ['strategy', 'design', 'development', 'growth'] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** UI-friendly ordered list (kept for existing imports in components) */
export const CATEGORIES: readonly CategoryKey[] = CATEGORY_KEYS;

/** Key → slug */
export const toSlug = (k: CategoryKey): CategorySlug => k.toLowerCase() as CategorySlug;
/** Slug → key (throws on unknown) */
export const fromSlug = (s: string): CategoryKey => {
  switch (s.toLowerCase()) {
    case 'strategy': return 'Strategy';
    case 'design': return 'Design';
    case 'development': return 'Development';
    case 'growth': return 'Growth';
    default: throw new Error(`Unknown category slug "${s}"`);
  }
};

/** Aliases (your code uses these names in a few places) */
export const keyToSlug = toSlug;
export const slugToKey = fromSlug;

/** Type guards (handy in templates or runtime checks) */
export const isCategoryKey  = (x: unknown): x is CategoryKey  => CATEGORY_KEYS.includes(x as any);
export const isCategorySlug = (x: unknown): x is CategorySlug => CATEGORY_SLUGS.includes(x as any);
