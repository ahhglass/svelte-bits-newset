<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import ScrollTriggeredFooterAnimation from '$lib/components/library/Components/ScrollTriggeredFooterAnimation/ScrollTriggeredFooterAnimation.svelte';
	import source from '$lib/components/library/Components/ScrollTriggeredFooterAnimation/ScrollTriggeredFooterAnimation.svelte?raw';

	const LEFT_HAND = '/assets/footer-hands/left-hand.png';
	const RIGHT_HAND = '/assets/footer-hands/right-hand.png';

	const DEFAULTS = {
		leftTitle: 'Blank',
		rightTitle: 'Canvas',
		parallaxStrength: 20,
		enableLenis: true,
		charColor: '#803500',
		hoverColor: '#ff6a00'
	};

	let leftTitle = $state(DEFAULTS.leftTitle);
	let rightTitle = $state(DEFAULTS.rightTitle);
	let parallaxStrength = $state(DEFAULTS.parallaxStrength);
	let enableLenis = $state(DEFAULTS.enableLenis);
	let charColor = $state(DEFAULTS.charColor);
	let hoverColor = $state(DEFAULTS.hoverColor);
	let demoKey = $state(0);

	const hasChanges = $derived(
		leftTitle !== DEFAULTS.leftTitle ||
			rightTitle !== DEFAULTS.rightTitle ||
			parallaxStrength !== DEFAULTS.parallaxStrength ||
			enableLenis !== DEFAULTS.enableLenis ||
			charColor !== DEFAULTS.charColor ||
			hoverColor !== DEFAULTS.hoverColor
	);

	function reset() {
		leftTitle = DEFAULTS.leftTitle;
		rightTitle = DEFAULTS.rightTitle;
		parallaxStrength = DEFAULTS.parallaxStrength;
		enableLenis = DEFAULTS.enableLenis;
		charColor = DEFAULTS.charColor;
		hoverColor = DEFAULTS.hoverColor;
		demoKey++;
	}

	const bump = () => {
		demoKey++;
	};

	const customizeLabels = {
		leftTitle: 'Left Title',
		rightTitle: 'Right Title',
		parallaxStrength: 'Parallax Strength',
		enableLenis: 'Smooth Scroll (Lenis)',
		charColor: 'ASCII Color',
		hoverColor: 'Hover Color'
	} as const;

	const usage = $derived(
		`<ScrollTriggeredFooterAnimation
  leftHandSrc="${LEFT_HAND}"
  rightHandSrc="${RIGHT_HAND}"
  leftTitle="${leftTitle}"
  rightTitle="${rightTitle}"
  parallaxStrength={${parallaxStrength}}
  enableLenis={${enableLenis}}
  asciiConfig={{ charColor: "${charColor}", hoverColor: "${hoverColor}" }}
/>`
	);

	const props: PropRow[] = [
		{ name: 'links', type: 'FooterLink[]', default: '4 links', description: 'Footer navigation links.' },
		{ name: 'description', type: 'string', default: 'studio copy', description: 'Footer description paragraph.' },
		{ name: 'leftTitle', type: 'string', default: '"Blank"', description: 'Large left footer heading.' },
		{ name: 'rightTitle', type: 'string', default: '"Canvas"', description: 'Large right footer heading.' },
		{ name: 'leftHandSrc', type: 'string', default: 'left-hand.png', description: 'Left hand image for ASCII canvas.' },
		{ name: 'rightHandSrc', type: 'string', default: 'right-hand.png', description: 'Right hand image for ASCII canvas.' },
		{ name: 'backgroundColor', type: 'string', default: '"#0f0f0f"', description: 'Footer background color.' },
		{ name: 'textColor', type: 'string', default: '"#ffffff"', description: 'Footer text color.' },
		{ name: 'useWindowScroll', type: 'boolean', default: 'false', description: 'Use window scroll instead of built-in demo scroller.' },
		{ name: 'enableLenis', type: 'boolean', default: 'true', description: 'Enable Lenis smooth scrolling.' },
		{ name: 'spacerHeight', type: 'string', default: '"120vh"', description: 'Top spacer height before footer in embedded mode.' },
		{ name: 'parallaxStrength', type: 'number', default: '20', description: 'Hand parallax strength from pointer movement.' },
		{ name: 'parallaxEase', type: 'number', default: '0.05', description: 'Parallax follow easing factor.' },
		{ name: 'asciiConfig', type: 'AsciiHandConfig', default: '{}', description: 'ASCII hand canvas colors, grid, and hover settings.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the root container.' }
	];
</script>

<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="ScrollTriggeredFooterAnimation"
	{usage}
	{source}
	{props}
>
	{#snippet preview()}
		<div class="demo-container" style="position:relative;height:680px;padding:0;overflow:hidden;">
			<p class="demo-hint">Прокрутите вниз — footer раскроется, руки появятся с ASCII-эффектом</p>
			{#key demoKey}
				<ScrollTriggeredFooterAnimation
					leftHandSrc={LEFT_HAND}
					rightHandSrc={RIGHT_HAND}
					{leftTitle}
					{rightTitle}
					{parallaxStrength}
					{enableLenis}
					asciiConfig={{ charColor, hoverColor }}
					class="absolute inset-0"
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="scroll-triggered-footer-animation" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewInput title={customizeLabels.leftTitle} value={leftTitle} onChange={(v) => (leftTitle = v)} />
			<PreviewInput title={customizeLabels.rightTitle} value={rightTitle} onChange={(v) => (rightTitle = v)} />
			<PreviewSlider
				title={customizeLabels.parallaxStrength}
				min={0}
				max={40}
				step={1}
				value={parallaxStrength}
				onChange={(v) => (parallaxStrength = v)}
			/>
			<PreviewSwitch
				title={customizeLabels.enableLenis}
				checked={enableLenis}
				onChange={(v) => {
					enableLenis = v;
					bump();
				}}
			/>
			<PreviewInput
				title={customizeLabels.charColor}
				value={charColor}
				onChange={(v) => {
					charColor = v;
					bump();
				}}
			/>
			<PreviewInput
				title={customizeLabels.hoverColor}
				value={hoverColor}
				onChange={(v) => {
					hoverColor = v;
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
		color: #fff;
		text-align: center;
		pointer-events: none;
		user-select: none;
		max-width: min(92%, 24rem);
		line-height: 1.35;
	}
</style>
