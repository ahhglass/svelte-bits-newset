<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
	import GridMotion from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte';
	import source from '$lib/components/library/Backgrounds/GridMotion/GridMotion.svelte?raw';

	const items = [
		'https://i.pinimg.com/736x/c8/f7/3e/c8f73e385c777555fba6018ed26b983a.jpg',
		'https://i.pinimg.com/736x/57/93/91/579391af3975009a2253c8560a82a440.jpg',
		'https://i.pinimg.com/1200x/50/38/3b/50383b521a58fa81ee09562056bf22af.jpg',
		'https://i.pinimg.com/1200x/8d/3c/84/8d3c849991be446f542cc7e044461024.jpg',
		'https://i.pinimg.com/736x/b9/44/e0/b944e0e76dbb334a6ecab05c1a5e29cc.jpg',
		'https://i.pinimg.com/736x/83/cc/55/83cc55c63f9ce843b11756eb02680d83.jpg',
		'https://i.pinimg.com/1200x/25/0f/3d/250f3d5ac5bc3e7b9dda3a4bfe2db659.jpg',
		'https://i.pinimg.com/736x/ff/4d/46/ff4d46a50c33810d0fc344be51972c25.jpg',
		'https://i.pinimg.com/1200x/3f/7e/33/3f7e331850aa4bbf152ee3a16ac93538.jpg',
		'https://i.pinimg.com/736x/ca/aa/24/caaa24c5437de6aa06418f8a7a2526a9.jpg',
		'https://i.pinimg.com/1200x/79/07/db/7907db7f46e336feea845b383a84cb91.jpg',
		'https://i.pinimg.com/1200x/ab/9d/12/ab9d126c53f49f06cdcc433fe87aba3c.jpg',
		'https://i.pinimg.com/736x/c2/4d/d8/c24dd860b45f0b8408f6e2612c0aa1a0.jpg',
		'https://i.pinimg.com/originals/92/62/55/9262551f0d9c742e9eea2f4aefeb05fb.gif',
		'https://i.pinimg.com/736x/40/a8/2c/40a82c9175f6cd4cee52b415a1251f5d.jpg',
		'https://i.pinimg.com/1200x/79/13/9b/79139b1cafede2181961ca544bea43d5.jpg',
		'https://i.pinimg.com/736x/3d/43/3d/3d433de5a06fdcd41cdfd67a976fd3ac.jpg',
		'https://i.pinimg.com/736x/e4/9f/78/e49f78bf49e5c403167553afd138b170.jpg',
		'https://i.pinimg.com/1200x/ad/e4/53/ade453608e2e7c8ffc38bc8ba991cb50.jpg',
		'https://i.pinimg.com/736x/b0/c6/54/b0c6549ab6326d3d5c394251f1c1b5e3.jpg',
		'https://i.pinimg.com/736x/5e/a5/06/5ea506ef26ea59adbe64f190688fe58d.jpg',
		'https://i.pinimg.com/736x/cb/08/6d/cb086d4f6861862f8f3f5fa53cba8207.jpg',
		'https://i.pinimg.com/736x/3b/6b/00/3b6b00a5e04a810e6c794cecb8de741b.jpg',
		'https://i.pinimg.com/1200x/80/59/d3/8059d38c32507f259c733a595c53e525.jpg',
		'https://i.pinimg.com/1200x/49/3f/89/493f89951a46c6e4f5c99f2c9783b7bf.jpg',
		'https://i.pinimg.com/1200x/fd/47/bd/fd47bd009db05fb582c0c3d2ceedae53.jpg',
		'https://i.pinimg.com/736x/31/f4/97/31f497aa3afc76672ecacea8a2aab3c1.jpg',
		'https://i.pinimg.com/736x/db/d6/8b/dbd68b8860a77e1d15201b2938db5c02.jpg'
	];

	const D = { gradientColor: '#14110E' };
	let gradientColor = $state(D.gradientColor);
	let showContent = $state(true);

	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';

	const hasChanges = $derived(gradientColor !== D.gradientColor);
	function reset() {
		gradientColor = D.gradientColor;
	}

	const usage = $derived(`${sO}
  import GridMotion from '$lib/components/GridMotion.svelte';
${sC}

<div style="height: 100vh">
  <GridMotion items={[...]} gradientColor="${gradientColor}" />
</div>`);

	const props: PropRow[] = [
		{ name: 'items', type: 'string[]', default: '[]', description: 'Items rendered in the grid (text or image URL).' },
		{ name: 'gradientColor', type: 'string', default: '"black"', description: 'Background radial gradient color.' }
	];
</script>



<TabsLayout onreset={reset} {hasChanges} componentName="GridMotion" {usage} {source} {props}>
	{#snippet preview()}
		<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">
			<GridMotion {items} {gradientColor} />
			<BackgroundContentToggle {showContent} onToggle={(v) => (showContent = v)} />
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="grid-motion" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title="Gradient Color" value={gradientColor} onChange={(v) => (gradientColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
