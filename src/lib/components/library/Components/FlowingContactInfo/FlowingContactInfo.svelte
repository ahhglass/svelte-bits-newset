<!-- @svelte-bits
{
  "title": "Flowing Contact Info",
  "description": "Infinite scroll contact rows with expanding gap animation and centered brand icon swap.",
  "dependencies": ["gsap", "lenis"]
}
-->
<script module lang="ts">
	export type FlowingContactItem = {
		label: string;
		value: string;
		icon: string;
		iconAlt?: string;
	};

	export const DEFAULT_FLOWING_CONTACT_ITEMS: FlowingContactItem[] = [
		{ label: 'Animation', value: 'GSAP', icon: '/vendor/brands/gsap.svg', iconAlt: 'GSAP' },
		{ label: 'Framework', value: 'Svelte 5', icon: '/vendor/brands/svelte.svg', iconAlt: 'Svelte' },
		{ label: 'Styling', value: 'Tailwind CSS', icon: '/vendor/brands/tailwind-css.svg', iconAlt: 'Tailwind CSS' },
		{ label: 'Language', value: 'TypeScript', icon: '/vendor/brands/typescript.svg', iconAlt: 'TypeScript' },
		{ label: 'Bundler', value: 'Vite', icon: '/vendor/brands/vite.svg', iconAlt: 'Vite' },
		{ label: 'Deploy', value: 'Vercel', icon: '/vendor/brands/vercel.svg', iconAlt: 'Vercel' },
		{ label: 'Components', value: 'Svelte Bits', icon: '/vendor/brands/svelte-mono.svg', iconAlt: 'Svelte Bits' }
	];
</script>

