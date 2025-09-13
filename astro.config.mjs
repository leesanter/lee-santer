// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { isExcluded } from './scripts/sitemap-excludes.mjs';

const SITE = (process.env.PUBLIC_SITE_URL || '').trim();
const INDEXING = String(process.env.INDEXING ?? 'true').toLowerCase() !== 'false';
const ENABLE_SITEMAP = INDEXING && SITE.length > 0;

export default defineConfig({
	site: SITE || undefined,            // required only when sitemap is on
	trailingSlash: 'never',
	integrations: [
		mdx(),
		...(ENABLE_SITEMAP
			? [
				sitemap({
					filter: (page) => !isExcluded(page),
					serialize: (page) => {
						let priority = 0.5;
						if (page === '/') priority = 1.0;
						else if (/^\/(work|services)(\/|$)/.test(page)) priority = 0.8;
						else if (/^\/insights(\/|$)/.test(page)) priority = 0.6;
						return { url: page, changefreq: 'weekly', priority };
					},
				}),
			]
			: []),
	],
	image: {
		service: { entrypoint: 'astro/assets/services/sharp' },
	},
});
