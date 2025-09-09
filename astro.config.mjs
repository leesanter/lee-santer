// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

const SITE = process.env.PUBLIC_SITE_URL;

export default defineConfig({
	site: SITE,
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				// Exclude error/utility pages (we set noindex on these too)
				if (/^\/404(\/|$)/.test(page)) return false;
				if (/^\/500(\/|$)/.test(page)) return false;
				// Optional: keep 'style-guide' out of the sitemap since it's noindex
				if (/^\/style-guide(\/|$)/.test(page)) return false;
				// Keep all /insights pages, including /insights/2, /insights/3, ...
				// (removed stale /insights/page/{n} filter)
				return true;
			},
			serialize: (page) => {
				let priority = 0.5;
				if (page === '/') priority = 1.0;
				else if (/^\/(work|services)(\/|$)/.test(page)) priority = 0.8;
				else if (/^\/insights(\/|$)/.test(page)) priority = 0.6;

				return {
					url: page,
					changefreq: 'weekly',
					priority,
				};
			},
		}),
	],
	image: {
		service: {
			entrypoint: 'astro/assets/services/sharp',
		},
	},
});
