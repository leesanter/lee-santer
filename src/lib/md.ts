import { marked } from 'marked';

/** Convert a markdown string to HTML (string). */
export function md(input: string): string {
  return marked.parse(input ?? '');
}
