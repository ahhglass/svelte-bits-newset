<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import DraggablePillNav from '$lib/components/library/Components/DraggablePillNav/DraggablePillNav.svelte';
	import source from '$lib/components/library/Components/DraggablePillNav/DraggablePillNav.svelte?raw';

	const LOGO = '/vendor/brands/svelte.svg';

	const themePresets = {
		light: {
			drawerColor: '#e8e6e7',
			pillColor: '#fafafa',
			pillHoverColor: '#f4f4f4',
			textColor: '#0f0f0f',
			togglerColor: '#d3d2d2',
			dropZoneBorderColor: 'rgba(0, 0, 0, 0.5)',
			backgroundColor: '#f0f0f0'
		},
		dark: {
			drawerColor: '#2a2630',
			pillColor: '#120F17',
			pillHoverColor: '#1a1620',
			textColor: '#fafafa',
			togglerColor: '#3d3847',
			dropZoneBorderColor: 'rgba(255, 255, 255, 0.35)',
			backgroundColor: '#120F17'
		}
	} as const;

	const DEFAULTS = {
		theme: 'light' as const,
		snapThreshold: 200,
		...themePresets.light
	};

	let theme = $state<'light' | 'dark'>(DEFAULTS.theme);
	let snapThreshold = $state(DEFAULTS.snapThreshold);
	let drawerColor = $state<string>(DEFAULTS.drawerColor);
	let pillColor = $state<string>(DEFAULTS.pillColor);
	let pillHoverColor = $state<string>(DEFAULTS.pillHoverColor);
	let textColor = $state<string>(DEFAULTS.textColor);
	let togglerColor = $state<string>(DEFAULTS.togglerColor);
	let dropZoneBorderColor = $state<string>(DEFAULTS.dropZoneBorderColor);

	const backgroundColor = $derived(themePresets[theme].backgroundColor);

	const hasChanges = $derived(
		theme !== DEFAULTS.theme ||
			snapThreshold !== DEFAULTS.snapThreshold ||
			drawerColor !== DEFAULTS.drawerColor ||
			pillColor !== DEFAULTS.pillColor ||
			pillHoverColor !== DEFAULTS.pillHoverColor ||
			textColor !== DEFAULTS.textColor ||
			togglerColor !== DEFAULTS.togglerColor ||
			dropZoneBorderColor !== DEFAULTS.dropZoneBorderColor
	);

	function reset() {
		theme = DEFAULTS.theme;
		snapThreshold = DEFAULTS.snapThreshold;
		drawerColor = DEFAULTS.drawerColor;
		pillColor = DEFAULTS.pillColor;
		pillHoverColor = DEFAULTS.pillHoverColor;
		textColor = DEFAULTS.textColor;
		togglerColor = DEFAULTS.togglerColor;
		dropZoneBorderColor = DEFAULTS.dropZoneBorderColor;
	}

	function applyTheme(next: 'light' | 'dark') {
		theme = next;
		const preset = themePresets[next];
		drawerColor = preset.drawerColor;
		pillColor = preset.pillColor;
		pillHoverColor = preset.pillHoverColor;
		textColor = preset.textColor;
		togglerColor = preset.togglerColor;
		dropZoneBorderColor = preset.dropZoneBorderColor;
	}

	const customizeLabels = {
		theme: 'Theme',
		snapThreshold: 'Snap Threshold',
		drawerColor: 'Drawer Color',
		pillColor: 'Pill Color',
		pillHoverColor: 'Pill Hover Color',
		textColor: 'Text Color',
		togglerColor: 'Toggler Color'
	} as const;

	const themeOptions = [
		{ value: 'light', label: 'Светлая тема' },
		{ value: 'dark', label: 'Тёмная тема' }
	];

	const navKey = $derived(
		[
			theme,
			snapThreshold,
			drawerColor,
			pillColor,
			pillHoverColor,
			textColor,
			togglerColor,
			dropZoneBorderColor
		].join('-')
	);

	const usage = $derived(
		`<DraggablePillNav
  logo="/vendor/brands/svelte.svg"
  logoAlt="Svelte"
  snapThreshold={${snapThreshold}}
  drawerColor="${drawerColor}"
  pillColor="${pillColor}"
  pillHoverColor="${pillHoverColor}"
  textColor="${textColor}"
  togglerColor="${togglerColor}"
  items={[{ label: 'Home', href: '/' }]}
/>`
	);

	const props: PropRow[] = [
		{ name: 'logo', type: 'string', default: '-', description: 'Logo image URL.' },
		{ name: 'logoAlt', type: 'string', default: '"Logo"', description: 'Alt text for the logo.' },
		{ name: 'items', type: 'DraggablePillNavItem[]', default: '-', description: 'Nav items { label, href, ariaLabel? }.' },
		{
			name: 'useFixedPosition',
			type: 'boolean',
			default: 'true',
			description: 'Fixed vs absolute positioning (use false inside a demo container).'
		},
		{ name: 'initialTop', type: 'string', default: '"2rem"', description: 'Initial top offset of the nav pill.' },
		{ name: 'initialLeft', type: 'string', default: '"2rem"', description: 'Initial left offset of the nav pill.' },
		{
			name: 'snapThreshold',
			type: 'number',
			default: '200',
			description: 'Distance in px (x and y) to show snap zone and return home.'
		},
		{ name: 'drawerColor', type: 'string', default: '"#e8e6e7"', description: 'Outer pill background.' },
		{ name: 'pillColor', type: 'string', default: '"#fafafa"', description: 'Inner nav item pill background.' },
		{ name: 'pillHoverColor', type: 'string', default: '"#f4f4f4"', description: 'Nav item hover background.' },
		{ name: 'textColor', type: 'string', default: '"#0f0f0f"', description: 'Text and toggler line color.' },
		{ name: 'togglerColor', type: 'string', default: '"#d3d2d2"', description: 'Menu toggler button background.' },
		{
			name: 'dropZoneBorderColor',
			type: 'string',
			default: 'rgba(0,0,0,0.5)',
			description: 'Dashed snap zone border color.'
		}
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="DraggablePillNav" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container demo-container-dots"
			style="position:relative;height:420px;overflow:hidden;background:{backgroundColor};"
		>
			<p class="demo-hint">Перетащите навигацию — отпустите у исходной точки, чтобы вернуть на место</p>
			{#key navKey}
				<DraggablePillNav
					logo={LOGO}
					logoAlt="Svelte"
					{snapThreshold}
					{drawerColor}
					{pillColor}
					{pillHoverColor}
					{textColor}
					{togglerColor}
					{dropZoneBorderColor}
					useFixedPosition={false}
					items={[
						{ label: 'Home', href: '#' },
						{ label: 'About', href: '#about' },
						{ label: 'Blog', href: '#blog' },
						{ label: 'Contact', href: '#contact' }
					]}
				/>
			{/key}
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="draggable-pill-nav" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title={customizeLabels.theme}
				options={themeOptions}
				value={theme}
				onChange={(v) => applyTheme(v as 'light' | 'dark')}
			/>
			<PreviewSlider
				title={customizeLabels.snapThreshold}
				min={80}
				max={400}
				step={10}
				value={snapThreshold}
				valueUnit="px"
				onChange={(v) => (snapThreshold = v)}
			/>
			<PreviewColorPicker title={customizeLabels.drawerColor} value={drawerColor} onChange={(v) => (drawerColor = v)} />
			<PreviewColorPicker title={customizeLabels.pillColor} value={pillColor} onChange={(v) => (pillColor = v)} />
			<PreviewColorPicker title={customizeLabels.pillHoverColor} value={pillHoverColor} onChange={(v) => (pillHoverColor = v)} />
			<PreviewColorPicker title={customizeLabels.textColor} value={textColor} onChange={(v) => (textColor = v)} />
			<PreviewColorPicker title={customizeLabels.togglerColor} value={togglerColor} onChange={(v) => (togglerColor = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>

<style>
	.demo-hint {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.55;
		mix-blend-mode: difference;
		text-align: center;
		pointer-events: none;
		user-select: none;
		white-space: nowrap;
	}
</style>
