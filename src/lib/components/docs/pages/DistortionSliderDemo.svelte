<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DistortionSlider, {
		DEFAULT_DISTORTION_SLIDES
	} from '$lib/components/library/Components/DistortionSlider/DistortionSlider.svelte';
	import source from '$lib/components/library/Components/DistortionSlider/DistortionSlider.svelte?raw';

	const DEFAULTS = {
		distortionStrength: 2.5,
		smoothing: 0.05,
		distortionSmoothing: 0.1,
		wheelSpeed: 0.01,
		orientation: 'vertical' as 'vertical' | 'horizontal',
		showInfo: true,
		backgroundColor: '#0a0a0a'
	};

	let distortionStrength = $state(DEFAULTS.distortionStrength);
	let smoothing = $state(DEFAULTS.smoothing);
	let distortionSmoothing = $state(DEFAULTS.distortionSmoothing);
	let wheelSpeed = $state(DEFAULTS.wheelSpeed);
	let orientation = $state(DEFAULTS.orientation);
	let showInfo = $state(DEFAULTS.showInfo);
	let backgroundColor = $state(DEFAULTS.backgroundColor);
	let demoKey = $state(0);

	const hasChanges = $derived(
		distortionStrength !== DEFAULTS.distortionStrength ||
			smoothing !== DEFAULTS.smoothing ||
			distortionSmoothing !== DEFAULTS.distortionSmoothing ||
			wheelSpeed !== DEFAULTS.wheelSpeed ||
			orientation !== DEFAULTS.orientation ||
			showInfo !== DEFAULTS.showInfo ||
			backgroundColor !== DEFAULTS.backgroundColor
	);

	function reset() {
		distortionStrength = DEFAULTS.distortionStrength;
		smoothing = DEFAULTS.smoothing;
		distortionSmoothing = DEFAULTS.distortionSmoothing;
		wheelSpeed = DEFAULTS.wheelSpeed;
		orientation = DEFAULTS.orientation;
		showInfo = DEFAULTS.showInfo;
		backgroundColor = DEFAULTS.backgroundColor;
		demoKey++;
	}

	const bump = () => {
		demoKey++;
	};

	const customizeLabels = {
		distortionStrength: 'Distortion Strength',
		smoothing: 'Smoothing',
		distortionSmoothing: 'Distortion Smoothing',
		wheelSpeed: 'Wheel Speed',
		orientation: 'Orientation',
		showInfo: 'Show Info',
		backgroundColor: 'Background Color'
	} as const;

	const usage = $derived(
		`<DistortionSlider
  slides={slides}
  orientation="${orientation}"
  backgroundColor="${backgroundColor}"
  showInfo={${showInfo}}
  config={{
    distortionStrength: ${distortionStrength},
    smoothing: ${smoothing},
    distortionSmoothing: ${distortionSmoothing},
    wheelSpeed: ${wheelSpeed}
  }}
/>`
	);

	const props: PropRow[] = [
		{
			name: 'slides',
			type: 'DistortionSlide[]',
			default: 'DEFAULT_DISTORTION_SLIDES',
			description: 'Slides with name and image URL.'
		},
		{
			name: 'config',
			type: 'Partial<DistortionSliderConfig>',
			default: 'DEFAULT_DISTORTION_CONFIG',
			description: 'Scroll, distortion, and momentum settings.'
		},
		{
			name: 'orientation',
			type: '"vertical" | "horizontal"',
			default: '"vertical"',
			description: 'Scroll axis and info bar layout.'
		},
		{
			name: 'backgroundColor',
			type: 'string | null',
			default: 'null',
			description: 'Scene background hex color, or null for transparent.'
		},
		{
			name: 'showInfo',
			type: 'boolean',
			default: 'true',
			description: 'Show active slide title and index overlay.'
		}
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="DistortionSlider" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:620px;padding:0;overflow:hidden;">
			<p class="demo-hint">Колёсико, свайп или перетаскивание — слайды с 3D-искажением</p>
			{#key demoKey}
				<DistortionSlider
					slides={DEFAULT_DISTORTION_SLIDES}
					{orientation}
					{backgroundColor}
					{showInfo}
					config={{ distortionStrength, smoothing, distortionSmoothing, wheelSpeed }}
					class="absolute inset-0"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="distortion-slider" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title={customizeLabels.distortionStrength}
				min={0.5}
				max={5}
				step={0.1}
				value={distortionStrength}
				onChange={(v) => {
					distortionStrength = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.smoothing}
				min={0.02}
				max={0.2}
				step={0.01}
				value={smoothing}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => {
					smoothing = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.distortionSmoothing}
				min={0.02}
				max={0.3}
				step={0.01}
				value={distortionSmoothing}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => {
					distortionSmoothing = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.wheelSpeed}
				min={0.005}
				max={0.03}
				step={0.001}
				value={wheelSpeed}
				displayValue={(v) => v.toFixed(3)}
				onChange={(v) => {
					wheelSpeed = v;
					bump();
				}}
			/>
			<PreviewSwitch
				title={customizeLabels.orientation}
				checked={orientation === 'horizontal'}
				onChange={(v) => {
					orientation = v ? 'horizontal' : 'vertical';
					bump();
				}}
			/>
			<PreviewSwitch
				title={customizeLabels.showInfo}
				checked={showInfo}
				onChange={(v) => {
					showInfo = v;
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
		bottom: 1rem;
		left: 50%;
		z-index: 20;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.55;
		color: #fff;
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
	}
</style>
