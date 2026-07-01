<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DigitalHoverImage from '$lib/components/library/Components/DigitalHoverImage/DigitalHoverImage.svelte';
	import source from '$lib/components/library/Components/DigitalHoverImage/DigitalHoverImage.svelte?raw';

	const DEMO_SRC =
		'https://i.pinimg.com/1200x/98/bd/a4/98bda4ac2371eaaab15ddfa3d6eb6bc6.jpg';

	const DEFAULTS = {
		blockSize: 25,
		detectionRadius: 50,
		clusterSize: 7,
		blockLifetime: 300,
		emptyRatio: 0.2,
		scrambleRatio: 0.25,
		scrambleInterval: 150,
		blockBackground: '#1a1a1a',
		blockColor: '#e3e3db',
		symbols: '0X*>$W'
	};

	let blockSize = $state(DEFAULTS.blockSize);
	let detectionRadius = $state(DEFAULTS.detectionRadius);
	let clusterSize = $state(DEFAULTS.clusterSize);
	let blockLifetime = $state(DEFAULTS.blockLifetime);
	let emptyRatio = $state(DEFAULTS.emptyRatio);
	let scrambleRatio = $state(DEFAULTS.scrambleRatio);
	let scrambleInterval = $state(DEFAULTS.scrambleInterval);
	let blockBackground = $state(DEFAULTS.blockBackground);
	let blockColor = $state(DEFAULTS.blockColor);
	let symbols = $state(DEFAULTS.symbols);

	const symbolArray = $derived(symbols.split(''));

	const hasChanges = $derived(
		blockSize !== DEFAULTS.blockSize ||
			detectionRadius !== DEFAULTS.detectionRadius ||
			clusterSize !== DEFAULTS.clusterSize ||
			blockLifetime !== DEFAULTS.blockLifetime ||
			emptyRatio !== DEFAULTS.emptyRatio ||
			scrambleRatio !== DEFAULTS.scrambleRatio ||
			scrambleInterval !== DEFAULTS.scrambleInterval ||
			blockBackground !== DEFAULTS.blockBackground ||
			blockColor !== DEFAULTS.blockColor ||
			symbols !== DEFAULTS.symbols
	);

	function reset() {
		blockSize = DEFAULTS.blockSize;
		detectionRadius = DEFAULTS.detectionRadius;
		clusterSize = DEFAULTS.clusterSize;
		blockLifetime = DEFAULTS.blockLifetime;
		emptyRatio = DEFAULTS.emptyRatio;
		scrambleRatio = DEFAULTS.scrambleRatio;
		scrambleInterval = DEFAULTS.scrambleInterval;
		blockBackground = DEFAULTS.blockBackground;
		blockColor = DEFAULTS.blockColor;
		symbols = DEFAULTS.symbols;
	}

	const demoKey = $derived(
		[
			blockSize,
			detectionRadius,
			clusterSize,
			blockLifetime,
			emptyRatio,
			scrambleRatio,
			scrambleInterval,
			blockBackground,
			blockColor,
			symbols
		].join('-')
	);

	const usage = $derived(
		`<DigitalHoverImage
  src="${DEMO_SRC}"
  blockSize={${blockSize}}
  detectionRadius={${detectionRadius}}
  clusterSize={${clusterSize}}
  blockLifetime={${blockLifetime}}
  symbols={${JSON.stringify(symbolArray)}}
/>`
	);

	const props: PropRow[] = [
		{ name: 'src', type: 'string', default: '-', description: 'URL изображения под сеткой.' },
		{ name: 'alt', type: 'string', default: '""', description: 'Alt-текст изображения.' },
		{ name: 'width', type: 'string', default: '"100%"', description: 'Ширина контейнера.' },
		{ name: 'height', type: 'string', default: '"auto"', description: 'Высота контейнера (auto — aspect-ratio 7/5).' },
		{ name: 'symbols', type: 'string[]', default: '["0","X","*","..."]', description: 'Символы для scramble-эффекта.' },
		{ name: 'blockSize', type: 'number', default: '25', description: 'Размер ячейки сетки (px).' },
		{ name: 'detectionRadius', type: 'number', default: '50', description: 'Радиус реакции на курсор (px).' },
		{ name: 'clusterSize', type: 'number', default: '7', description: 'Макс. соседних блоков в кластере.' },
		{ name: 'blockLifetime', type: 'number', default: '300', description: 'Время подсветки блока (ms).' },
		{ name: 'emptyRatio', type: 'number', default: '0.3', description: 'Доля пустых ячеек (0–1).' },
		{ name: 'scrambleRatio', type: 'number', default: '0.25', description: 'Доля ячеек со scramble (0–1).' },
		{ name: 'scrambleInterval', type: 'number', default: '150', description: 'Интервал смены символов (ms).' },
		{ name: 'blockBackground', type: 'string', default: '"#1a1a1a"', description: 'Фон активных блоков.' },
		{ name: 'blockColor', type: 'string', default: '"#e3e3db"', description: 'Цвет символов.' },
		{ name: 'blockFontSize', type: 'string', default: '"20px"', description: 'Размер шрифта символов.' },
		{ name: 'class', type: 'string', default: '""', description: 'Доп. классы контейнера.' }
	];
</script>

<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="DigitalHoverImage"
	{usage}
	{source}
	{props}
>
	{#snippet preview()}
		<div class="demo-container dhi-demo-wrap">
			{#key demoKey}
				<DigitalHoverImage
					src={DEMO_SRC}
					alt="Digital hover portrait"
					width="400px"
					height="500px"
					symbols={symbolArray}
					{blockSize}
					{detectionRadius}
					{clusterSize}
					{blockLifetime}
					{emptyRatio}
					{scrambleRatio}
					{scrambleInterval}
					{blockBackground}
					{blockColor}
					class="dhi-demo"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="digital-hover-image" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider
				title="Block Size"
				min={12}
				max={40}
				step={1}
				value={blockSize}
				onChange={(v) => (blockSize = v)}
			/>
			<PreviewSlider
				title="Detection Radius"
				min={20}
				max={120}
				step={5}
				value={detectionRadius}
				onChange={(v) => (detectionRadius = v)}
			/>
			<PreviewSlider
				title="Cluster Size"
				min={1}
				max={12}
				step={1}
				value={clusterSize}
				onChange={(v) => (clusterSize = v)}
			/>
			<PreviewSlider
				title="Block Lifetime"
				min={100}
				max={800}
				step={25}
				value={blockLifetime}
				onChange={(v) => (blockLifetime = v)}
			/>
			<PreviewSlider
				title="Empty Ratio"
				min={0}
				max={0.8}
				step={0.05}
				value={emptyRatio}
				onChange={(v) => (emptyRatio = v)}
			/>
			<PreviewSlider
				title="Scramble Ratio"
				min={0}
				max={1}
				step={0.05}
				value={scrambleRatio}
				onChange={(v) => (scrambleRatio = v)}
			/>
			<PreviewSlider
				title="Scramble Interval"
				min={50}
				max={400}
				step={10}
				value={scrambleInterval}
				onChange={(v) => (scrambleInterval = v)}
			/>
			<PreviewInput title="Symbols" value={symbols} onChange={(v) => (symbols = v)} />
			<PreviewColorPicker
				title="Block Background"
				value={blockBackground}
				onChange={(v) => (blockBackground = v)}
			/>
			<PreviewColorPicker title="Block Color" value={blockColor} onChange={(v) => (blockColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.dhi-demo-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 520px;
		padding: 1rem;
		background: #232323;
	}

	:global(.dhi-demo) {
		max-width: 100%;
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
	}
</style>
