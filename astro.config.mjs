// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || 'https://example.com',
	integrations: [sitemap(), mdx()],
	image: {
		service: {
			// If `sharp` is installed, this just works.
			entrypoint: "astro/assets/services/sharp",
		},
	},
});
