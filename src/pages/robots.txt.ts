// src/pages/robots.txt.ts
/**
 * robots.txt (dynamic)
 * -------------------------------------------
 * Behaviour:
 * - If INDEXING=false or not production: disallow all.
 * - Otherwise: allow all + output Sitemap lines.
 *
 * ENV you can set:
 *   INDEXING=true|false        (server-only; defaults to true in prod)
 *   PUBLIC_SITE_URL=https://example.com   (used for absolute Sitemap URLs)
 *
 * Also set `site` in astro.config.mjs for proper sitemaps.
 */
export const prerender = true;

export function GET() {
  const isProd = import.meta.env.PROD;
  const indexingEnv = String(import.meta.env.INDEXING ?? "true").toLowerCase();
  const allowIndex = isProd && indexingEnv !== "false";

  const lines = ["User-agent: *"];

  if (allowIndex) {
    lines.push("Allow: /");

    const site = import.meta.env.PUBLIC_SITE_URL || "";
    try {
      if (site) {
        const base = new URL(site);
        lines.push(new URL("/sitemap.xml", base).toString().startsWith("http") ? `Sitemap: ${new URL("/sitemap.xml", base)}` : "Sitemap: /sitemap.xml");
        lines.push(new URL("/sitemap-index.xml", base).toString().startsWith("http") ? `Sitemap: ${new URL("/sitemap-index.xml", base)}` : "Sitemap: /sitemap-index.xml");
      } else {
        lines.push("Sitemap: /sitemap.xml");
      }
    } catch {
      lines.push("Sitemap: /sitemap.xml");
    }
  } else {
    lines.push("Disallow: /");
  }

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}