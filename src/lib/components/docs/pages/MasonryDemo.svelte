<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Masonry, { type MasonryItem } from '$lib/components/library/Components/Masonry/Masonry.svelte';
	import source from '$lib/components/library/Components/Masonry/Masonry.svelte?raw';

	const DEFAULTS = {
		ease: 'power3.out', animateFrom: 'bottom' as const, duration: 0.6, stagger: 0.05,
		scaleOnHover: true, blurToFocus: true, colorShiftOnHover: false
	};
	let ease = $state(DEFAULTS.ease);
	let animateFrom = $state<'top' | 'bottom' | 'left' | 'right' | 'center' | 'random'>(DEFAULTS.animateFrom);
	let duration = $state(DEFAULTS.duration);
	let stagger = $state(DEFAULTS.stagger);
	let scaleOnHover = $state(DEFAULTS.scaleOnHover);
	let blurToFocus = $state(DEFAULTS.blurToFocus);
	let colorShiftOnHover = $state(DEFAULTS.colorShiftOnHover);
	let key = $state(0);

	const items: MasonryItem[] = [
		{ id: '1', img: 'https://i.pinimg.com/1200x/73/3b/a4/733ba41e52f113447d0301657f8f9626.jpg', url: '#', height: 400 },
		{ id: '2', img: 'https://i.pinimg.com/1200x/2e/89/1d/2e891d65229f610539a555af61a0ab01.jpg', url: '#', height: 250 },
		{ id: '3', img: 'https://i.pinimg.com/1200x/bd/ad/38/bdad3835988dcff02bd0bd5f945d8518.jpg', url: '#', height: 600 },
		{ id: '4', img: 'https://i.pinimg.com/736x/2c/ad/b1/2cadb1a8524b385756ac97c2c75ec045.jpg', url: '#', height: 260 },
		{ id: '5', img: 'https://i.pinimg.com/1200x/65/91/05/6591054ce971224803a03bda9bf3afba.jpg', url: '#', height: 120 },
		{ id: '6', img: 'https://i.pinimg.com/736x/d0/c1/91/d0c191289bd779ac9fbf7501f26181ff.jpg', url: '#', height: 850 },
		{ id: '7', img: 'https://i.pinimg.com/1200x/1e/16/83/1e16832c31dbc3cf458fd8b9541b19be.jpg', url: '#', height: 720 },
		{ id: '8', img: 'https://i.pinimg.com/1200x/13/6a/a7/136aa7dd55fd5efb7b17ce81979e32b3.jpg', url: '#', height: 200 },
		{ id: '9', img: 'https://i.pinimg.com/736x/3a/56/85/3a56851a78cd2e0ce81e9b7f88c57228.jpg', url: '#', height: 350 },
		{ id: '10', img: 'https://i.pinimg.com/736x/49/66/6f/49666ffc9cdfd3192abbbdc3a3c6fb67.jpg', url: '#', height: 300 },
		{ id: '11', img: 'https://i.pinimg.com/1200x/f2/62/0f/f2620f8497ad469aae60e3f83f0d443f.jpg', url: '#', height: 350 },
		{ id: '12', img: 'https://i.pinimg.com/1200x/fb/59/1b/fb591bc255d2c2b8868674260d109762.jpg', url: '#', height: 240 },
		{ id: '13', img: 'https://i.pinimg.com/736x/cb/b7/8e/cbb78e87f6eace5cbc99bbf611f81bd1.jpg', url: '#', height: 320 },
		{ id: '14', img: 'https://i.pinimg.com/736x/50/bc/77/50bc772624c66d2884999847f05524c5.jpg', url: '#', height: 290 },
		{ id: '15', img: 'https://i.pinimg.com/736x/e0/39/74/e039742ade150178448f70b8cae1f113.jpg', url: '#', height: 220 },
		{ id: '16', img: 'https://i.pinimg.com/1200x/1a/3e/79/1a3e792e7628921ff317430173d6a09b.jpg', url: '#', height: 230 }
	];

	const easeOptions = ['power1.out', 'power2.out', 'power3.out', 'power4.out', 'back.out', 'bounce.out', 'elastic.out', 'sine.out'];
	const animateFromOptions = ['top', 'bottom', 'left', 'right', 'center', 'random'];

	const hasChanges = $derived(
		ease !== DEFAULTS.ease || animateFrom !== DEFAULTS.animateFrom ||
		duration !== DEFAULTS.duration || stagger !== DEFAULTS.stagger ||
		scaleOnHover !== DEFAULTS.scaleOnHover || blurToFocus !== DEFAULTS.blurToFocus ||
		colorShiftOnHover !== DEFAULTS.colorShiftOnHover
	);
	function reset() {
		ease = DEFAULTS.ease; animateFrom = DEFAULTS.animateFrom;
		duration = DEFAULTS.duration; stagger = DEFAULTS.stagger;
		scaleOnHover = DEFAULTS.scaleOnHover; blurToFocus = DEFAULTS.blurToFocus;
		colorShiftOnHover = DEFAULTS.colorShiftOnHover; key++;
	}

	const usage = `<Masonry items={items} ease="power3.out" animateFrom="bottom" duration={0.6} stagger={0.05} scaleOnHover blurToFocus />`;
	const props: PropRow[] = [
		{ name: 'items', type: 'MasonryItem[]', default: '-', description: 'Items to display in the masonry layout.' },
		{ name: 'ease', type: 'string', default: '"power3.out"', description: 'GSAP easing function.' },
		{ name: 'duration', type: 'number', default: '0.6', description: 'Animation duration (s).' },
		{ name: 'stagger', type: 'number', default: '0.05', description: 'Stagger between items (s).' },
		{ name: 'animateFrom', type: 'string', default: '"bottom"', description: "Direction items animate from." },
		{ name: 'scaleOnHover', type: 'boolean', default: 'true', description: 'Scale items on hover.' },
		{ name: 'hoverScale', type: 'number', default: '0.95', description: 'Scale value on hover.' },
		{ name: 'blurToFocus', type: 'boolean', default: 'true', description: 'Animate blur to focus on entry.' },
		{ name: 'colorShiftOnHover', type: 'boolean', default: 'false', description: 'Color overlay on hover.' }
	];
</script>


<TabsLayout onreset={reset} {hasChanges} componentName="Masonry" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:700px;overflow:hidden;padding:1.5rem;">
			{#key key}
				<Masonry {items} {ease} {animateFrom} {duration} {stagger} {scaleOnHover} {blurToFocus} {colorShiftOnHover} />
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="masonry" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect title="Ease" options={easeOptions} value={ease} onChange={(v) => { ease = v; key++; }} />
			<PreviewSelect title="Animate From" options={animateFromOptions} value={animateFrom} onChange={(v) => { animateFrom = v as typeof animateFrom; key++; }} />
			<PreviewSlider title="Duration" min={0.1} max={2.0} step={0.1} value={duration} onChange={(v) => (duration = v)} />
			<PreviewSlider title="Stagger" min={0.01} max={0.2} step={0.01} value={stagger} onChange={(v) => (stagger = v)} />
			<PreviewSwitch title="Scale on Hover" checked={scaleOnHover} onChange={(v) => (scaleOnHover = v)} />
			<PreviewSwitch title="Blur to Focus" checked={blurToFocus} onChange={(v) => { blurToFocus = v; key++; }} />
			<PreviewSwitch title="Color Shift on Hover" checked={colorShiftOnHover} onChange={(v) => (colorShiftOnHover = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
