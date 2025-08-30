import { getCollection, type CollectionEntry } from 'astro:content';
import { byDateDesc } from './work';

export type PostEntry = CollectionEntry<'insights'>;

export async function getAllPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('insights', (p) => !p.data.draft);
  return posts.sort(byDateDesc);
}

export async function getLatestInsights(limit = 3): Promise<PostEntry[]> {
  const posts = await getAllPosts();
  return posts.slice(0, Math.max(0, limit));
}
