import { getEntry } from 'astro:content';

export type SiteSettings = {
  siteName: string;
  defaultDescription: string;
  defaultOgImage?: string;
  twitterHandle?: string;
  siteUrl?: string; // optional fallback; ENV should win
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const entry = await getEntry('site', 'settings');
  return entry?.data ?? null;
}
