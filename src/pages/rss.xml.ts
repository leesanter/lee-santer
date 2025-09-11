// ======================================================================
// /rss.xml.ts — RSS feed for the blog (via @astrojs/rss)
// Honours PUBLIC_ENABLE_RSS: when false, returns 404 (no feed).
// ----------------------------------------------------------------------
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const enableRss =
    String(import.meta.env.PUBLIC_ENABLE_RSS ?? 'false').toLowerCase() === 'true';

  if (!enableRss) {
    return new Response('RSS disabled', { status: 404 });
  }

  const site =
    (import.meta.env.PUBLIC_SITE_URL as string) ?? context.site?.toString() ?? '';

  const siteName = (import.meta.env.PUBLIC_SITE_NAME as string) ?? 'Site';
  const posts = await getCollection('insights', (p) => !p.data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `Insights — ${siteName}`,
    description: `Latest articles and notes from ${siteName}.`,
    site: site || 'http://localhost', // fallback is harmless in dev
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/insights/${p.slug}`,
    })),
  });
}
