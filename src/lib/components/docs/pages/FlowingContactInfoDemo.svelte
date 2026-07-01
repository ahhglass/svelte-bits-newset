<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import FlowingContactInfo, {
		DEFAULT_FLOWING_CONTACT_ITEMS
	} from '$lib/components/library/Components/FlowingContactInfo/FlowingContactInfo.svelte';
	import source from '$lib/components/library/Components/FlowingContactInfo/FlowingContactInfo.svelte?raw';

	const DEFAULTS = {
		cloneCount: 6,
		rowMaxGap: 8,
		flowRadius: 0.25,
		flowSoftness: 1,
		enableLenis: true,
		infiniteScroll: true,
		backgroundColor: '#0a0a0a',
		textColor: '#ffffff',
		mutedColor: '#888888'
	};

	let cloneCount = $state(DEFAULTS.cloneCount);
	let rowMaxGap = $state(DEFAULTS.rowMaxGap);
	let flowRadius = $state(DEFAULTS.flowRadius);
	let flowSoftness = $state(DEFAULTS.flowSoftness);
	let enableLenis = $state(DEFAULTS.enableLenis);
	let infiniteScroll = $state(DEFAULTS.infiniteScroll);
	let backgroundColor = $state(DEFAULTS.backgroundColor);
	let textColor = $state(DEFAULTS.textColor);
	let mutedColor = $state(DEFAULTS.mutedColor);

	const hasChanges = $derived(
		cloneCount !== DEFAULTS.cloneCount ||
			rowMaxGap !== DEFAULTS.rowMaxGap ||
			flowRadius !== DEFAULTS.flowRadius ||
			flowSoftness !== DEFAULTS.flowSoftness ||
			enableLenis !== DEFAULTS.enableLenis ||
			infiniteScroll !== DEFAULTS.infiniteScroll ||
			backgroundColor !== DEFAULTS.backgroundColor ||
			textColor !== DEFAULTS.textColor ||
			mutedColor !== DEFAULTS.mutedColor
	);

	function reset() {
		cloneCount = DEFAULTS.cloneCount;
		rowMaxGap = DEFAULTS.rowMaxGap;
		flowRadius = DEFAULTS.flowRadius;
		flowSoftness = DEFAULTS.flowSoftness;
		enableLenis = DEFAULTS.enableLenis;
		infiniteScroll = DEFAULTS.infiniteScroll;
		backgroundColor = DEFAULTS.backgroundColor;
		textColor = DEFAULTS.textColor;
		mutedColor = DEFAULTS.mutedColor;
	}

	const usage = $derived(
		`<FlowingContactInfo cloneCount={${cloneCount}} rowMaxGap={${rowMaxGap}} enableLenis={${enableLenis}} infiniteScroll={${infiniteScroll}} />`
	);

	const props: PropRow[] = [
		{ name: 'items', type: 'FlowingContactItem[]', default: '7 brand rows', description: 'Строки с label, value и icon.' },
		{ name: 'cloneCount', type: 'number', default: '10', description: 'Сколько раз продублировать блок строк для бесконечного скролла.' },
		{ name: 'rowMaxGap', type: 'number', default: '10', description: 'Макс. gap между колонками строки при анимации (rem).' },
		{ name: 'flowRadius', type: 'number', default: '0.42', description: 'Высота зоны обтекания (доля viewport).' },
		{ name: 'flowSoftness', type: 'number', default: '0.72', description: '0 = острый ромб, 1 = максимально мягкий ромб.' },
		{ name: 'mobileRowMaxGap', type: 'number', default: '5', description: 'Макс. gap на экранах < 1000px.' },
		{ name: 'enableLenis', type: 'boolean', default: 'true', description: 'Плавный скролл через Lenis.' },
		{ name: 'infiniteScroll', type: 'boolean', default: 'true', description: 'Бесконечный скролл Lenis.' },
		{ name: 'useWindowScroll', type: 'boolean', default: 'false', description: 'Скролл окна вместо встроенного контейнера.' },
		{ name: 'backgroundColor', type: 'string', default: '"#0a0a0a"', description: 'Цвет фона.' },
		{ name: 'textColor', type: 'string', default: '"#ffffff"', description: 'Цвет текста label.' },
		{ name: 'mutedColor', type: 'string', default: '"#888888"', description: 'Цвет текста value.' },
		{ name: 'iconSize', type: 'string', default: '"8rem"', description: 'Размер центральной иконки.' },
		{ name: 'centerThreshold', type: 'number', default: '25', description: 'Порог (px) для смены иконки у центра экрана.' },
		{ name: 'class', type: 'string', default: '""', description: 'Доп. классы корневого контейнера.' }
	];
</script>

<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="FlowingContactInfo"
	{usage}
	{source}
	{props}
>
	{#snippet preview()}
		<div class="demo-container fci-demo-wrap" style="position:relative;height:640px;padding:0;overflow:hidden;">
			{#key `${enableLenis}-${infiniteScroll}-${cloneCount}-${rowMaxGap}-${flowRadius}-${flowSoftness}`}
				<FlowingContactInfo
					items={DEFAULT_FLOWING_CONTACT_ITEMS}
					{cloneCount}
					{rowMaxGap}
					{flowRadius}
					{flowSoftness}
					{enableLenis}
					{infiniteScroll}
					{backgroundColor}
					{textColor}
					{mutedColor}
					iconSize="5.5rem"
					class="fci-demo-fill"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="flowing-contact-info" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSwitch title="Lenis" checked={enableLenis} onChange={(v) => (enableLenis = v)} />
			<PreviewSwitch
				title="Infinite Scroll"
				checked={infiniteScroll}
				isDisabled={!enableLenis}
				onChange={(v) => (infiniteScroll = v)}
			/>
			<PreviewSlider
				title="Clone Count"
				min={2}
				max={12}
				step={1}
				value={cloneCount}
				onChange={(v) => (cloneCount = v)}
			/>
			<PreviewSlider
				title="Row Max Gap"
				min={3}
				max={14}
				step={0.5}
				value={rowMaxGap}
				onChange={(v) => (rowMaxGap = v)}
			/>
			<PreviewSlider
				title="Flow Radius"
				min={0.25}
				max={0.65}
				step={0.01}
				value={flowRadius}
				onChange={(v) => (flowRadius = v)}
			/>
			<PreviewSlider
				title="Flow Softness"
				min={0}
				max={1}
				step={0.01}
				value={flowSoftness}
				onChange={(v) => (flowSoftness = v)}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.fci-demo-wrap {
		display: block;
		isolation: auto;
	}

	:global(.fci-demo-fill) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
</style>
