// src/pages/robots.txt.ts
/**
 * robots.txt (dynamic)
 * -------------------------------------------
 * Behaviour:
 * - If INDEXING=false or not production: disallow all.
 * - Otherwise: allow all + output Sitemap lines.
 *
 * ENV you can set:
 *   INDEXING=true|false
 *   PUBLIC_SITE_URL=https://example.com   // absolute Sitemap URLs if provided
 */
export const prerender = true;

export function GET() {
  const isProd = import.meta.env.PROD;
  const indexingEnv = String(import.meta.env.INDEXING ?? 'true').toLowerCase();
  const allowIndex = isProd && indexingEnv !== 'false';

  const site = (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.replace(/\/+$/, '') || '';

  const lines: string[] = ['User-agent: *'];

  if (allowIndex) {
    lines.push('Allow: /');

    // Prefer absolute URLs when site is configured; fall back to relative.
    const base = site || '';
    lines.push(`Sitemap: ${base ? `${base}/sitemap.xml` : '/sitemap.xml'}`);
    lines.push(`Sitemap: ${base ? `${base}/sitemap-index.xml` : '/sitemap-index.xml'}`);
  } else {
    lines.push('Disallow: /');
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
