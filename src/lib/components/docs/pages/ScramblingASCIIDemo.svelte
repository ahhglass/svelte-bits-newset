<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ScramblingASCII from '$lib/components/library/TextAnimations/ScramblingASCII/ScramblingASCII.svelte';
	import source from '$lib/components/library/TextAnimations/ScramblingASCII/ScramblingASCII.svelte?raw';

	const DEMO_LOGO = '/assets/demo/scrambling.png';

	const DEFAULTS = {
		charColor: '#dadada',
		gridColor: '#171717',
		asciiChars: '.:+*#%@0369',
		pushRadius: 5,
		pushForce: 30,
		spring: 0.025,
		damping: 0.5,
		scrambleInterval: 50
	};

	let charColor = $state(DEFAULTS.charColor);
	let gridColor = $state(DEFAULTS.gridColor);
	let asciiChars = $state(DEFAULTS.asciiChars);
	let pushRadius = $state(DEFAULTS.pushRadius);
	let pushForce = $state(DEFAULTS.pushForce);
	let spring = $state(DEFAULTS.spring);
	let damping = $state(DEFAULTS.damping);
	let scrambleInterval = $state(DEFAULTS.scrambleInterval);

	const hasChanges = $derived(
		charColor !== DEFAULTS.charColor ||
			gridColor !== DEFAULTS.gridColor ||
			asciiChars !== DEFAULTS.asciiChars ||
			pushRadius !== DEFAULTS.pushRadius ||
			pushForce !== DEFAULTS.pushForce ||
			spring !== DEFAULTS.spring ||
			damping !== DEFAULTS.damping ||
			scrambleInterval !== DEFAULTS.scrambleInterval
	);

	function reset() {
		charColor = DEFAULTS.charColor;
		gridColor = DEFAULTS.gridColor;
		asciiChars = DEFAULTS.asciiChars;
		pushRadius = DEFAULTS.pushRadius;
		pushForce = DEFAULTS.pushForce;
		spring = DEFAULTS.spring;
		damping = DEFAULTS.damping;
		scrambleInterval = DEFAULTS.scrambleInterval;
	}

	const customizeLabels = {
		charColor: 'Text Color',
		gridColor: 'Grid Color',
		asciiChars: 'ASCII Characters',
		pushRadius: 'Push Radius',
		pushForce: 'Push Force',
		spring: 'Spring',
		damping: 'Damping',
		scrambleInterval: 'Scramble Interval'
	} as const;

	const demoKey = $derived(
		[charColor, gridColor, asciiChars, pushRadius, pushForce, spring, damping, scrambleInterval].join('-')
	);

	const usage = $derived(
		`<ScramblingASCII
  src="/assets/demo/scrambling.png"
  charColor="${charColor}"
  gridColor="${gridColor}"
  asciiChars="${asciiChars}"
  pushRadius={${pushRadius}}
  pushForce={${pushForce}}
  spring={${spring}}
  damping={${damping}}
  scrambleInterval={${scrambleInterval}}
/>`
	);

	const props: PropRow[] = [
		{ name: 'src', type: 'string', default: '-', description: 'Source image URL used to sample the ASCII shape.' },
		{ name: 'logoWidth', type: 'string', default: '"75%"', description: 'Width of the hidden sampling image inside the container.' },
		{ name: 'backgroundColor', type: 'string', default: '"#0f0f0f"', description: 'Canvas background color.' },
		{ name: 'gridColor', type: 'string', default: '"#171717"', description: 'Color of the background grid dots.' },
		{ name: 'charColor', type: 'string', default: '"#dadada"', description: 'Color of the ASCII characters.' },
		{ name: 'asciiChars', type: 'string', default: '".:+*#%@0369"', description: 'Character set used for scrambling and brightness mapping.' },
		{ name: 'threshold', type: 'number', default: '0.5', description: 'Brightness threshold (0–1) for sampling lit cells from the image.' },
		{ name: 'pushRadius', type: 'number', default: '5', description: 'Mouse repulsion radius in grid cells.' },
		{ name: 'pushForce', type: 'number', default: '30', description: 'Strength of mouse repulsion force.' },
		{ name: 'spring', type: 'number', default: '0.025', description: 'Spring force pulling cells back to origin.' },
		{ name: 'damping', type: 'number', default: '0.5', description: 'Velocity damping for physics simulation.' },
		{ name: 'scrambleInterval', type: 'number', default: '50', description: 'Interval in ms between random character scrambles.' }
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="ScramblingASCII" {usage} {source} {props}>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:520px;overflow:hidden;padding:0;">
			<p class="demo-hint">Наведите курсор — символы разлетятся и вернутся на место</p>
			{#key demoKey}
				<ScramblingASCII
					src={DEMO_LOGO}
					{charColor}
					{gridColor}
					{asciiChars}
					{pushRadius}
					{pushForce}
					{spring}
					{damping}
					{scrambleInterval}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="scrambling-ascii" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewColorPicker title={customizeLabels.charColor} value={charColor} onChange={(v) => (charColor = v)} />
			<PreviewColorPicker title={customizeLabels.gridColor} value={gridColor} onChange={(v) => (gridColor = v)} />
			<PreviewInput title={customizeLabels.asciiChars} value={asciiChars} onChange={(v) => (asciiChars = v)} />
			<PreviewSlider
				title={customizeLabels.pushRadius}
				min={2}
				max={12}
				step={1}
				value={pushRadius}
				valueUnit=" cells"
				onChange={(v) => (pushRadius = v)}
			/>
			<PreviewSlider
				title={customizeLabels.pushForce}
				min={5}
				max={60}
				step={1}
				value={pushForce}
				onChange={(v) => (pushForce = v)}
			/>
			<PreviewSlider
				title={customizeLabels.spring}
				min={0.005}
				max={0.1}
				step={0.005}
				value={spring}
				displayValue={(v) => v.toFixed(3)}
				onChange={(v) => (spring = v)}
			/>
			<PreviewSlider
				title={customizeLabels.damping}
				min={0.2}
				max={0.95}
				step={0.05}
				value={damping}
				displayValue={(v) => v.toFixed(2)}
				onChange={(v) => (damping = v)}
			/>
			<PreviewSlider
				title={customizeLabels.scrambleInterval}
				min={20}
				max={200}
				step={10}
				value={scrambleInterval}
				valueUnit="ms"
				onChange={(v) => (scrambleInterval = v)}
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
		z-index: 2;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.55;
		color: #dadada;
		text-align: center;
		pointer-events: none;
		user-select: none;
		white-space: nowrap;
	}
</style>
