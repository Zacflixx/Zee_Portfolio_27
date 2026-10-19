// Lists every remaining placeholder and unconfirmed item. Exits 1 if any are left (used by `npm run build:prod`).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = [...walk('src'), ...walk('public')].filter((f) => /\.(astro|md|ts|svg|json)$/.test(f) && !f.endsWith('covers.measured.json') && !/[\\/]_[^\\/]*$/.test(f)); // files starting with _ (the template) are skipped
const issues = [];

for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (f.endsWith('check.mjs')) return;
    for (const m of line.matchAll(/\[(?:ADD|CONFIRM)[^\]]*\]/g)) issues.push(`${f}:${i + 1}  ${m[0]}`);
  });
}

const src = readFileSync('src/data/projects.ts', 'utf8');
const ids = [...src.matchAll(/id: '([^']+)'.*?file:/g)].map((m) => m[1]);
const measured = JSON.parse(readFileSync('src/data/covers.measured.json', 'utf8'));
for (const id of ids) {
  if (!measured[id]) issues.push(`project "${id}": cover not measured (run npm run covers:measure)`);
}
if (/confirmed: false/.test(src)) issues.push('projects: titles/categories/alt text not yet confirmed (set confirmed/altVerified in src/data/projects.ts)');
if (/emailConfirmed: false/.test(readFileSync('src/data/site.ts', 'utf8'))) issues.push('site: public email not confirmed (src/data/site.ts)');

if (issues.length) {
  console.log(`\n${issues.length} item(s) left:\n`);
  issues.forEach((s) => console.log('  - ' + s));
  console.log('');
  process.exit(1);
}
console.log('check: nothing left to fill in.');
