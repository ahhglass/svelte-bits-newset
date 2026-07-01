<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PixelatedVideoHover from '$lib/components/library/Components/PixelatedVideoHover/PixelatedVideoHover.svelte';
	import source from '$lib/components/library/Components/PixelatedVideoHover/PixelatedVideoHover.svelte?raw';

	const VIDEO_SRC = '/video/pixelatedvideohover.mp4';

	const DEFAULTS = {
		gridSize: 20,
		mouseRadius: 0.25,
		strength: 0.1,
		relaxation: 0.925,
		displacement: 0.015,
		aberration: 0.15
	};

	let gridSize = $state(DEFAULTS.gridSize);
	let mouseRadius = $state(DEFAULTS.mouseRadius);
	let strength = $state(DEFAULTS.strength);
	let relaxation = $state(DEFAULTS.relaxation);
	let displacement = $state(DEFAULTS.displacement);
	let aberration = $state(DEFAULTS.aberration);
	let demoKey = $state(0);

	const hasChanges = $derived(
		gridSize !== DEFAULTS.gridSize ||
			mouseRadius !== DEFAULTS.mouseRadius ||
			strength !== DEFAULTS.strength ||
			relaxation !== DEFAULTS.relaxation ||
			displacement !== DEFAULTS.displacement ||
			aberration !== DEFAULTS.aberration
	);

	function reset() {
		gridSize = DEFAULTS.gridSize;
		mouseRadius = DEFAULTS.mouseRadius;
		strength = DEFAULTS.strength;
		relaxation = DEFAULTS.relaxation;
		displacement = DEFAULTS.displacement;
		aberration = DEFAULTS.aberration;
		demoKey++;
	}

	const bump = () => {
		demoKey++;
	};

	const customizeLabels = {
		gridSize: 'Grid Size',
		mouseRadius: 'Mouse Radius',
		strength: 'Strength',
		relaxation: 'Relaxation',
		displacement: 'Displacement',
		aberration: 'Aberration'
	} as const;

	const usage = $derived(
		`<PixelatedVideoHover
  videoSrc="/video/pixelatedvideohover.mp4"
  gridSize={${gridSize}}
  mouseRadius={${mouseRadius}}
  strength={${strength}}
  relaxation={${relaxation}}
  displacement={${displacement}}
  aberration={${aberration}}
/>`
	);

	const props: PropRow[] = [
		{ name: 'videoSrc', type: 'string', default: '-', description: 'Video source URL.' },
		{ name: 'gridSize', type: 'number', default: '20', description: 'Base grid resolution for the deformation map.' },
		{ name: 'mouseRadius', type: 'number', default: '0.25', description: 'Cursor influence radius relative to grid size.' },
		{ name: 'strength', type: 'number', default: '0.1', description: 'Strength of the hover deformation.' },
		{ name: 'relaxation', type: 'number', default: '0.925', description: 'How quickly the grid returns to rest (0–1).' },
		{ name: 'displacement', type: 'number', default: '0.015', description: 'UV displacement amount from the data texture.' },
		{ name: 'aberration', type: 'number', default: '0.15', description: 'Chromatic aberration split multiplier.' },
		{ name: 'autoplay', type: 'boolean', default: 'true', description: 'Autoplay the video.' },
		{ name: 'muted', type: 'boolean', default: 'true', description: 'Mute the video (required for autoplay in most browsers).' },
		{ name: 'loop', type: 'boolean', default: 'true', description: 'Loop the video.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root container.' }
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="PixelatedVideoHover" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:560px;padding:0;overflow:hidden;">
			<p class="demo-hint">Двигайте курсором или пальцем — видео пикселизируется с хроматическим смещением</p>
			{#key demoKey}
				<PixelatedVideoHover
					videoSrc={VIDEO_SRC}
					{gridSize}
					{mouseRadius}
					{strength}
					{relaxation}
					{displacement}
					{aberration}
					class="absolute inset-0"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="pixelated-video-hover" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title={customizeLabels.gridSize}
				min={8}
				max={40}
				step={1}
				value={gridSize}
				onChange={(v) => {
					gridSize = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.mouseRadius}
				min={0.05}
				max={0.6}
				step={0.01}
				value={mouseRadius}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => {
					mouseRadius = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.strength}
				min={0.02}
				max={0.3}
				step={0.01}
				value={strength}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => {
					strength = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.relaxation}
				min={0.8}
				max={0.99}
				step={0.005}
				value={relaxation}
				displayValue={(v) => v.toFixed(3)}
				onChange={(v) => {
					relaxation = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.displacement}
				min={0.005}
				max={0.04}
				step={0.001}
				value={displacement}
				displayValue={(v) => v.toFixed(3)}
				onChange={(v) => {
					displacement = v;
					bump();
				}}
			/>
			<PreviewSlider
				title={customizeLabels.aberration}
				min={0}
				max={0.4}
				step={0.01}
				value={aberration}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => {
					aberration = v;
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
		text-align: center;
		pointer-events: none;
		user-select: none;
		max-width: min(92%, 22rem);
		line-height: 1.35;
		mix-blend-mode: difference;
	}

	@media (max-width: 768px) {
		.demo-hint {
			font-size: 0.75rem;
			white-space: normal;
		}
	}
</style>
