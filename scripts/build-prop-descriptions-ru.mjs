// scripts/build-prop-descriptions-ru.mjs — merge EN source + overrides → propDescriptionsRu.json
import { readFileSync, writeFileSync } from 'node:fs';
import OVERRIDES from './prop-descriptions-ru-overrides.json' with { type: 'json' };
import REST from './prop-descriptions-ru-overrides-rest.json' with { type: 'json' };

const en = JSON.parse(readFileSync('scripts/prop-descriptions-en.json', 'utf8'));
const allOverrides = { ...REST, ...OVERRIDES };

const map = {};
for (const key of en) {
	const ru = allOverrides[key];
	if (!ru || ru === key) {
		console.error(`Missing or untranslated: ${key}`);
		process.exit(1);
	}
	map[key] = ru;
}

writeFileSync('src/lib/i18n/propDescriptionsRu.json', JSON.stringify(map, null, 2) + '\n');
console.log(`Written ${Object.keys(map).length} entries`);
