// Downloads each original cover once and records real dimensions + dominant colour.
// Run where res.cloudinary.com is reachable:  npm run covers:measure
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const src = await import('node:fs').then((fs) => fs.readFileSync('src/data/projects.ts', 'utf8'));
const rows = [...src.matchAll(/id: '([^']+)'.*?file: '([^']+)'/g)].map((m) => ({ id: m[1], file: m[2] }));
const base = 'https://res.cloudinary.com/dfzgqsya9/image/upload/';
const out = {};

for (const { id, file } of rows) {
  const full = await fetch(base + file);
  if (!full.ok) throw new Error(`${id}: HTTP ${full.status}`);
  const buf = Buffer.from(await full.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const { dominant } = await sharp(buf).resize(64).stats();
  const hex = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  out[id] = { width: meta.width, height: meta.height, dominantColor: hex };
  console.log(id.padEnd(20), `${meta.width}x${meta.height}`, hex);
}
writeFileSync('src/data/covers.measured.json', JSON.stringify(out, null, 2) + '\n');
console.log('\nWrote src/data/covers.measured.json');
