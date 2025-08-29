// src/lib/md.ts
import { marked } from 'marked';

// Force sync mode; throws if an async extension is added.
marked.setOptions({ async: false });

export function md(input?: string): string {
  // types say string | Promise<string>; we assert string because async=false.
  return marked.parse(input ?? '') as string;
}
