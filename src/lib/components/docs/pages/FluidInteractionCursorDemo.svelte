<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import FluidInteractionCursor from '$lib/components/library/Animations/FluidInteractionCursor/FluidInteractionCursor.svelte';
	import source from '$lib/components/library/Animations/FluidInteractionCursor/FluidInteractionCursor.svelte?raw';

	const DEFAULTS = {
		curl: 25,
		forceStrength: 5,
		splatRadius: 0.25,
		velocityDissipation: 0.95,
		dyeDissipation: 0.95,
		threshold: 1.0,
		edgeSoftness: 0,
		inkColor: '#ffffff',
		mixBlendMode: 'difference'
	};

	let curl = $state(DEFAULTS.curl);
	let forceStrength = $state(DEFAULTS.forceStrength);
	let splatRadius = $state(DEFAULTS.splatRadius);
	let velocityDissipation = $state(DEFAULTS.velocityDissipation);
	let dyeDissipation = $state(DEFAULTS.dyeDissipation);
	let threshold = $state(DEFAULTS.threshold);
	let edgeSoftness = $state(DEFAULTS.edgeSoftness);
	let inkColor = $state(DEFAULTS.inkColor);
	let mixBlendMode = $state(DEFAULTS.mixBlendMode);

	const hasChanges = $derived(
		curl !== DEFAULTS.curl ||
			forceStrength !== DEFAULTS.forceStrength ||
			splatRadius !== DEFAULTS.splatRadius ||
			velocityDissipation !== DEFAULTS.velocityDissipation ||
			dyeDissipation !== DEFAULTS.dyeDissipation ||
			threshold !== DEFAULTS.threshold ||
			edgeSoftness !== DEFAULTS.edgeSoftness ||
			inkColor !== DEFAULTS.inkColor ||
			mixBlendMode !== DEFAULTS.mixBlendMode
	);

	function reset() {
		curl = DEFAULTS.curl;
		forceStrength = DEFAULTS.forceStrength;
		splatRadius = DEFAULTS.splatRadius;
		velocityDissipation = DEFAULTS.velocityDissipation;
		dyeDissipation = DEFAULTS.dyeDissipation;
		threshold = DEFAULTS.threshold;
		edgeSoftness = DEFAULTS.edgeSoftness;
		inkColor = DEFAULTS.inkColor;
		mixBlendMode = DEFAULTS.mixBlendMode;
	}

	const usage = $derived(
		`<FluidInteractionCursor inkColor="${inkColor}" mixBlendMode="${mixBlendMode}" curl={${curl}} />`
	);

	const props: PropRow[] = [
		{ name: 'simResolution', type: 'number', default: '256', description: 'Размер сетки симуляции скорости и давления.' },
		{ name: 'dyeResolution', type: 'number', default: '1024', description: 'Размер сетки плотности краски.' },
		{ name: 'curl', type: 'number', default: '25', description: 'Сила завихрений (vorticity confinement).' },
		{ name: 'pressureIterations', type: 'number', default: '50', description: 'Число итераций солвера давления (Якobi).' },
		{ name: 'velocityDissipation', type: 'number', default: '0.95', description: 'Затухание скорости в секунду (1 = самое медленное).' },
		{ name: 'dyeDissipation', type: 'number', default: '0.95', description: 'Затухание краски в секунду (1 = самое медленное, но не бесконечное).' },
		{ name: 'splatRadius', type: 'number', default: '0.25', description: 'Радиус пятна курсора (÷100 в шейдере).' },
		{ name: 'forceStrength', type: 'number', default: '5', description: 'Множитель силы от скорости мыши.' },
		{ name: 'pressureDecay', type: 'number', default: '0.75', description: 'Затухание буфера давления.' },
		{ name: 'threshold', type: 'number', default: '1.0', description: 'Порог плотности краски (сырое значение, может быть > 1).' },
		{ name: 'edgeSoftness', type: 'number', default: '0', description: 'Мягкость края чернил (0 = резкий step).' },
		{ name: 'inkColor', type: 'string', default: '"#ffffff"', description: 'Цвет чернил (с difference используйте белый).' },
		{ name: 'mixBlendMode', type: 'string', default: '"difference"', description: 'CSS mix-blend-mode оверлея canvas.' },
		{ name: 'maxDevicePixelRatio', type: 'number', default: '2', description: 'Макс. DPR для производительности.' }
	];
</script>

<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="FluidInteractionCursor"
	{usage}
	{source}
	{props}
>
	{#snippet preview()}
		<div
			class="demo-container fic-demo"
			style="position:relative;height:520px;overflow:hidden;background:#fff;color:#000;isolation:auto;"
		>
			<div class="fic-demo__content">
				<p class="fic-demo__brand">Svelte Bits</p>
				<h2 class="fic-demo__headline">
					FLUID SYSTEM IN<br />CONSTANT FIELD<br />OF INTERACTION
				</h2>
				<p class="fic-demo__hint">Двигайте курсор, чтобы рисовать жидкость</p>
			</div>
			<FluidInteractionCursor
				{curl}
				{forceStrength}
				{splatRadius}
				{velocityDissipation}
				{dyeDissipation}
				{threshold}
				{edgeSoftness}
				{inkColor}
				{mixBlendMode}
			/>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="fluid-interaction-cursor" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSlider title="Завихрения (curl)" min={0} max={50} step={1} value={curl} onChange={(v) => (curl = v)} />
			<PreviewSlider
				title="Force Strength"
				min={1}
				max={20}
				step={0.5}
				value={forceStrength}
				onChange={(v) => (forceStrength = v)}
			/>
			<PreviewSlider
				title="Splat Radius"
				min={0.05}
				max={0.5}
				step={0.025}
				value={splatRadius}
				onChange={(v) => (splatRadius = v)}
			/>
			<PreviewSlider
				title="Velocity Dissipation"
				min={0.8}
				max={1}
				step={0.01}
				value={velocityDissipation}
				onChange={(v) => (velocityDissipation = v)}
			/>
			<PreviewSlider
				title="Dye Dissipation"
				min={0.8}
				max={1}
				step={0.01}
				value={dyeDissipation}
				onChange={(v) => (dyeDissipation = v)}
			/>
			<PreviewSlider
				title="Threshold"
				min={0.1}
				max={3}
				step={0.05}
				value={threshold}
				onChange={(v) => (threshold = v)}
			/>
			<PreviewSlider
				title="Edge Softness"
				min={0}
				max={1}
				step={0.05}
				value={edgeSoftness}
				onChange={(v) => (edgeSoftness = v)}
			/>
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.fic-demo__content {
		position: relative;
		z-index: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		padding: 2rem 2.5rem;
		pointer-events: none;
		user-select: none;
	}

	.fic-demo__brand {
		position: absolute;
		top: 1.5rem;
		left: 2rem;
		margin: 0;
		font-size: 1rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	.fic-demo__headline {
		margin: 0;
		max-width: 14ch;
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.03em;
		text-transform: uppercase;
	}

	.fic-demo__hint {
		position: absolute;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.75rem;
		opacity: 0.45;
	}
</style>
