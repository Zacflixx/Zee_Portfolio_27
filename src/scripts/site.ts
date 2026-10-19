const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* Toast */
const toast = $('#toast');
let toastTimer = 0;
function say(msg: string) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2000);
}

/* Theme toggle: remembers the choice; the inline head script prevents a flash */
$('#theme-toggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
});

/* Copy email */
$$('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy!); say('Email copied'); }
    catch { say(b.dataset.copy!); }
  }),
);

/* Live Doha clock: updates only while visible */
const clock = $('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Qatar' });
  const tick = () => { if (!document.hidden) clock.textContent = `Doha, ${fmt.format(new Date())}`; };
  tick();
  setInterval(tick, 30_000);
  document.addEventListener('visibilitychange', tick);
}

/* Scroll reveal fallback (CSS scroll-driven animation handles supporting browsers) */
if (!CSS.supports('animation-timeline: view()') && !reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
}

/* Gallery: filter, tilt, lightbox */
const grid = $('#grid');
if (grid) {
  const items = $$('.item', grid);

  // Filter chips with an animated reorder via View Transitions (instant fallback)
  const chips = $$<HTMLButtonElement>('.chip');
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat!;
      const apply = () => {
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        items.forEach((it) => { it.hidden = cat !== 'all' && it.dataset.cat !== cat; });
      };
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      if (doc.startViewTransition && !reduced) {
        items.forEach((it, i) => (it.style.viewTransitionName = `p${i}`));
        const vt = doc.startViewTransition(apply) as { finished: Promise<void> };
        vt.finished.finally(() => items.forEach((it) => (it.style.viewTransitionName = '')));
      } else apply();
    }),
  );

  // Pointer-aware tilt: desktop fine pointers only, transform only, rAF-throttled
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
    let raf = 0;
    grid.addEventListener('pointermove', (e) => {
      const frame = (e.target as HTMLElement).closest<HTMLElement>('.frame');
      if (!frame) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = frame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
        frame.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      });
    });
    grid.addEventListener('pointerout', (e) => {
      const frame = (e.target as HTMLElement).closest<HTMLElement>('.frame');
      frame?.style.removeProperty('--rx');
      frame?.style.removeProperty('--ry');
    });
  }

  // Lightbox (native <dialog>: focus trap and Esc come for free)
  const dlg = $<HTMLDialogElement>('#lightbox')!;
  const img = $<HTMLImageElement>('#lb-img')!;
  let current: HTMLAnchorElement | null = null;
  const opener = () => $$<HTMLAnchorElement>('.tile[data-open]', grid).filter((a) => !a.closest<HTMLElement>('.item')!.hidden);

  const show = (a: HTMLAnchorElement) => {
    current = a;
    img.src = a.dataset.full!;
    img.alt = a.dataset.alt!;
    $('#lb-title')!.textContent = a.dataset.title!;
    $('#lb-cat')!.textContent = a.dataset.category!;
    ($('#lb-link') as HTMLAnchorElement).href = a.dataset.behance!;
  };
  const step = (d: number) => {
    const list = opener();
    if (!current || !list.length) return;
    show(list[(list.indexOf(current) + d + list.length) % list.length]);
  };

  grid.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.tile[data-open]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    show(a);
    dlg.showModal();
  });
  $('#lb-prev')!.addEventListener('click', () => step(-1));
  $('#lb-next')!.addEventListener('click', () => step(1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click on backdrop

  // Swipe on touch
  let sx = 0;
  const stage = $('.stage', dlg)!;
  stage.addEventListener('touchstart', (e) => { sx = (e as TouchEvent).touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const dx = (e as TouchEvent).changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* Case study: active section in the sticky nav */
const toc = $$<HTMLAnchorElement>('.toc a');
if (toc.length && 'IntersectionObserver' in window) {
  const map = new Map(toc.map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      toc.forEach((a) => a.removeAttribute('aria-current'));
      map.get(e.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-20% 0px -70% 0px' });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
}
// Progress bar fallback where scroll-driven animations are missing
const bar = $('.progress');
if (bar && !CSS.supports('animation-timeline: scroll()')) {
  addEventListener('scroll', () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  }, { passive: true });
}

/* Before/after compare slider built on <input type="range"> */
$$('[data-compare]').forEach((fig, n) => {
  const [before, after] = $$<HTMLImageElement>('img', fig);
  if (!before || !after) return;
  const stack = document.createElement('div');
  stack.className = 'stack';
  after.className = 'after';
  after.setAttribute('aria-hidden', 'true');
  before.replaceWith(stack);
  stack.append(before, after);
  const range = document.createElement('input');
  range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
  range.id = `cmp-${n}`;
  range.setAttribute('aria-label', 'Drag to compare before and after');
  range.addEventListener('input', () => fig.style.setProperty('--pos', `${range.value}%`));
  const labels = document.createElement('div');
  labels.className = 'labels';
  labels.innerHTML = '<span>Before</span><span>After</span>';
  fig.append(range, labels);
  if (fig.dataset.caption) { const c = document.createElement('figcaption'); c.textContent = fig.dataset.caption; fig.append(c); }
});
