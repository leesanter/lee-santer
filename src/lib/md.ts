import { marked } from 'marked';

export async function md(input?: string) {
  const out = await marked.parse(input ?? '');
  return String(out);
}
