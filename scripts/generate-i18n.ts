import { readFileSync, writeFileSync } from 'node:fs';

/** Regenerate propDescriptionsRu.json only when translate.ts EXACT map changes. */
const descriptions = JSON.parse(readFileSync('scripts/prop-descriptions-en.json', 'utf8')) as string[];
const existing = JSON.parse(
	readFileSync('src/lib/i18n/propDescriptionsRu.json', 'utf8')
) as Record<string, string>;

let missing = 0;
for (const en of descriptions) {
	if (!existing[en]) missing++;
}

console.log(`propDescriptionsRu.json: ${Object.keys(existing).length} entries, ${missing} missing from en list`);
