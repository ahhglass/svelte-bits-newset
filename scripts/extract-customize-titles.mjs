import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/lib/components/docs/pages';
const titles = new Set();

for (const f of readdirSync(dir)) {
	if (!f.endsWith('Demo.svelte')) continue;
	const s = readFileSync(join(dir, f), 'utf8');
	for (const m of s.matchAll(/title="([^"]+)"/g)) titles.add(m[1]);
	for (const m of s.matchAll(/title='([^']+)'/g)) titles.add(m[1]);
}

writeFileSync('scripts/customize-titles-en.json', JSON.stringify([...titles].sort(), null, 2));
console.log('count', titles.size);
