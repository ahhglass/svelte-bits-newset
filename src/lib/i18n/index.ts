import propDescriptionsRu from './propDescriptionsRu.json';

/** Returns Russian prop description or original English if not mapped. */
export function tPropDescription(description: string): string {
	return propDescriptionsRu[description as keyof typeof propDescriptionsRu] ?? description;
}
