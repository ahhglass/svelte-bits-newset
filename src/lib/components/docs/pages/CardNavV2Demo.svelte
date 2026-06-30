<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import CardNavV2, { type CardNavV2Item } from '$lib/components/library/Components/CardNavV2/CardNavV2.svelte';
	import source from '$lib/components/library/Components/CardNavV2/CardNavV2.svelte?raw';
	import logoLight from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
	import logoDark from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	type Theme = 'light' | 'dark' | 'color';

	const DEFAULTS = {
		theme: 'light' as Theme,
		baseColor: '#ffffff',
		shellColor: '',
		menuColor: '#000000',
		buttonBgColor: '#111111',
		buttonTextColor: '#ffffff',
		scrollThreshold: 48,
		widthCompact: '28rem',
		widthDefault: '56rem',
		widthExpanded: 'min(80rem, calc(100% - 2.5rem))'
	};

	let theme = $state<Theme>(DEFAULTS.theme);
	let baseColor = $state(DEFAULTS.baseColor);
	let shellColor = $state(DEFAULTS.shellColor);
	let menuColor = $state(DEFAULTS.menuColor);
	let buttonBgColor = $state(DEFAULTS.buttonBgColor);
	let buttonTextColor = $state(DEFAULTS.buttonTextColor);
	let scrollThreshold = $state(DEFAULTS.scrollThreshold);
	let widthCompact = $state(DEFAULTS.widthCompact);
	let widthDefault = $state(DEFAULTS.widthDefault);
	let widthExpanded = $state(DEFAULTS.widthExpanded);
	let key = $state(0);

	const items: CardNavV2Item[] = [
		{
			label: 'About',
			bgColor: '#1B1722',
			textColor: '#fff',
			links: [
				{ label: 'Company', href: '#', ariaLabel: 'About Company' },
				{ label: 'Careers', href: '#', ariaLabel: 'About Careers', badge: 'NEW' }
			]
		},
		{
			label: 'Projects',
			bgColor: '#222222',
			textColor: '#fff',
			links: [
				{ label: 'Featured', href: '#', ariaLabel: 'Featured Projects' },
				{ label: 'Case Studies', href: '#', ariaLabel: 'Project Case Studies' }
			]
		},
		{
			label: 'Contact',
			bgColor: '#222222',
			textColor: '#fff',
			links: [
				{ label: 'Email', href: '#', ariaLabel: 'Email us' },
				{ label: 'Twitter', href: '#', ariaLabel: 'Twitter' },
				{ label: 'LinkedIn', href: '#', ariaLabel: 'LinkedIn' }
			]
		}
	];

	const themeConfigs = {
		light: {
			logo: logoLight,
			baseColor: '#ffffff',
			menuColor: '#000000',
			buttonBgColor: '#111111',
			buttonTextColor: '#ffffff',
			backgroundColor: '#f5f5f5'
		},
		dark: {
			logo: logoDark,
			baseColor: '#120F17',
			menuColor: '#ffffff',
			buttonBgColor: '#FF8A4C',
			buttonTextColor: '#ffffff',
			backgroundColor: '#120F17'
		},
		color: {
			logo: logoDark,
			baseColor: '#FF8A4C',
			menuColor: '#ffffff',
			buttonBgColor: '#ffffff',
			buttonTextColor: '#FF8A4C',
			backgroundColor: '#120F17'
		}
	};

	const previewLogo = $derived(themeConfigs[theme].logo);
	const previewBackground = $derived(themeConfigs[theme].backgroundColor);
	const shellColorProp = $derived(shellColor.trim() || undefined);

	const hasChanges = $derived(
		theme !== DEFAULTS.theme ||
			baseColor !== DEFAULTS.baseColor ||
			shellColor !== DEFAULTS.shellColor ||
			menuColor !== DEFAULTS.menuColor ||
			buttonBgColor !== DEFAULTS.buttonBgColor ||
			buttonTextColor !== DEFAULTS.buttonTextColor ||
			scrollThreshold !== DEFAULTS.scrollThreshold ||
			widthCompact !== DEFAULTS.widthCompact ||
			widthDefault !== DEFAULTS.widthDefault ||
			widthExpanded !== DEFAULTS.widthExpanded
	);

	function applyTheme(next: Theme) {
		theme = next;
		const cfg = themeConfigs[next];
		baseColor = cfg.baseColor;
		menuColor = cfg.menuColor;
		buttonBgColor = cfg.buttonBgColor;
		buttonTextColor = cfg.buttonTextColor;
		shellColor = '';
		key++;
	}

	function reset() {
		theme = DEFAULTS.theme;
		baseColor = DEFAULTS.baseColor;
		shellColor = DEFAULTS.shellColor;
		menuColor = DEFAULTS.menuColor;
		buttonBgColor = DEFAULTS.buttonBgColor;
		buttonTextColor = DEFAULTS.buttonTextColor;
		scrollThreshold = DEFAULTS.scrollThreshold;
		widthCompact = DEFAULTS.widthCompact;
		widthDefault = DEFAULTS.widthDefault;
		widthExpanded = DEFAULTS.widthExpanded;
		key++;
	}

	const usage = $derived(
		`<CardNavV2
  logo={logo}
  items={items}
  baseColor="${baseColor}"
  menuColor="${menuColor}"
  buttonBgColor="${buttonBgColor}"
  buttonTextColor="${buttonTextColor}"
  scrollThreshold={${scrollThreshold}}
  widthCompact="${widthCompact}"
  widthDefault="${widthDefault}"
  widthExpanded="${widthExpanded}"${shellColorProp ? `\n  shellColor="${shellColorProp}"` : ''}
/>`
	);

	const props: PropRow[] = [
		{ name: 'logo', type: 'string', default: '-', description: 'URL for the logo image.' },
		{ name: 'logoAlt', type: 'string', default: '"Logo"', description: 'Alt text for the logo.' },
		{ name: 'logoHref', type: 'string', default: '"#"', description: 'Link target for the logo.' },
		{ name: 'items', type: 'CardNavV2Item[]', default: '-', description: 'Array of nav items with links and optional badges.' },
		{ name: 'class', type: 'string', default: '""', description: 'Extra classes for the container.' },
		{ name: 'baseColor', type: 'string', default: '"#fff"', description: 'Background color of the nav shell.' },
		{ name: 'shellColor', type: 'string', default: '-', description: 'Optional override for shell background (falls back to baseColor).' },
		{ name: 'menuColor', type: 'string', default: '-', description: 'Color for the hamburger lines.' },
		{ name: 'ctaLabel', type: 'string', default: '"Get Started"', description: 'CTA button label.' },
		{ name: 'ctaHref', type: 'string', default: '"#"', description: 'CTA button href.' },
		{ name: 'buttonBgColor', type: 'string', default: '"#111"', description: 'CTA button background color.' },
		{ name: 'buttonTextColor', type: 'string', default: '"#fff"', description: 'CTA button text color.' },
		{ name: 'scrollThreshold', type: 'number', default: '48', description: 'Scroll Y (px) after which the nav shrinks to compact width.' },
		{ name: 'widthCompact', type: 'string', default: '"28rem"', description: 'Nav width when scrolled (menu closed).' },
		{ name: 'widthDefault', type: 'string', default: '"56rem"', description: 'Default nav width at top of page.' },
		{ name: 'widthExpanded', type: 'string', default: 'min(80rem, …)', description: 'Nav width when menu is open.' },
		{ name: 'duration', type: 'string', default: '"0.45s"', description: 'CSS transition duration for open/scroll animations.' },
		{ name: 'ease', type: 'string', default: 'cubic-bezier(…)', description: 'CSS easing for transitions.' },
		{ name: 'maxItems', type: 'number', default: '3', description: 'Maximum number of cards to show.' },
		{ name: 'actions', type: 'Snippet', default: '-', description: 'Optional slot for custom actions (e.g. MetallicPaint, Button).' }
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="CardNavV2" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container demo-container-dots"
			style="position:relative;height:550px;overflow:hidden;background:{previewBackground};"
		>
			{#key key}
				<CardNavV2
					logo={previewLogo}
					{items}
					{baseColor}
					shellColor={shellColorProp}
					{menuColor}
					{buttonBgColor}
					{buttonTextColor}
					{scrollThreshold}
					{widthCompact}
					{widthDefault}
					{widthExpanded}
				/>
			{/key}
			<p
				style="position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);margin:0;font-size:0.75rem;color:rgba(255,255,255,0.45);white-space:nowrap; mix-blend-mode: exclusion;"
			>
				Скроллируйте страницу, чтобы увидеть компактную ширину · откройте меню, чтобы увидеть расширенные
				карточки
			</p>
		</div>
	{/snippet}
	{#snippet code()}
		<DemoCodeTab slug="card-nav-v2" {usage} {source} />
	{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title="Example"
				value={theme}
				options={[
					{ label: 'Light Mode', value: 'light' },
					{ label: 'Dark Mode', value: 'dark' },
					{ label: 'Colorful', value: 'color' }
				]}
				onChange={(v) => applyTheme(v as Theme)}
			/>
			<PreviewColorPicker title="baseColor" value={baseColor} onChange={(v) => (baseColor = v)} />
			<PreviewInput
				title="shellColor"
				value={shellColor}
				placeholder="empty = baseColor"
				onChange={(v) => (shellColor = v)}
			/>
			<PreviewColorPicker title="menuColor" value={menuColor} onChange={(v) => (menuColor = v)} />
			<PreviewColorPicker
				title="buttonBgColor"
				value={buttonBgColor}
				onChange={(v) => (buttonBgColor = v)}
			/>
			<PreviewColorPicker
				title="buttonTextColor"
				value={buttonTextColor}
				onChange={(v) => (buttonTextColor = v)}
			/>
			<PreviewSlider
				title="scrollThreshold"
				min={0}
				max={200}
				step={8}
				value={scrollThreshold}
				valueUnit="px"
				onChange={(v) => (scrollThreshold = v)}
			/>
			<PreviewInput title="widthCompact" value={widthCompact} onChange={(v) => (widthCompact = v)} />
			<PreviewInput title="widthDefault" value={widthDefault} onChange={(v) => (widthDefault = v)} />
			<PreviewInput title="widthExpanded" value={widthExpanded} onChange={(v) => (widthExpanded = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}
		<PropTable rows={props} />
	{/snippet}
</TabsLayout>
