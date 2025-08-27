// ======================================================================
// /rss.xml.ts — RSS feed for the blog (via @astrojs/rss)
// ----------------------------------------------------------------------
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const site = (import.meta.env.PUBLIC_SITE_URL as string) ?? context.site?.toString();
  const posts = await getCollection('insights', (p) => !p.data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Insights — Lee Santer',
    description: 'Latest articles and notes from Lee Santer.',
    site: site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date,
      link: `/insights/${p.slug}`,
    })),
  });
}
