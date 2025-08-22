// src/lib/readingTime.ts
export function readingTimeFromMarkdown(md: string, wpm = 225) {
  if (!md) return { minutes: 1, words: 0 };
  const text = md
    .replace(/```[\s\S]*?```/g, " ")  // fenced code blocks
    .replace(/`[^`]*`/g, " ")         // inline code
    .replace(/<[^>]+>/g, " ")         // html tags
    .replace(/[\*\_\#\>\-\+\=\[\]\(\)\!\|]/g, " ") // md punctuation
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / wpm));
  return { minutes, words };
}
