/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Core site / SEO
  readonly PUBLIC_SITE_NAME: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_DEFAULT_TITLE?: string;
  readonly PUBLIC_DEFAULT_DESCRIPTION?: string;
  readonly PUBLIC_OG_IMAGE?: string;
  readonly PUBLIC_TWITTER?: string;
  readonly PUBLIC_HTML_LANG?: string;
  readonly PUBLIC_SITE_LOCALE?: string; // e.g. en_GB

  // Head assets / theming
  readonly PUBLIC_FAVICON?: string;
  readonly PUBLIC_FAVICON_PNG_32?: string;
  readonly PUBLIC_FAVICON_PNG_16?: string;
  readonly PUBLIC_APPLE_TOUCH_ICON?: string;
  readonly PUBLIC_MASK_ICON?: string;
  readonly PUBLIC_MASK_ICON_COLOR?: string;
  readonly PUBLIC_MANIFEST?: string;
  readonly PUBLIC_THEME_COLOR?: string;
  readonly PUBLIC_THEME_COLOR_DARK?: string;

  // Fonts
  readonly PUBLIC_FONT_PRELOADS?: string; // comma-separated list

  // Analytics / consent
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_CONSENT_VERSION?: string;

  // Robots / CI toggles
  readonly INDEXING?: 'true' | 'false';
  readonly STRICT_SERVICES?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
