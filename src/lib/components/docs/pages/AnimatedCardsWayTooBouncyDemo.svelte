<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import AnimatedCardsWayTooBouncy from '$lib/components/library/Components/AnimatedCardsWayTooBouncy/AnimatedCardsWayTooBouncy.svelte';
	import source from '$lib/components/library/Components/AnimatedCardsWayTooBouncy/AnimatedCardsWayTooBouncy.svelte?raw';

	const CARD_IMAGES = [
		'https://i.pinimg.com/1200x/fc/17/e6/fc17e6820fc637e5fc7acc9e362ac9d9.jpg',
		'https://i.pinimg.com/736x/bd/3b/03/bd3b03ed1b2d2c01d9402b516898832c.jpg',
		'https://i.pinimg.com/736x/2a/04/10/2a0410d8e176e653bc2361cf2f9ce1a6.jpg',
		'https://i.pinimg.com/736x/a7/ef/c4/a7efc4c37395e3a170ace10de01d2604.jpg'
	];

	const DEFAULTS = {
		pushForce: 10,
		springStiffness: 0.05,
		bounceFriction: 0.85,
		backgroundColor: '#141414'
	};

	let pushForce = $state(DEFAULTS.pushForce);
	let springStiffness = $state(DEFAULTS.springStiffness);
	let bounceFriction = $state(DEFAULTS.bounceFriction);
	let backgroundColor = $state(DEFAULTS.backgroundColor);
	let demoKey = $state(0);

	const hasChanges = $derived(
		pushForce !== DEFAULTS.pushForce ||
			springStiffness !== DEFAULTS.springStiffness ||
			bounceFriction !== DEFAULTS.bounceFriction ||
			backgroundColor !== DEFAULTS.backgroundColor
	);

	function reset() {
		pushForce = DEFAULTS.pushForce;
		springStiffness = DEFAULTS.springStiffness;
		bounceFriction = DEFAULTS.bounceFriction;
		backgroundColor = DEFAULTS.backgroundColor;
		demoKey++;
	}

	const bump = () => {
		demoKey++;
	};

	const customizeLabels = {
		pushForce: 'Push Force',
		springStiffness: 'Spring Stiffness',
		bounceFriction: 'Bounce Friction',
		backgroundColor: 'Background'
	} as const;

	const usage = $derived(
		`<AnimatedCardsWayTooBouncy
  images={[
    '/assets/magnetic-cards/card-img-1.jpg',
    '/assets/magnetic-cards/card-img-2.jpg',
    '/assets/magnetic-cards/card-img-3.jpg',
    '/assets/magnetic-cards/card-img-4.jpg'
  ]}
  pushForce={${pushForce}}
  springStiffness={${springStiffness}}
  bounceFriction={${bounceFriction}}
  backgroundColor="${backgroundColor}"
/>`
	);

	const props: PropRow[] = [
		{ name: 'images', type: 'string[]', default: '4 card images', description: 'Card image URLs.' },
		{ name: 'layouts', type: 'MagneticCardLayout[]', default: 'tutorial layout', description: 'Rest position and rotation for each card.' },
		{ name: 'backgroundColor', type: 'string', default: '"#141414"', description: 'Spotlight background color.' },
		{ name: 'cardSize', type: 'number', default: '250', description: 'Card width and height in pixels.' },
		{ name: 'cardRadius', type: 'string', default: '"1rem"', description: 'Border radius for cards.' },
		{ name: 'proximityRadius', type: 'number', default: '500', description: 'Cursor influence radius in pixels.' },
		{ name: 'pushForce', type: 'number', default: '10', description: 'Force multiplier from cursor velocity.' },
		{ name: 'tiltAmount', type: 'number', default: '0.1', description: 'Rotation response to horizontal push.' },
		{ name: 'neighborInfluence', type: 'number', default: '0.2', description: 'How much adjacent cards affect each other.' },
		{ name: 'springStiffness', type: 'number', default: '0.05', description: 'Spring tension back to rest position.' },
		{ name: 'bounceFriction', type: 'number', default: '0.85', description: 'Velocity damping (lower = bouncier).' },
		{ name: 'cursorSmoothing', type: 'number', default: '0.75', description: 'Cursor velocity smoothing factor.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root container.' }
	];
</script>

<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="AnimatedCardsWayTooBouncy"
	{usage}
	{source}
	{props}
>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:560px;padding:0;overflow:hidden;">
			<p class="demo-hint">Быстро двигайте курсор — карточки отталкиваются с пружинной физикой</p>
			{#key demoKey}
				<AnimatedCardsWayTooBouncy
					images={CARD_IMAGES}
					{pushForce}
					{springStiffness}
					{bounceFriction}
					{backgroundColor}
					class="absolute inset-0"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="animated-cards-way-too-bouncy" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title={customizeLabels.pushForce}
				min={0}
				max={24}
				step={1}
				value={pushForce}
				onChange={(v) => {
					pushForce = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.springStiffness}
				min={0.01}
				max={0.15}
				step={0.005}
				value={springStiffness}
				onChange={(v) => {
					springStiffness = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.bounceFriction}
				min={0.6}
				max={0.98}
				step={0.01}
				value={bounceFriction}
				onChange={(v) => {
					bounceFriction = v;
					bump();
				}}
			/>
			<PreviewColorPicker
				title={customizeLabels.backgroundColor}
				value={backgroundColor}
				onChange={(v) => {
					backgroundColor = v;
					bump();
				}}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.demo-hint {
		position: absolute;
		top: 0.85rem;
		left: 50%;
		z-index: 20;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.55;
		mix-blend-mode: difference;
		text-align: center;
		pointer-events: none;
		user-select: none;
		max-width: min(92%, 26rem);
		line-height: 1.35;
	}
</style>
