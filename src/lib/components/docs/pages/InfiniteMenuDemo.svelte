<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import InfiniteMenu, { type InfiniteMenuItem } from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte';
	import source from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte?raw';

	const DEFAULTS = { scale: 1.0 };
	let scale = $state(DEFAULTS.scale);
	let key = $state(0);
	const hasChanges = $derived(scale !== DEFAULTS.scale);
	function reset() { scale = DEFAULTS.scale; key++; }

	const items: InfiniteMenuItem[] = [
		{ image: 'https://i.pinimg.com/736x/bc/73/74/bc73742ca134df729c3379959b779bf2.jpg', link: 'https://google.com/', title: 'Item 1', description: 'This is pretty cool, right?' },
		{ image: 'https://i.pinimg.com/736x/a0/73/95/a073957fda9305ee674635ba5f7c1109.jpg', link: 'https://google.com/', title: 'Item 2', description: 'This is pretty cool, right?' },
		{ image: 'https://i.pinimg.com/1200x/46/29/2f/46292f80966a3ea24157da98c19dcb93.jpg', link: 'https://google.com/', title: 'Item 3', description: 'This is pretty cool, right?' },
		{ image: 'https://i.pinimg.com/736x/38/53/11/385311c967ac8aafc161e6ed078ff2b3.jpg', link: 'https://google.com/', title: 'Item 4', description: 'This is pretty cool, right?' },
		{ image: 'https://i.pinimg.com/736x/41/28/e3/4128e3db448a312a6f33a693e66b4561.jpg', link: 'https://google.com/', title: 'Item 5', description: 'This is pretty cool, right?' },
		{ image: 'https://i.pinimg.com/736x/a1/d6/d6/a1d6d63bc6a514385755ce14a64a4e79.jpg', link: 'https://google.com/', title: 'Item 6', description: 'This is pretty cool, right?' }
	];

	const usage = `<InfiniteMenu items={items} scale={1} />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'InfiniteMenuItem[]', default: '[{...}]', description: 'Items with image, link, title, description.' },
		{ name: 'scale', type: 'number', default: '1.0', description: 'Camera zoom.' }
	];
</script>


<TabsLayout onreset={reset} {hasChanges} componentName="InfiniteMenu" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;">
			{#key key}
				<div style="height:500px;width:100%;overflow:hidden;">
					<InfiniteMenu {items} {scale} />
				</div>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="infinite-menu" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Scale" min={0.1} max={3} step={0.1} value={scale} onChange={(v) => (scale = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
