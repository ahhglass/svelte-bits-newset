<script lang="ts">
	import { browser } from '$app/environment';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CinematicSlider, {
		DEFAULT_CINEMATIC_SLIDES
	} from '$lib/components/library/Components/CinematicSlider/CinematicSlider.svelte';
	import source from '$lib/components/library/Components/CinematicSlider/CinematicSlider.svelte?raw';

	const DEFAULTS = {
		slideWidth: 300,
		slideHeight: 360,
		slideGap: 100,
		arcDepth: 180,
		centerLift: 40,
		scrollLerp: 0.05,
		wheelMultiplier: 0.5,
		showInfoBar: true
	};

	let slideWidth = $state(DEFAULTS.slideWidth);
	let slideHeight = $state(DEFAULTS.slideHeight);
	let slideGap = $state(DEFAULTS.slideGap);
	let arcDepth = $state(DEFAULTS.arcDepth);
	let centerLift = $state(DEFAULTS.centerLift);
	let scrollLerp = $state(DEFAULTS.scrollLerp);
	let wheelMultiplier = $state(DEFAULTS.wheelMultiplier);
	let showInfoBar = $state(DEFAULTS.showInfoBar);

	let isMobileViewport = $state(false);

	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(max-width: 768px)');
		const sync = () => {
			isMobileViewport = mq.matches;
		};
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	const previewSlideWidth = $derived(isMobileViewport ? Math.min(slideWidth, 210) : slideWidth);
	const previewSlideHeight = $derived(isMobileViewport ? Math.min(slideHeight, 280) : slideHeight);
	const previewSlideGap = $derived(isMobileViewport ? Math.min(slideGap, 72) : slideGap);
	const previewArcDepth = $derived(isMobileViewport ? Math.min(arcDepth, 120) : arcDepth);
	const previewCenterLift = $derived(isMobileViewport ? Math.min(centerLift, 28) : centerLift);

	const hasChanges = $derived(
		slideWidth !== DEFAULTS.slideWidth ||
			slideHeight !== DEFAULTS.slideHeight ||
			slideGap !== DEFAULTS.slideGap ||
			arcDepth !== DEFAULTS.arcDepth ||
			centerLift !== DEFAULTS.centerLift ||
			scrollLerp !== DEFAULTS.scrollLerp ||
			wheelMultiplier !== DEFAULTS.wheelMultiplier ||
			showInfoBar !== DEFAULTS.showInfoBar
	);

	function reset() {
		slideWidth = DEFAULTS.slideWidth;
		slideHeight = DEFAULTS.slideHeight;
		slideGap = DEFAULTS.slideGap;
		arcDepth = DEFAULTS.arcDepth;
		centerLift = DEFAULTS.centerLift;
		scrollLerp = DEFAULTS.scrollLerp;
		wheelMultiplier = DEFAULTS.wheelMultiplier;
		showInfoBar = DEFAULTS.showInfoBar;
	}

	const customizeLabels = {
		slideWidth: 'Slide Width',
		slideHeight: 'Slide Height',
		slideGap: 'Slide Gap',
		arcDepth: 'Arc Depth',
		centerLift: 'Center Lift',
		scrollLerp: 'Scroll Lerp',
		wheelMultiplier: 'Wheel Multiplier',
		showInfoBar: 'Show Info Bar'
	} as const;

	const usage = $derived(
		`<CinematicSlider
  slides={slides}
  slideWidth={${slideWidth}}
  slideHeight={${slideHeight}}
  slideGap={${slideGap}}
  arcDepth={${arcDepth}}
  centerLift={${centerLift}}
  scrollLerp={${scrollLerp}}
  wheelMultiplier={${wheelMultiplier}}
  showInfoBar={${showInfoBar}}
/>`
	);

	const props: PropRow[] = [
		{ name: 'slides', type: 'CinematicSlide[]', default: 'DEFAULT_CINEMATIC_SLIDES', description: 'Array of slides with image src and title.' },
		{ name: 'brandText', type: 'string', default: '"Svelte Bits™"', description: 'Brand label shown in the info bar.' },
		{ name: 'links', type: 'CinematicLink[]', default: '3 links', description: 'Optional links rendered in the info bar.' },
		{ name: 'showInfoBar', type: 'boolean', default: 'true', description: 'Show the bottom info bar with brand, title, and links.' },
		{ name: 'backgroundColor', type: 'string', default: '"#fafafa"', description: 'Slider background color.' },
		{ name: 'slideWidth', type: 'number', default: '320', description: 'Base slide width in px at center position.' },
		{ name: 'slideHeight', type: 'number', default: '420', description: 'Base slide height in px at center position.' },
		{ name: 'slideGap', type: 'number', default: '100', description: 'Horizontal spacing between slides on the track.' },
		{ name: 'arcDepth', type: 'number', default: '200', description: 'Vertical arc depth for the cinematic 3D layout.' },
		{ name: 'centerLift', type: 'number', default: '100', description: 'Extra lift applied to the centered slide.' },
		{ name: 'scrollLerp', type: 'number', default: '0.05', description: 'Scroll inertia smoothing factor (0–1).' },
		{ name: 'wheelMultiplier', type: 'number', default: '0.5', description: 'Wheel and touch scroll sensitivity multiplier.' }
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="CinematicSlider" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container cinematic-demo" style="position:relative;height:620px;overflow:hidden;padding:0;">
			<p class="demo-hint">Прокрутите колёсиком или свайпом — слайды двигаются по 3D-дуге</p>
			<CinematicSlider
				slides={DEFAULT_CINEMATIC_SLIDES}
				slideWidth={previewSlideWidth}
				slideHeight={previewSlideHeight}
				slideGap={previewSlideGap}
				arcDepth={previewArcDepth}
				centerLift={previewCenterLift}
				{scrollLerp}
				{wheelMultiplier}
				{showInfoBar}
				class="absolute inset-0"
			/>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="cinematic-slider" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title={customizeLabels.slideWidth}
				min={220}
				max={420}
				step={10}
				value={slideWidth}
				valueUnit="px"
				onChange={(v) => (slideWidth = v)}
			/>
			<PreviewSlider
				title={customizeLabels.slideHeight}
				min={280}
				max={520}
				step={10}
				value={slideHeight}
				valueUnit="px"
				onChange={(v) => (slideHeight = v)}
			/>
			<PreviewSlider
				title={customizeLabels.slideGap}
				min={60}
				max={160}
				step={5}
				value={slideGap}
				valueUnit="px"
				onChange={(v) => (slideGap = v)}
			/>
			<PreviewSlider
				title={customizeLabels.arcDepth}
				min={80}
				max={320}
				step={10}
				value={arcDepth}
				valueUnit="px"
				onChange={(v) => (arcDepth = v)}
			/>
			<PreviewSlider
				title={customizeLabels.centerLift}
				min={0}
				max={180}
				step={5}
				value={centerLift}
				valueUnit="px"
				onChange={(v) => (centerLift = v)}
			/>
			<PreviewSlider
				title={customizeLabels.scrollLerp}
				min={0.02}
				max={0.2}
				step={0.01}
				value={scrollLerp}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => (scrollLerp = v)}
			/>
			<PreviewSlider
				title={customizeLabels.wheelMultiplier}
				min={0.2}
				max={1.2}
				step={0.05}
				value={wheelMultiplier}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => (wheelMultiplier = v)}
			/>
			<PreviewSwitch
				title={customizeLabels.showInfoBar}
				checked={showInfoBar}
				onChange={(v) => (showInfoBar = v)}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.demo-hint {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		z-index: 20;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.55;
		color: #0f0f0f;
		text-align: center;
		pointer-events: none;
		user-select: none;
		max-width: min(92%, 22rem);
		line-height: 1.35;
	}

	@media (max-width: 768px) {
		.demo-hint {
			font-size: 0.75rem;
			white-space: normal;
		}

		:global(.cinematic-demo) {
			height: 520px !important;
		}
	}
</style>
