// src/lib/format.ts
export type Dateish = Date | string | number;

function toDate(d: Dateish): Date {
  if (d instanceof Date) return d;
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) {
    throw new Error(`formatDate(): Invalid date input "${String(d)}"`);
  }
  return t;
}

/** Shared date formatting (defaults en-GB) */
export function formatDate(
  d: Dateish,
  pattern: 'MMM yyyy' | 'dd MMM yyyy' | 'yyyy-MM-dd' | 'iso' = 'dd MMM yyyy',
  locale = 'en-GB',
): string {
  const date = toDate(d);
  switch (pattern) {
    case 'iso':
      return date.toISOString();
    case 'yyyy-MM-dd':
      return date.toISOString().slice(0, 10);
    case 'MMM yyyy':
      return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
    case 'dd MMM yyyy':
    default:
      return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }
}
