// ======================================================================
// /rss.xml.ts — RSS feed for the blog (via @astrojs/rss)
// ----------------------------------------------------------------------
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const prerender = true;

export async function GET(context) {
  // Get published posts (hide drafts), newest first
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) =>
      (b.data.publishDate?.getTime?.() ?? 0) -
      (a.data.publishDate?.getTime?.() ?? 0)
  );

  // Prefer Astro.site; fall back to env if needed
  const site =
    context.site ??
    new URL(import.meta.env.PUBLIC_SITE_URL || "https://example.com");

  return rss({
    title: import.meta.env.PUBLIC_SITE_NAME ?? "Site",
    description: import.meta.env.PUBLIC_DEFAULT_DESCRIPTION ?? "",
    site, // absolute base URL
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishDate ?? new Date(),
      link: `/blog/${p.id}`, // use id to match your routes
    })),
  });
}
