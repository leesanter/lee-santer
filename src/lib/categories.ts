export const CATEGORIES = ['Strategy','Design','Development','Growth'] as const;
export type Category = typeof CATEGORIES[number];

export const toSlug = (c: Category) => c.toLowerCase();                 // "Design" -> "design"
export const fromSlug = (s: string) =>
  (s && (['strategy','design','development','growth'] as const).includes(s as any))
    ? (s[0].toUpperCase() + s.slice(1)) as Category
    : null;
