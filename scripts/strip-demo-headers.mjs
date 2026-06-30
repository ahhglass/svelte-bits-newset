import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'src/lib/components/docs/pages';

for (const f of readdirSync(dir)) {
	if (!f.endsWith('Demo.svelte')) continue;
	const path = join(dir, f);
	let s = readFileSync(path, 'utf8');
	const before = s;
	s = s.replace(/\n<svelte:head><title>[^<]*<\/title><\/svelte:head>\n?/g, '\n');
	s = s.replace(/\n<h1 class="sub-category">[^<]*<\/h1>\n?/g, '\n');
	if (s !== before) {
		writeFileSync(path, s);
		console.log('stripped', f);
	}
}

console.log('done');
