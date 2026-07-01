<!-- @svelte-bits
{
  "title": "Button",
  "description": "Customizable button with variants, focus ring, and optional sparkle decoration.",
  "dependencies": []
}
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	export type ButtonVariant = 'default' | 'outline' | 'ghost';
	export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
	export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';
	export type ButtonRing = 'none' | 'sm' | 'md' | 'lg';

	type Sparkle = {
		id: string;
		createdAt: number;
		color: string;
		size: number;
		style: { top: string; left: string };
	};

	type Props = {
		children?: Snippet;
		variant?: ButtonVariant;
		radius?: ButtonRadius;
		size?: ButtonSize;
		color?: string;
		textColor?: string;
		ring?: ButtonRing;
		ringOpacity?: number;
		disabled?: boolean;
		sparkle?: boolean;
		sparkleColor?: string;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		children,
		variant = 'default',
		radius = 'lg',
		size = 'md',
		color = '#0f0f0f',
		textColor = '#ffffff',
		ring = 'md',
		ringOpacity = 20,
		disabled = false,
		sparkle = false,
		sparkleColor = '#FF8A4C',
		type = 'button',
		class: className = '',
		onclick
	}: Props = $props();

	let sparkles = $state<Sparkle[]>([]);

	const radiusValues = {
		none: '0px',
		sm: '4px',
		md: '6px',
		lg: '8px',
		xl: '12px',
		xxl: '16px',
		full: '9999px'
	} satisfies Record<ButtonRadius, string>;

	const sizeMap = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 text-sm',
		lg: 'h-12 px-6 text-base',
		xl: 'h-14 px-8 text-lg',
		icon: 'h-10 w-10 p-0'
	} satisfies Record<ButtonSize, string>;

	const ringMap = {
		none: '0px',
		sm: '2px',
		md: '4px',
		lg: '8px'
	} satisfies Record<ButtonRing, string>;

	const variants = {
		default: 'sb-button--default',
		outline: 'sb-button--outline',
		ghost: 'sb-button--ghost'
	} satisfies Record<ButtonVariant, string>;

	const showSparkle = $derived(sparkle && !disabled);

	const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

	const generateSparkle = (): Sparkle => ({
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		color: sparkleColor,
		size: random(10, 20),
		style: {
			top: `${random(-10, 80)}%`,
			left: `${random(0, 100)}%`
		}
	});

	$effect(() => {
		void sparkleColor;

		if (!showSparkle) {
			sparkles = [];
			return;
		}

		const interval = setInterval(() => {
			const now = Date.now();
			sparkles = sparkles.filter((item) => now - item.createdAt < 1500).concat(generateSparkle());
		}, 400);

		return () => clearInterval(interval);
	});
</script>

{#if showSparkle}
	<div class="sb-button-sparkle-wrap relative inline-flex">
		{#each sparkles as item (item.id)}
			<div
				class="sb-button-sparkle pointer-events-none absolute z-[2] flex"
				style="top: {item.style.top}; left: {item.style.left};"
			>
				<svg
					width={item.size}
					height={item.size}
					viewBox="0 0 160 160"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="sb-button-sparkle-icon"
					aria-hidden="true"
				>
					<path
						d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
						fill={item.color}
					/>
				</svg>
			</div>
		{/each}

		<span class="relative z-[1] inline-flex">
			{@render button()}
		</span>
	</div>
{:else}
	{@render button()}
{/if}

{#snippet button()}
	<button
		{type}
		{disabled}
		{onclick}
		style="
			--button-color:{color};
			--button-text:{textColor};
			--button-ring-size:{ringMap[ring]};
			--button-ring-opacity:{ringOpacity}%;
			--button-radius:{radiusValues[radius]};
		"
		class="
			sb-button inline-flex cursor-pointer items-center justify-center border font-medium
			transition-[filter,box-shadow,transform,color,background-color,border-color] duration-200 ease-out
			active:scale-[0.98] focus-visible:outline-none
			disabled:pointer-events-none disabled:opacity-50
			{variants[variant]}
			{sizeMap[size]}
			{className}
		"
	>
		{@render children?.()}
	</button>
{/snippet}

<style>
	.sb-button {
		border-radius: var(--button-radius);
	}

	.sb-button--default {
		background-color: var(--button-color);
		border-color: var(--button-color);
		color: var(--button-text);
	}

	.sb-button--outline {
		background-color: transparent;
		border-color: var(--button-color);
		color: var(--button-color);
	}

	.sb-button--outline:hover:not(:disabled) {
		background-color: var(--button-color);
		color: var(--button-text);
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button--ghost:hover:not(:disabled) {
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button--ghost {
		background-color: transparent;
		border-color: transparent;
		color: var(--button-color);
	}

	.sb-button--default:hover:not(:disabled) {
		filter: brightness(0.95);
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button--default:focus-visible,
	.sb-button--outline:focus-visible,
	.sb-button--ghost:focus-visible {
		box-shadow: 0 0 0 var(--button-ring-size)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button--default:active:not(:disabled) {
		filter: brightness(0.9);
		box-shadow: 0 0 0 calc(var(--button-ring-size) - 1px)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button--outline:active:not(:disabled),
	.sb-button--ghost:active:not(:disabled) {
		box-shadow: 0 0 0 calc(var(--button-ring-size) - 1px)
			color-mix(in srgb, var(--button-color) var(--button-ring-opacity), transparent);
	}

	.sb-button-sparkle {
		animation: sb-button-sparkle-grow 900ms ease-in-out forwards;
	}

	.sb-button-sparkle-icon {
		animation: sb-button-sparkle-spin 900ms linear forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		.sb-button-sparkle {
			animation: none;
			transform: scale(1);
			opacity: 1;
		}

		.sb-button-sparkle-icon {
			animation: none;
			transform: rotate(180deg);
		}
	}

	@keyframes sb-button-sparkle-grow {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}

	@keyframes sb-button-sparkle-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(180deg);
		}
	}
</style>
