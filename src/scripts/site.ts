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
  try { localStorage.setItem(root.dataset.design === '2' ? 'theme2' : 'theme', next); } catch {}
});

/* Copy email */
$$('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy!); say('Email copied'); }
    catch { say(b.dataset.copy!); }
  }),
);

/* Live local clock: the visitor's own city (from their time zone) and time. Falls back to Doha. Updates only while visible. */
const clock = $('[data-clock]');
if (clock) {
  let zone = 'Asia/Qatar', city = 'Doha';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = tz.split('/');
    if (tz && parts.length > 1 && parts[0] !== 'Etc') { zone = tz; city = parts[parts.length - 1].replace(/_/g, ' '); if (tz === 'Asia/Qatar') city = 'Doha'; }
  } catch {}
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: zone });
  const tick = () => { if (!document.hidden) clock.textContent = `${city}, ${fmt.format(new Date())}`; };
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
    $('#lb-desc')!.textContent = a.dataset.descriptor!;
    ($('#lb-link') as HTMLAnchorElement).href = a.dataset.behance!;
    const live = $<HTMLAnchorElement>('#lb-live')!;
    live.hidden = !a.dataset.live;
    if (a.dataset.live) live.href = a.dataset.live;
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

/* Quick jump: Ctrl/Cmd+K. Pages, case studies, projects and links in one filterable list. */
const qj = $<HTMLDialogElement>('#qj');
if (qj && typeof qj.showModal === 'function') {
  const input = $<HTMLInputElement>('#qj-input')!;
  const rows = $$<HTMLLIElement>('li', qj);
  let sel = 0;
  const visible = () => rows.filter((r) => !r.hidden);
  const mark = () => visible().forEach((r, i) => r.setAttribute('aria-selected', String(i === sel)));
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    rows.forEach((r) => (r.hidden = !!q && !r.dataset.q!.includes(q)));
    sel = 0; mark();
  };
  const go = (r?: HTMLLIElement) => {
    if (!r) return;
    const href = r.dataset.href!;
    qj.close();
    if (href === '#copy') navigator.clipboard.writeText(r.dataset.email!).then(() => say('Email copied'), () => say(r.dataset.email!));
    else if (/^https?:/.test(href)) open(href, '_blank', 'noopener');
    else location.href = href;
  };
  const toggle = () => {
    if (qj.open) return qj.close();
    qj.hidden = false; input.value = ''; filter(); qj.showModal(); input.focus();
  };
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggle(); }
  });
  input.addEventListener('input', filter);
  qj.addEventListener('keydown', (e) => {
    const n = visible().length;
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; mark(); visible()[sel]?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; mark(); visible()[sel]?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); go(visible()[sel]); }
  });
  qj.addEventListener('click', (e) => {
    const r = (e.target as HTMLElement).closest<HTMLLIElement>('li');
    if (r) go(r); else if (e.target === qj) qj.close();
  });
}
