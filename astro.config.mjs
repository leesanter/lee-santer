// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || 'https://example.com',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				if (page === '/404' || /^\/404(\/|$)/.test(page)) return false; // skip 404
				// Example: skip very deep pagination if added later
				if (/\/insights\/page\/\d+/.test(page)) return false;
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
