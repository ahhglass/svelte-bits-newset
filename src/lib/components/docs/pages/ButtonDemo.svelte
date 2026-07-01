<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import Button from '$lib/components/library/Components/Button/Button.svelte';
	import source from '$lib/components/library/Components/Button/Button.svelte?raw';

	const DEFAULTS = {
		variant: 'default' as const,
		radius: 'xl' as const,
		size: 'md' as const,
		color: '#FF8A4C',
		textColor: '#0f0f0f',
		ring: 'md' as const,
		ringOpacity: 20,
		sparkle: false,
		sparkleColor: '#ffdd00',
		disabled: false
	};

	let variant = $state(DEFAULTS.variant);
	let radius = $state(DEFAULTS.radius);
	let size = $state(DEFAULTS.size);
	let color = $state(DEFAULTS.color);
	let textColor = $state(DEFAULTS.textColor);
	let ring = $state(DEFAULTS.ring);
	let ringOpacity = $state(DEFAULTS.ringOpacity);
	let sparkle = $state(DEFAULTS.sparkle);
	let sparkleColor = $state(DEFAULTS.sparkleColor);
	let disabled = $state(DEFAULTS.disabled);

	const hasChanges = $derived(
		variant !== DEFAULTS.variant ||
			radius !== DEFAULTS.radius ||
			size !== DEFAULTS.size ||
			color !== DEFAULTS.color ||
			textColor !== DEFAULTS.textColor ||
			ring !== DEFAULTS.ring ||
			ringOpacity !== DEFAULTS.ringOpacity ||
			sparkle !== DEFAULTS.sparkle ||
			sparkleColor !== DEFAULTS.sparkleColor ||
			disabled !== DEFAULTS.disabled
	);

	function reset() {
		variant = DEFAULTS.variant;
		radius = DEFAULTS.radius;
		size = DEFAULTS.size;
		color = DEFAULTS.color;
		textColor = DEFAULTS.textColor;
		ring = DEFAULTS.ring;
		ringOpacity = DEFAULTS.ringOpacity;
		sparkle = DEFAULTS.sparkle;
		sparkleColor = DEFAULTS.sparkleColor;
		disabled = DEFAULTS.disabled;
	}

	const customizeLabels = {
		variant: 'Variant',
		radius: 'Radius',
		size: 'Size',
		color: 'Color',
		textColor: 'Text Color',
		ring: 'Ring',
		ringOpacity: 'Ring Opacity',
		sparkle: 'Sparkle',
		sparkleColor: 'Sparkle Color',
		disabled: 'Disabled'
	} as const;

	const usage = $derived(
		`<Button
  variant="${variant}"
  radius="${radius}"
  size="${size}"
  color="${color}"
  textColor="${textColor}"
  ring="${ring}"
  ringOpacity={${ringOpacity}}
  sparkle={${sparkle}}
  sparkleColor="${sparkleColor}"
  disabled={${disabled}}
>
  Get started
</Button>`
	);

	const props: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline" | "ghost"',
			default: '"default"',
			description: 'Visual style of the button.'
		},
		{
			name: 'radius',
			type: '"none" | "sm" | "md" | "lg" | "xl" | "xxl" | "full"',
			default: '"lg"',
			description: 'Border radius preset.'
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg" | "xl" | "icon"',
			default: '"md"',
			description: 'Button size preset.'
		},
		{ name: 'color', type: 'string', default: '"#0f0f0f"', description: 'Background and border color.' },
		{ name: 'textColor', type: 'string', default: '"#ffffff"', description: 'Label color for filled variant.' },
		{
			name: 'ring',
			type: '"none" | "sm" | "md" | "lg"',
			default: '"md"',
			description: 'Focus and hover ring thickness.'
		},
		{
			name: 'ringOpacity',
			type: 'number',
			default: '20',
			description: 'Ring opacity percentage on hover and focus.'
		},
		{ name: 'sparkle', type: 'boolean', default: 'false', description: 'Enable animated sparkle decoration.' },
		{ name: 'sparkleColor', type: 'string', default: '"#FF8A4C"', description: 'Color of sparkle particles.' },
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction and lower opacity.' }
	];
</script>

<TabsLayout onreset={reset} {hasChanges} componentName="Button" {usage} {source} {props}>
	{#snippet preview()}
		<div
			class="demo-container flex min-h-[280px] flex-col items-center justify-center gap-4 p-8"
			style="background: #14110E;"
		>
			<Button
				{variant}
				{radius}
				{size}
				{color}
				{textColor}
				{ring}
				{ringOpacity}
				{sparkle}
				{sparkleColor}
				{disabled}
			>
				Get started
			</Button>

			<div class="flex flex-wrap items-center justify-center gap-3">
				<Button
					variant="outline"
					radius="full"
					size="sm"
					color="#fafafa"
					textColor="#0f0f0f"
					onclick={() => {}}
				>
					Outline
				</Button>
				<Button variant="ghost" radius="md" size="sm" color="#FF8A4C" onclick={() => {}}>
					Ghost
				</Button>
				<Button
					variant="default"
					radius="full"
					size="icon"
					color="#FF8A4C"
					textColor="#0f0f0f"
					onclick={() => {}}
					aria-label="Like"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
						/>
					</svg>
				</Button>
			</div>
		</div>
	{/snippet}
	{#snippet code()}<DemoCodeTab slug="button" {usage} {source} />{/snippet}
	{#snippet customize()}
		<Customize>
			<PreviewSelect
				title={customizeLabels.variant}
				value={variant}
				options={[
					{ label: 'default', value: 'default' },
					{ label: 'outline', value: 'outline' },
					{ label: 'ghost', value: 'ghost' }
				]}
				onChange={(v) => (variant = v as typeof variant)}
			/>
			<PreviewSelect
				title={customizeLabels.radius}
				value={radius}
				options={['none', 'sm', 'md', 'lg', 'xl', 'xxl', 'full']}
				onChange={(v) => (radius = v as typeof radius)}
			/>
			<PreviewSelect
				title={customizeLabels.size}
				value={size}
				options={[
					{ label: 'sm', value: 'sm' },
					{ label: 'md', value: 'md' },
					{ label: 'lg', value: 'lg' },
					{ label: 'xl', value: 'xl' },
					{ label: 'icon', value: 'icon' }
				]}
				onChange={(v) => (size = v as typeof size)}
			/>
			<PreviewColorPicker title={customizeLabels.color} value={color} onChange={(v) => (color = v)} />
			<PreviewColorPicker
				title={customizeLabels.textColor}
				value={textColor}
				onChange={(v) => (textColor = v)}
			/>
			<PreviewSelect
				title={customizeLabels.ring}
				value={ring}
				options={['none', 'sm', 'md', 'lg']}
				onChange={(v) => (ring = v as typeof ring)}
			/>
			<PreviewSlider
				title={customizeLabels.ringOpacity}
				min={0}
				max={100}
				step={5}
				value={ringOpacity}
				valueUnit="%"
				onChange={(v) => (ringOpacity = v)}
			/>
			<PreviewSwitch title={customizeLabels.sparkle} checked={sparkle} onChange={(v) => (sparkle = v)} />
			<PreviewColorPicker
				title={customizeLabels.sparkleColor}
				value={sparkleColor}
				onChange={(v) => (sparkleColor = v)}
			/>
			<PreviewSwitch title={customizeLabels.disabled} checked={disabled} onChange={(v) => (disabled = v)} />
		</Customize>
	{/snippet}
	{#snippet propTable()}<PropTable rows={props} />{/snippet}
</TabsLayout>
