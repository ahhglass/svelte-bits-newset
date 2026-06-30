import { readFileSync, writeFileSync } from 'node:fs';
import { RU } from './prop-ru-translations.mjs';

const en = JSON.parse(readFileSync('scripts/prop-descriptions-en.json', 'utf8'));
const missing = en.filter((key) => !RU[key]);
if (missing.length) {
	console.error(`Missing ${missing.length} translations`);
	missing.slice(0, 15).forEach((s) => console.error(' -', s));
	process.exit(1);
}
const out = {};
for (const key of en) out[key] = RU[key];
writeFileSync('src/lib/i18n/propDescriptionsRu.json', JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${en.length} translations.`);
