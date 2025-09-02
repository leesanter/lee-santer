// src/lib/theme.ts
type Color = 'light' | 'dark';

function currentRootScheme(): Color | null {
  const v = document.documentElement.dataset.scheme;
  return v === 'light' || v === 'dark' ? v : null;
}

export function setScheme(color: Color) {
  const root = document.documentElement;
  if (root.dataset.scheme !== color) root.dataset.scheme = color;

  const body = document.body;
  if (body && body.dataset.bodyBg !== color) body.dataset.bodyBg = color;

  // Remember for next navigation / refresh (used by pre-paint boot)
  try {
    document.cookie = `scheme=${encodeURIComponent(color)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {}
}

function nearestBgFromPoint(x: number, y: number): Color | null {
  let el = document.elementFromPoint(x, y) as HTMLElement | null;
  while (el) {
    if (el.matches?.('[data-bg-color]')) {
      const c = (el.getAttribute('data-bg-color') || '').toLowerCase();
      if (c === 'light' || c === 'dark') return c as Color;
    }
    el = el.parentElement;
  }
  return null;
}

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
  // We start from whatever pre-paint script set on <html data-scheme="...">
  let current: Color = currentRootScheme() ?? 'light';
  setScheme(current); // mirror to body + persist cookie

  const targets = Array.from(document.querySelectorAll<HTMLElement>('section[data-bg-color]'));
  if (targets.length === 0) {
    // Re-enable transitions even if there’s nothing to observe
    requestAnimationFrame(() => document.documentElement.classList.remove('no-theme-transitions'));
    return;
  }

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

  // Handle viewport changes (orientation/resize) gracefully
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

  // Allow transitions after first frame
  requestAnimationFrame(() => document.documentElement.classList.remove('no-theme-transitions'));
}
