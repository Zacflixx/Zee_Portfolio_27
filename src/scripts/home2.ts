// Homepage 2 motion layer. Everything here is an enhancement: without JS (or with reduced motion)
// the page is a static, fully readable layout with a natively scrollable reel.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, Flip);

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/* ---------- Lightbox (all modes) ---------- */
type Item = { t: string; c: string; d: string; a: string; img: string; b: string; l: string | null };
const data: Item[] = JSON.parse($('#x-data')?.textContent || '[]');
const dlg = $<HTMLDialogElement>('#x-lightbox');
if (dlg && typeof dlg.showModal === 'function') {
  const img = $<HTMLImageElement>('#x-lb-img')!;
  const live = $<HTMLAnchorElement>('#x-lb-live')!;
  const openable = [...new Set($$('[data-open]').map((a) => Number(a.dataset.open)))].sort((a, b) => a - b);
  let cur = 0;
  const show = (i: number) => {
    cur = i;
    const it = data[i];
    img.src = it.img;
    img.alt = it.a;
    $('#x-lb-title')!.textContent = it.t;
    $('#x-lb-cat')!.textContent = it.c;
    $('#x-lb-desc')!.textContent = it.d;
    $<HTMLAnchorElement>('#x-lb-link')!.href = it.b;
    live.hidden = !it.l;
    if (it.l) live.href = it.l;
  };
  const step = (d: number) => show(openable[(openable.indexOf(cur) + d + openable.length) % openable.length]);
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-open]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    show(Number(a.dataset.open));
    dlg.showModal();
  });
  $('#x-lb-prev')!.addEventListener('click', () => step(-1));
  $('#x-lb-next')!.addEventListener('click', () => step(1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  let sx = 0;
  img.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ---------- Work explorer: filter, sort, view; Flip glides everything to its new place ---------- */
const board = $('[data-board]');
if (board) {
  const cards = $$('.pj', board);
  const bar = $('[data-bar]');
  const countEl = $('[data-count]');
  const catOrder = ['Mobile app', 'Website', 'Dashboard'];
  let filter = 'All', sort = 'featured', view = 'mosaic';

  const matches = (c: HTMLElement) => filter === 'All' || (filter === 'Case study' ? c.dataset.feat === '1' : c.dataset.cat === filter);
  const sorters: Record<string, (a: HTMLElement, b: HTMLElement) => number> = {
    featured: (a, b) => Number(b.dataset.feat) - Number(a.dataset.feat) || Number(a.dataset.i) - Number(b.dataset.i),
    az: (a, b) => a.dataset.title!.localeCompare(b.dataset.title!),
    type: (a, b) => catOrder.indexOf(a.dataset.cat!) - catOrder.indexOf(b.dataset.cat!) || Number(a.dataset.i) - Number(b.dataset.i),
  };

  // Masonry: 6px tracks, each card spans as many as its tile is tall
  const layout = () => {
    if (view !== 'mosaic') return cards.forEach((c) => c.style.removeProperty('--rows'));
    cards.filter((c) => !c.hidden).forEach((c) => {
      const h = c.firstElementChild!.getBoundingClientRect().height;
      c.style.setProperty('--rows', String(Math.ceil((h + 34) / 6)));
    });
  };

  const apply = () => {
    cards.forEach((c) => (c.hidden = !matches(c)));
    [...cards].sort(sorters[sort]).forEach((c) => board.appendChild(c));
    board.dataset.view = view;
    if (countEl) countEl.textContent = String(cards.filter((c) => !c.hidden).length);
    layout();
  };

  const update = () => {
    if (reduced) { apply(); return; }
    const state = Flip.getState(cards);
    apply();
    Flip.from(state, {
      duration: 0.85, ease: 'power3.inOut', stagger: 0.015, absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.25 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.6, duration: 0.4 }),
      onComplete: () => { layout(); ScrollTrigger.refresh(); },
    });
  };

  const wire = (attr: string, set: (v: string) => void) => {
    const btns = $$<HTMLButtonElement>(`[${attr}]`, bar!);
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      set(b.getAttribute(attr)!);
      update();
    }));
  };
  wire('data-filter', (v) => (filter = v));
  wire('data-sort', (v) => (sort = v));
  wire('data-view-btn', (v) => (view = v));

  // Re-measure on resize and once images/fonts settle
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(layout, 120); });
  document.fonts?.ready.then(layout);
  apply(); // default sort (featured first) from the start

  // Tilt: fine pointers, transform only
  if (finePointer && !reduced) {
    let raf = 0;
    board.addEventListener('pointermove', (e) => {
      const frame = (e.target as HTMLElement).closest<HTMLElement>('.frame');
      if (!frame) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = frame.getBoundingClientRect();
        frame.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2)}deg`);
        frame.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2)}deg`);
      });
    });
    board.addEventListener('pointerout', (e) => {
      const frame = (e.target as HTMLElement).closest<HTMLElement>('.frame');
      frame?.style.removeProperty('--rx'); frame?.style.removeProperty('--ry');
    });
  }

  // List view: a cover follows the cursor
  const preview = $('.preview');
  if (preview && finePointer) {
    const pImg = $<HTMLImageElement>('img', preview)!;
    const px = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3' });
    board.addEventListener('pointerover', (e) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-preview]');
      if (!a || view !== 'list') return preview.classList.remove('on');
      if (pImg.getAttribute('src') !== a.dataset.preview) pImg.src = a.dataset.preview!;
      pImg.style.background = a.dataset.color!;
      preview.classList.add('on');
    });
    board.addEventListener('pointermove', (e) => { px(e.clientX + 200); py(e.clientY); });
    board.addEventListener('pointerleave', () => preview.classList.remove('on'));
  }
}

