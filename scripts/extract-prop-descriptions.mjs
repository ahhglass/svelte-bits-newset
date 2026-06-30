import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/lib/components/docs/pages';
const descs = new Set();

for (const f of readdirSync(dir)) {
	if (!f.endsWith('Demo.svelte')) continue;
	const s = readFileSync(join(dir, f), 'utf8');
	for (const m of s.matchAll(/description:\s*'((?:\\'|[^'])*)'/g)) {
		descs.add(m[1].replace(/\\'/g, "'"));
	}
	for (const m of s.matchAll(/description:\s*"([^"]*)"/g)) {
		descs.add(m[1]);
	}
}

const sorted = [...descs].sort();
writeFileSync('scripts/prop-descriptions-en.json', JSON.stringify(sorted, null, 2));
console.log('count', sorted.length);
