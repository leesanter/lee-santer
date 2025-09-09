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
				// Skip 404 and any nested 404s
				if (page === '/404' || /^\/404(\/|$)/.test(page)) return false;

				// If you ever re-enable pagination like /insights/2, skip numeric pages
				// (This won't affect normal slugs like /insights/astro-seo-guide)
				if (/^\/insights\/\d+(\/)?$/.test(page)) return false;

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
