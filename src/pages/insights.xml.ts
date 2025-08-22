// src/pages/insights.xml.ts
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = (import.meta as any).env?.PUBLIC_SITE_URL || 'http://localhost:4321';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = (await getCollection('insights', ({ data }) => !data.draft))
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const updated = posts[0]
    ? new Date(posts[0].data.date).toUTCString()
    : new Date().toUTCString();

  const items = posts.map((p) => {
    const url = `${SITE}/insights/${p.slug}`;
    return `
      <item>
        <title>${escapeXml(p.data.title)}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${new Date(p.data.date).toUTCString()}</pubDate>
        <description>${escapeXml(p.data.summary)}</description>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Insights — Lee Santer</title>
    <link>${SITE}/insights</link>
    <description>Articles and notes on strategy, design, development and growth.</description>
    <lastBuildDate>${updated}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
}
