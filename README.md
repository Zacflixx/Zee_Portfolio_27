# Isaac Conteh — portfolio

Astro, static output, Markdown content, ~2 KB gzipped of vanilla JS on the home page. Deploys free on Netlify.

## Run it

```bash
npm install
npm run dev            # http://localhost:4321
npm run covers:measure # after adding/changing a cover (needs access to res.cloudinary.com)
npm run check          # lists every [ADD …], unconfirmed project and unmeasured cover
npm run build          # preview build, always succeeds
npm run build:prod     # runs check first and FAILS if anything is left. Netlify uses this.
```

## Edit content

| What | Where |
| --- | --- |
| Name, email, links, CV path | `src/data/site.ts` (set `emailConfirmed: true` once you approve the public email) |
| Hero, About teaser, Contact CTA | `src/components/Hero.astro`, `AboutTeaser.astro`, `ContactCta.astro` |
| About page / Contact page | `src/pages/about.astro`, `src/pages/contact.astro` |
| Colours, type, spacing | tokens at the top of `src/styles/global.css` |

Unknown text is a visible `[ADD …]` marker. `npm run check` finds them all.

## Add a project to the gallery

Append one object to `raw` in `src/data/projects.ts` (id, title, category, one-line descriptor, alt text written from the cover, Cloudinary path after `/upload/`). Then run `npm run covers:measure` to record its real width, height and dominant colour. Optional: add its Behance URL or live site to the `behance` / `live` maps in the same file. The gallery lays covers out in justified rows from their real ratios, so no cropping or layout code is needed. Images are always served through `src/lib/cloudinary.ts` (`f_auto,q_auto`, 480/720/960 grid widths, 1600 lightbox), never as raw PNGs.

## Add a case study

Copy `src/content/case-studies/_template.md` to `src/content/case-studies/<slug>.md`, fill in the frontmatter (`project` is a project id from `projects.ts`; `timeline` and `team` are optional, so leave out what you can't state honestly), and add `featured: true, caseStudy: '<slug>'` to that project's entry in `projects.ts` to get the badge, the link and a card in the Featured section. Sections are plain Markdown headings. The before/after slider is the `<figure class="compare" data-compare>` block in the template. Delete the "Handoff & build notes" section if you don't need it.

## Replace images and the CV

- Case-study placeholders: overwrite files in `public/placeholders/` or point the Markdown at new images.
- CV: put the PDF at `public/isaac-conteh-cv.pdf`. The Download CV button on About appears automatically once the file exists.
- Open Graph image is built from the Flixx Jobs cover (`ogImage()` in `cloudinary.ts`).

## Deploy to Netlify

1. Push this repo to GitHub.
2. Netlify → Add new site → Import from Git → pick the repo.
3. Build command `npm run build:prod`, publish directory `dist` (also set in `netlify.toml`).
4. Domain: Site settings → Domain management → Add a domain, then follow the DNS steps. Netlify sets `URL`, which the sitemap, canonical URLs and Open Graph tags use.
5. The old `isaac2026.netlify.app` can stay as is, or you can redirect it here once you approve this site.

## Re-run Lighthouse

```bash
npm run build && npm run preview &
npm run lighthouse
```

Targets: 95+ in all four categories on mobile, JS under 30 KB gzipped, INP under 200 ms.

## Homepage 2 (experimental)

`/home-2` is a second, more expressive homepage for comparison: cool grey and electric blue, Bricolage Grotesque, light theme by default (its theme choice is stored separately from Homepage 1). The header's **Homepage 1 / 2** switch flips between them. It is marked `noindex` and left out of the sitemap so it doesn't compete with the main homepage.

- Code: `src/pages/home-2.astro` (markup + styles), `src/scripts/home2.ts` (motion), `src/styles/design2.css` (tokens + font).
- Libraries, only on this page: [GSAP](https://gsap.com) + ScrollTrigger (pinning, scrubbed scroll animation, Flip layout transitions) and [Lenis](https://lenis.darkroom.engineering) (smooth scroll). About 51 KB gzipped together; Homepage 1 still ships ~2.4 KB.
- Sections: kinetic name over parallax covers → scroll-revealed manifesto → stacking "page-pile" strength cards → four-country route + velocity marquee of skills → project explorer (all 20 on one board, filter / sort / Mosaic · Sheet · List views, GSAP Flip glides cards to their new places) → full-screen case-study pile → scroll-speed marquee and magnetic email.
- With `prefers-reduced-motion` or without JS, everything is static and readable and the explorer is a plain grid.
- To make it the main homepage: swap the contents of `src/pages/index.astro` and `src/pages/home-2.astro` (and drop `noindex`).

## Keyboard

Ctrl/Cmd + K opens a quick-jump list (pages, case studies, every project, Behance, LinkedIn, copy email).

## Not on the site yet

Headshot, CV PDF, per-project Behance links for most covers, and the Medium/music links. Nothing breaks without them. Add them when ready.
