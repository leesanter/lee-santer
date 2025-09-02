// src/lib/theme.ts
type Mode = 'auto' | 'light' | 'dark';
type Color = 'light' | 'dark';

const STORAGE_KEYS = ['themeMode', 'theme']; // support either key

function getStoredMode(): Mode {
  try {
    for (const k of STORAGE_KEYS) {
      const v = localStorage.getItem(k);
      if (v === 'light' || v === 'dark' || v === 'auto') return v;
    }
  } catch {}
  return 'auto';
}

function prefersScheme(): Color {
  try {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function currentRootScheme(): Color | null {
  const v = (document.documentElement?.dataset?.scheme ?? '') as string;
  return v === 'light' || v === 'dark' ? (v as Color) : null;
}

function setScheme(color: Color) {
  const root = document.documentElement;
  if (root.dataset.scheme !== color) {
    root.dataset.scheme = color; // your tokens listen here (html[data-scheme])
  }
  // Mirror to body for any legacy selectors you might still have
  const body = document.body;
  if (body && body.dataset.bodyBg !== color) {
    body.dataset.bodyBg = color;
  }
}

/** Walks up from the point under the viewport center to find a section with data-bg-color */
function nearestBgFromPoint(x: number, y: number): Color | null {
  let el = document.elementFromPoint(x, y) as HTMLElement | null;
  while (el) {
    if (el.hasAttribute?.('data-bg-color')) {
      const c = (el.getAttribute('data-bg-color') || '').toLowerCase();
      if (c === 'light' || c === 'dark') return c as Color;
    }
    el = el.parentElement;
  }
  return null;
}

/** Pick the “best” section from IO entries: highest ratio, then nearest to viewport center */
function pickWinner(entries: IntersectionObserverEntry[]): HTMLElement | null {
  const cy = window.innerHeight / 2;
  let best: { el: HTMLElement; ratio: number; dist: number } | null = null;

  for (const e of entries) {
    const el = e.target as HTMLElement;
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const dist = Math.abs(center - cy);
    const ratio = e.intersectionRatio;

    if (!best || ratio > best.ratio || (ratio === best.ratio && dist < best.dist)) {
      best = { el, ratio, dist };
    }
  }
  return best?.el ?? null;
}

export function initThemeSync() {
  const root = document.documentElement;

  // Prevent flashes: disable transitions for the first scheme apply
  root.classList.add('no-theme-transitions');

  const mode = getStoredMode();

  // Initial scheme:
  // 1) existing html[data-scheme] if present
  // 2) section under viewport center
  // 3) prefers-color-scheme
  const initial: Color =
    currentRootScheme() ??
    nearestBgFromPoint(window.innerWidth / 2, window.innerHeight / 2) ??
    prefersScheme();

  setScheme(mode === 'auto' ? initial : (mode as Color));

  // Re-enable transitions after first paint
  requestAnimationFrame(() => {
    root.classList.remove('no-theme-transitions');
  });

  // If user pinned a mode (light/dark), stop here.
  if (mode !== 'auto') return;

  // Observe sections with data-bg-color
  const targets = Array.from(document.querySelectorAll<HTMLElement>('section[data-bg-color]'));
  if (targets.length === 0) return;

  let current = initial;

  const io = new IntersectionObserver(
    (entries) => {
      const winner = pickWinner(entries);
      if (!winner) return;
      const next = (winner.getAttribute('data-bg-color') || '').toLowerCase();
      if ((next === 'light' || next === 'dark') && next !== current) {
        current = next as Color;
        setScheme(current);
      }
    },
    {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      rootMargin: '-10% 0px -10% 0px',
    }
  );

  for (const el of targets) io.observe(el);

  // Re-evaluate on resize/orientation
  let raf = 0;
  const onResize = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const next = nearestBgFromPoint(window.innerWidth / 2, window.innerHeight / 2) ?? current;
      if (next !== current) {
        current = next;
        setScheme(current);
      }
    });
  };
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
}

/** Optional helper for a manual toggle (styleguide switch etc.) */
export function setThemeMode(mode: Mode) {
  try {
    for (const k of STORAGE_KEYS) localStorage.setItem(k, mode);
  } catch {}
  if (mode === 'auto') {
    const mid =
      nearestBgFromPoint(window.innerWidth / 2, window.innerHeight / 2) ??
      currentRootScheme() ??
      prefersScheme();
    setScheme(mid);
  } else {
    setScheme(mode);
  }
}
