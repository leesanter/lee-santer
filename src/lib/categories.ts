// src/lib/categories.ts

/** Proper-case categories used in content frontmatter */
export const CATEGORIES = ['Strategy', 'Design', 'Development', 'Growth'] as const;
export type Category = typeof CATEGORIES[number];

/** Slug forms used in routes */
export const CATEGORY_SLUGS = ['strategy', 'design', 'development', 'growth'] as const;
export type CatSlug = typeof CATEGORY_SLUGS[number];

/** Proper → slug  ("Design" -> "design") */
export function toSlug(category: Category): CatSlug {
  return category.toLowerCase() as CatSlug;
}

/** slug → Proper  ("design" -> "Design") */
export function fromSlug(slug: CatSlug): Category {
  const i = CATEGORY_SLUGS.indexOf(slug);
  return CATEGORIES[i];
}

/** Type guard for arbitrary strings (runtime safety, optional) */
export function isCatSlug(x: string): x is CatSlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(x);
}
