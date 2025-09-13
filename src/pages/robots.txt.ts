// src/pages/robots.txt.ts
/**
 * robots.txt (dynamic)
 * -------------------------------------------
 * Behaviour:
 * - If INDEXING=false: disallow all (no sitemap lines).
 * - If INDEXING=true: allow all; only advertise sitemap-index.xml
 *   when PUBLIC_SITE_URL is configured (absolute URL).
 *
 * ENV you can set:
 *   INDEXING=true|false
 *   PUBLIC_SITE_URL=https://example.com   // used for absolute Sitemap URL
 */
import type { APIContext } from 'astro';

export const prerender = true;

export function GET(_ctx: APIContext) {
  const INDEXING =
    String(import.meta.env.INDEXING ?? 'true').toLowerCase() !== 'false';
  const SITE = (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.trim() || '';

  const lines: string[] = ['User-agent: *'];

  if (!INDEXING) {
    // Non-indexable: block everything. Do not advertise a sitemap.
    lines.push('Disallow: /');
  } else {
    // Indexable: allow crawling.
    lines.push('Allow: /');

    // Only advertise sitemap when a SITE is configured.
    // Standardise on the index file to avoid 404s for /sitemap.xml.
    if (SITE) {
      const indexUrl = new URL('/sitemap-index.xml', SITE).href;
      lines.push(`Sitemap: ${indexUrl}`);
    }
  }

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
