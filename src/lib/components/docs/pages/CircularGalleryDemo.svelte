<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CircularGallery, { type CircularGalleryItem } from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte';
	import source from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte?raw';

	const items: CircularGalleryItem[] = [
		{ image: 'https://i.pinimg.com/736x/a6/97/60/a697604c16e3d86b83b1cf3b06da1a42.jpg', text: 'Item 1' },
		{ image: 'https://i.pinimg.com/1200x/c9/70/79/c9707949e969fd0c80bb6d3c6eae2ae7.jpg', text: 'Item 2' },
		{ image: 'https://i.pinimg.com/736x/37/08/0d/37080d668d6ad4d0bb9744ad94dde367.jpg', text: 'Item 3' },
		{ image: 'https://i.pinimg.com/736x/f8/ca/6f/f8ca6ffeaecac40769434edea7e1b001.jpg', text: 'Item 4' },
		{ image: 'https://i.pinimg.com/736x/82/92/d7/8292d7783cec70bd9e0671f9230eb1c0.jpg', text: 'Item 5' },
		{ image: 'https://i.pinimg.com/736x/e5/e8/a4/e5e8a4a1fe63f77cfc1660e89d482ac6.jpg', text: 'Item 6' },
		{ image: 'https://i.pinimg.com/736x/bc/73/74/bc73742ca134df729c3379959b779bf2.jpg', text: 'Item 7' },
		{ image: 'https://i.pinimg.com/736x/a0/73/95/a073957fda9305ee674635ba5f7c1109.jpg', text: 'Item 8' },
		{ image: 'https://i.pinimg.com/1200x/46/29/2f/46292f80966a3ea24157da98c19dcb93.jpg', text: 'Item 9' },
		{ image: 'https://i.pinimg.com/736x/38/53/11/385311c967ac8aafc161e6ed078ff2b3.jpg', text: 'Item 10' },
		{ image: 'https://i.pinimg.com/736x/41/28/e3/4128e3db448a312a6f33a693e66b4561.jpg', text: 'Item 11' },
		{ image: 'https://i.pinimg.com/736x/a1/d6/d6/a1d6d63bc6a514385755ce14a64a4e79.jpg', text: 'Item 12' }
	];

	const DEFAULTS = { bend: 1, borderRadius: 0.05, scrollSpeed: 2, scrollEase: 0.05 };
	let bend = $state(DEFAULTS.bend);
	let borderRadius = $state(DEFAULTS.borderRadius);
	let scrollSpeed = $state(DEFAULTS.scrollSpeed);
	let scrollEase = $state(DEFAULTS.scrollEase);
	let key = $state(0);

	const hasChanges = $derived(
		bend !== DEFAULTS.bend || borderRadius !== DEFAULTS.borderRadius ||
		scrollSpeed !== DEFAULTS.scrollSpeed || scrollEase !== DEFAULTS.scrollEase
	);
	function reset() {
		bend = DEFAULTS.bend; borderRadius = DEFAULTS.borderRadius;
		scrollSpeed = DEFAULTS.scrollSpeed; scrollEase = DEFAULTS.scrollEase;
		key++;
	}

	const usage = `<CircularGallery bend={3} borderRadius={0.05} />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'Array<{image, text}>', default: '12 placeholder items', description: 'Gallery items.' },
		{ name: 'bend', type: 'number', default: '3', description: 'Curvature of the layout.' },
		{ name: 'textColor', type: 'string', default: '"#ffffff"', description: 'Title color.' },
		{ name: 'borderRadius', type: 'number', default: '0.05', description: 'Image corner radius.' },
		{ name: 'font', type: 'string', default: 'bold 30px Figtree', description: 'Title font.' },
		{ name: 'scrollSpeed', type: 'number', default: '2', description: 'Scroll velocity multiplier.' },
		{ name: 'scrollEase', type: 'number', default: '0.05', description: 'Smoothing factor.' }
	];
</script>


<TabsLayout onreset={reset} {hasChanges} componentName="CircularGallery" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;">
			{#key key}
				<CircularGallery {items} {bend} {borderRadius} {scrollSpeed} {scrollEase} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="circular-gallery" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Bend Level" min={-10} max={10} step={1} value={bend} onChange={(v) => { bend = v; key++; }} />
			<PreviewSlider title="Border Radius" min={0} max={0.5} step={0.01} value={borderRadius} onChange={(v) => { borderRadius = v; key++; }} />
			<PreviewSlider title="Scroll Speed" min={0.5} max={5} step={0.1} value={scrollSpeed} onChange={(v) => { scrollSpeed = v; key++; }} />
			<PreviewSlider title="Scroll Ease" min={0.01} max={0.5} step={0.01} value={scrollEase} onChange={(v) => { scrollEase = v; key++; }} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
