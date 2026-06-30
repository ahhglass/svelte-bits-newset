import { CATEGORIES, GET_STARTED_SLUG, IMPLEMENTED_DEMOS } from './categories';

export type ComponentIndexItem = {
	key: string;
	categoryLabel: string;
	title: string;
	to: string;
	videoBase: string;
};

function videoName(slug: string) {
	return slug.replace(/-/g, '');
}

export const COMPONENT_INDEX_ITEMS: ComponentIndexItem[] = CATEGORIES.filter(
	(category) => category.slug !== GET_STARTED_SLUG
)
	.flatMap((category) =>
		category.subcategories
			.filter((item) => IMPLEMENTED_DEMOS.has(item.slug))
			.map((item) => ({
				key: `${category.slug}/${item.slug}`,
				categoryLabel: category.label,
				title: item.label,
				to: `/${category.slug}/${item.slug}`,
				videoBase: `/video/${videoName(item.slug)}`
			}))
	)
	.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
