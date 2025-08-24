// src/lib/md.ts
import { marked } from 'marked';

/** Render trusted Markdown to HTML. */
export function mdToHtml(md: string) {
  return marked.parse(md) as string;
}
