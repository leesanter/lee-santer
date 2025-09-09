// Single source of truth for sitemap exclusions.
// Any path here (and its children) will be excluded.
export const EXCLUDED_ROUTES = [
	'/404',
	'/500',
	'/style-guide',
];

export function isExcluded(path) {
	return EXCLUDED_ROUTES.some((base) => path === base || path.startsWith(base + '/'));
}
