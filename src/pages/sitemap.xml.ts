import { getCollection } from 'astro:content';

export const GET = async ({ site }: { site: URL }) => {
  const studies = await getCollection('case-studies');
  const paths = ['/', '/about', '/contact', ...studies.map((s) => `/work/${s.id}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
