// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || 'https://example.com',
	integrations: [sitemap()],
	image: {
		service: {
			// If `sharp` is installed, this just works.
			entrypoint: "astro/assets/services/sharp",
		},
	},
});