<script lang="ts">
	import { gsap } from 'gsap';
	import Lenis from 'lenis';

	type Props = {
		items?: FlowingContactItem[];
		cloneCount?: number;
		rowMaxGap?: number;
		mobileRowMaxGap?: number;
		flowRadius?: number;
		flowSoftness?: number;
		enableLenis?: boolean;
		infiniteScroll?: boolean;
		useWindowScroll?: boolean;
		backgroundColor?: string;
		textColor?: string;
		mutedColor?: string;
		iconSize?: string;
		mobileIconSize?: string;
		centerThreshold?: number;
		class?: string;
	};

	let {
		items = DEFAULT_FLOWING_CONTACT_ITEMS,
		cloneCount = 10,
		rowMaxGap,
		mobileRowMaxGap = 5,
		flowRadius = 0.42,
		flowSoftness = 0.72,
		enableLenis = true,
		infiniteScroll = true,
		useWindowScroll = false,
		backgroundColor = '#0a0a0a',
		textColor = '#ffffff',
		mutedColor = '#888888',
		iconSize = '8rem',
		mobileIconSize = '4rem',
		centerThreshold = 25,
		class: className = ''
	}: Props = $props();

	let rootEl = $state<HTMLElement | undefined>();
	let visualEl = $state<HTMLElement | undefined>();
	let scrollerEl = $state<HTMLDivElement | undefined>();
	let contentEl = $state<HTMLDivElement | undefined>();
	let iconEl = $state<HTMLImageElement | undefined>();
	let activeIconIndex = $state(0);

	const cssVars = $derived(
		`--fci-bg:${backgroundColor};--fci-text:${textColor};--fci-muted:${mutedColor};--fci-icon:${iconSize};--fci-icon-mobile:${mobileIconSize};`
	);

	const clones = $derived(Array.from({ length: Math.max(1, cloneCount) }, (_, i) => i));

	$effect(() => {
		void items;
		void cloneCount;
		void rowMaxGap;
		void mobileRowMaxGap;
		void flowRadius;
		void flowSoftness;
		void enableLenis;
		void infiniteScroll;
		void useWindowScroll;
		void centerThreshold;

		const root = rootEl;
		const visual = visualEl;
		const scroller = useWindowScroll ? undefined : scrollerEl;
		const content = useWindowScroll ? undefined : contentEl;
		const icon = iconEl;

		if (!root || !visual || !icon) return;
		if (!useWindowScroll && (!scroller || !content)) return;

		let active = true;
		let lenis: Lenis | null = null;
		let lenisTicker: ((time: number) => void) | null = null;
		let lastCenteredRow: Element | null = null;

		const getMaxGap = () => {
			if (rowMaxGap !== undefined) return rowMaxGap;
			return window.innerWidth < 1000 ? mobileRowMaxGap : 10;
		};

		const getViewportCenter = () => {
			if (useWindowScroll) return window.innerHeight / 2;
			const rect = scroller!.getBoundingClientRect();
			return rect.top + rect.height / 2;
		};

		const getViewportHeight = () =>
			useWindowScroll ? window.innerHeight : scroller!.clientHeight;

		const smoothstep = (x: number) => x * x * (3 - 2 * x);

		const updateRowFlows = () => {
			const center = getViewportCenter();
			const maxGap = getMaxGap();
			const minGap = 1;
			const height = getViewportHeight();
			const radius = height * flowRadius;
			const softness = Math.min(1, Math.max(0, flowSoftness));

			root.querySelectorAll<HTMLElement>('.fci-row').forEach((row) => {
				const rect = row.getBoundingClientRect();
				const rowCenter = rect.top + rect.height / 2;
				const dist = Math.abs(rowCenter - center);

				if (dist >= radius || radius <= 0) {
					row.style.gap = `${minGap}rem`;
					return;
				}

				// Diamond base (1 - t) → straight diagonals; smoothstep softens the rhombus tips
				const t = dist / radius;
				const diamond = 1 - t;
				const softened = smoothstep(diamond);
				const factor = diamond + (softened - diamond) * softness;
				const gap = minGap + (maxGap - minGap) * factor;
				row.style.gap = `${gap}rem`;
			});
		};

		const updateCenteredIcon = () => {
			const rows = root.querySelectorAll<HTMLElement>('.fci-row');
			const center = getViewportCenter();
			let closestRow: HTMLElement | null = null;
			let closestDistance = Infinity;

			rows.forEach((row) => {
				const rect = row.getBoundingClientRect();
				const rowCenter = rect.top + rect.height / 2;
				const distance = Math.abs(rowCenter - center);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestRow = row;
				}
			});

			if (!closestRow || closestDistance >= centerThreshold) return;
			if (closestRow === lastCenteredRow) return;

			lastCenteredRow = closestRow;
			const rowEl = closestRow as HTMLElement;
			const index = Number.parseInt(rowEl.dataset.itemIndex ?? '0', 10);
			const safeIndex = Number.isFinite(index) ? index : 0;
			const next = items[safeIndex % items.length];
			if (!next) return;

			activeIconIndex = safeIndex % items.length;
			icon.src = next.icon;
			icon.alt = next.iconAlt ?? next.label;
		};

		const onScroll = () => {
			updateRowFlows();
			updateCenteredIcon();
		};

		const setupLenis = () => {
			if (!enableLenis) return;

			lenisTicker = (time: number) => {
				lenis?.raf(time * 1000);
			};

			if (useWindowScroll) {
				lenis = new Lenis({
					infinite: infiniteScroll,
					lerp: 0.08,
					smoothWheel: true
				});
			} else {
				lenis = new Lenis({
					wrapper: scroller!,
					content: content!,
					infinite: infiniteScroll,
					lerp: 0.08,
					smoothWheel: true,
					gestureOrientation: 'vertical'
				});
			}

			lenis.on('scroll', onScroll);
			gsap.ticker.add(lenisTicker);
			gsap.ticker.lagSmoothing(0);
		};

		setupLenis();

		const scrollTarget = useWindowScroll ? window : scroller!;
		if (!enableLenis) {
			scrollTarget.addEventListener('scroll', onScroll, { passive: true });
		}

		const onResize = () => onScroll();
		window.addEventListener('resize', onResize);

		requestAnimationFrame(() => {
			if (!active) return;
			onScroll();
		});

		return () => {
			active = false;
			if (lenisTicker) gsap.ticker.remove(lenisTicker);
			lenis?.destroy();
			if (!enableLenis) {
				scrollTarget.removeEventListener('scroll', onScroll);
			}
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<section
	class="fci-root {className}"
	bind:this={rootEl}
	style={cssVars}
	aria-label="Flowing contact information"
>
	<div class="fci-visual" bind:this={visualEl} aria-hidden="true">
		<div class="fci-icon">
			<img
				bind:this={iconEl}
				src={items[activeIconIndex]?.icon ?? items[0]?.icon}
				alt={items[activeIconIndex]?.iconAlt ?? items[activeIconIndex]?.label ?? ''}
				class="fci-icon__img"
			/>
		</div>
	</div>

	<div
		class="fci-scroller"
		class:fci-scroller--window={useWindowScroll}
		class:fci-scroller--native={!enableLenis && !useWindowScroll}
		bind:this={scrollerEl}
	>
		<div class="fci-content" bind:this={contentEl}>
			{#each clones as cloneIndex (cloneIndex)}
				<section class="fci-info" aria-hidden={cloneIndex > 0 ? 'true' : undefined}>
					{#each items as item, itemIndex ( `${cloneIndex}-${itemIndex}` )}
						<div class="fci-row" data-item-index={itemIndex} style="gap: 1rem;">
							<p class="fci-label">{item.label}</p>
							<p class="fci-value">{item.value}</p>
						</div>
					{/each}
				</section>
			{/each}
		</div>
	</div>
</section>

<style>
	.fci-root {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		background: var(--fci-bg);
		color: var(--fci-text);
		overflow: hidden;
	}

	.fci-visual {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.fci-icon {
		width: var(--fci-icon);
		height: var(--fci-icon);
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	.fci-icon__img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.fci-scroller {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.fci-scroller--native {
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: none;
	}

	.fci-scroller--native::-webkit-scrollbar {
		display: none;
	}

	.fci-scroller--window {
		height: auto;
		overflow: visible;
	}

	.fci-content {
		position: relative;
		width: 100%;
	}

	.fci-scroller:not(.fci-scroller--window) .fci-info {
		height: 100%;
		min-height: 100%;
	}

	.fci-scroller--window .fci-info {
		height: 100svh;
	}

	.fci-info {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		overflow: hidden;
		padding-inline: 1rem;
		box-sizing: border-box;
	}

	.fci-row {
		display: flex;
		justify-content: center;
		align-items: center;
		width: min(100%, 42rem);
		max-width: 42rem;
		will-change: gap;
	}

	.fci-label,
	.fci-value {
		flex: 1 1 0;
		min-width: 0;
		margin: 0;
		font-size: clamp(0.85rem, 2.4vw, 1.4rem);
		font-weight: 400;
		line-height: 0.95;
		letter-spacing: -0.025rem;
		white-space: nowrap;
	}

	.fci-label {
		text-align: right;
	}

	.fci-value {
		color: var(--fci-muted);
		text-align: left;
	}

	@media (max-width: 1000px) {
		.fci-row {
			width: min(100%, 32rem);
		}

		.fci-label,
		.fci-value {
			font-size: clamp(0.75rem, 3.2vw, 1rem);
		}

		.fci-icon {
			width: var(--fci-icon-mobile);
			height: var(--fci-icon-mobile);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fci-row {
			will-change: auto;
		}
	}
</style>