/* ---------- Motion (skipped entirely under prefers-reduced-motion) ---------- */
if (!reduced) {
  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // 1 · Hero: letters rise in, covers drift in from depth
  gsap.from('.name .c', { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.045, delay: 0.05 });
  gsap.from('.fl img', { opacity: 0, scale: 0.5, duration: 1.6, ease: 'expo.out', stagger: 0.07, delay: 0.15 });
  gsap.from('.hero-foot > *', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.6 });

  // Name splits apart and covers float up at their own depth as you scroll away
  const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.name .ln:not(.ln2)', { xPercent: -18, ease: 'none', scrollTrigger: heroST });
  gsap.to('.name .ln2', { xPercent: 18, ease: 'none', scrollTrigger: heroST });
  $$('.fl').forEach((el) => {
    const d = Number(el.dataset.depth);
    gsap.to(el, { y: -d * 420, ease: 'none', scrollTrigger: heroST });
  });

  // Covers lean towards the pointer, more for nearer ones
  if (finePointer) {
    const movers = $$('.fl img').map((img) => {
      const d = Number(img.parentElement!.dataset.depth);
      return { d, x: gsap.quickTo(img, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(img, 'y', { duration: 1, ease: 'power3' }) };
    });
    $('.hero')!.addEventListener('pointermove', (e) => {
      const mx = e.clientX / innerWidth - 0.5;
      const my = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => { m.x(mx * m.d * 70); m.y(my * m.d * 70); });
    });
  }

  // 2 · Manifesto: pinned, words light up as you scroll
  gsap.fromTo('.m-text .w:not(.hi)', { opacity: 0.5 }, {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: '.manifesto', start: 'top top+=64', end: '+=130%', pin: true, scrub: true },
  });

  // 3 · Strength cards: CSS sticky stacks them; each one recedes as the next lands on top
  const cards = $$('.card');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.fromTo($('.card-in', card), { scale: 1, yPercent: 0, filter: 'brightness(1)' }, {
      scale: 0.9, yPercent: -2, filter: 'brightness(0.7)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=64', scrub: true },
    });
  });
  $$('.card-art').forEach((art) =>
    gsap.fromTo(art, { y: 80, rotate: 4 }, { y: -40, rotate: -2, ease: 'none', scrollTrigger: { trigger: art.closest('.card'), start: 'top bottom', end: 'bottom top', scrub: true } }),
  );

  // 4 · Route: the line draws itself, stops pop in
  gsap.fromTo('.r-line i', { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.r-track', start: 'top 80%', end: 'bottom 55%', scrub: true } });
  gsap.from('.stop', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.r-track', start: 'top 75%' } });

  // Marquees: endless loops that speed up (and flip direction) with scroll velocity, paused off-screen
  const loop = (el: HTMLElement, dir: number, duration: number) => {
    const tw = gsap.fromTo(el, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive ? tw.play() : tw.pause()),
      onUpdate: (self) => {
        const v = self.getVelocity() / 600;
        gsap.to(tw, { timeScale: (self.direction === 1 ? 1 : -1) * Math.min(1 + Math.abs(v), 5), duration: 0.3, overwrite: true });
        gsap.to(tw, { timeScale: self.direction === 1 ? 1 : -1, duration: 1.2, delay: 0.3 });
      },
    });
    return tw;
  };
  $$('.mq-row').forEach((row) => loop($('.mq-in', row)!, Number(row.dataset.dir), 38));
  const big = $('[data-bigmq]');
  if (big) loop(big, 1, 30);

  // 5 · Work: cards rise in as they enter the viewport, in waves
  const boardCards = $$('.board .pj');
  if (boardCards.length) {
    gsap.set(boardCards, { opacity: 0, y: 70 });
    ScrollTrigger.batch(boardCards, {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, clearProps: 'opacity,transform' }),
    });
  }

  // 6 · Case studies: same page-pile idea, full screen
  const panels = $$('.panel');
  panels.forEach((panel, i) => {
    const next = panels[i + 1] ?? $('.contact');
    if (!next) return;
    gsap.fromTo($('.panel-in', panel), { scale: 1, borderRadius: 0, filter: 'brightness(1)' }, {
      scale: 0.88, borderRadius: 32, filter: 'brightness(0.6)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=64', scrub: true },
    });
    gsap.fromTo($('.p-art img', panel), { yPercent: 12 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 7 · Magnetic email and the cursor follower (fine pointers only)
  if (finePointer) {
    $$('[data-magnetic]').forEach((el) => {
      const inner = el.firstElementChild as HTMLElement;
      const mx = gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const my = gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });

    const cursor = $('.cursor');
    if (cursor) {
      root.classList.add('has-cursor');
      const label = $('span', cursor)!;
      const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
      const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
      addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); root.classList.add('cursor-on'); });
      document.addEventListener('pointerleave', () => root.classList.remove('cursor-on'));
      document.addEventListener('pointerover', (e) => {
        const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
        root.classList.toggle('cursor-big', !!t);
        label.textContent = t?.dataset.cursor ?? '';
      });
    }
  }

  // Fonts and lazy images change layout; re-measure once everything has settled
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}
