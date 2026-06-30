<!-- @svelte-bits
{
  "title": "Card Nav v2",
  "description": "Expandable card navbar with CSS scroll-shrink, backdrop overlay, and fixed-center logo — no GSAP.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type CardNavV2Link = {
		label: string;
		href: string;
		ariaLabel: string;
		badge?: string;
	};
	export type CardNavV2Item = {
		label: string;
		bgColor: string;
		textColor: string;
		links: CardNavV2Link[];
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';

	type Props = {
		logo: string;
		logoAlt?: string;
		logoHref?: string;
		items: CardNavV2Item[];
		class?: string;
		baseColor?: string;
		shellColor?: string;
		menuColor?: string;
		menuAriaLabel?: string;
		closeMenuAriaLabel?: string;
		ctaLabel?: string;
		ctaHref?: string;
		buttonBgColor?: string;
		buttonTextColor?: string;
		widthCompact?: string;
		widthDefault?: string;
		widthExpanded?: string;
		duration?: string;
		ease?: string;
		scrollThreshold?: number;
		maxItems?: number;
		topHeight?: string;
		logoSnippet?: Snippet;
		actions?: Snippet;
	};

	let {
		logo,
		logoAlt = 'Logo',
		logoHref = '#',
		items,
		class: className = '',
		baseColor = '#fff',
		shellColor,
		menuColor,
		menuAriaLabel = 'Open menu',
		closeMenuAriaLabel = 'Close menu',
		ctaLabel = 'Get Started',
		ctaHref = '#',
		buttonBgColor = '#111',
		buttonTextColor = '#fff',
		widthCompact = '28rem',
		widthDefault = '56rem',
		widthExpanded = 'min(80rem, calc(100% - 2.5rem))',
		duration = '0.45s',
		ease = 'cubic-bezier(0.65, 0.05, 0, 1)',
		scrollThreshold = 48,
		maxItems = 3,
		topHeight = '60px',
		logoSnippet,
		actions
	}: Props = $props();

	const isExternalHref = (href: string) => /^[a-z][a-z0-9+.-]*:/i.test(href);

	let menuOpen = $state(false);
	let scrolled = $state(false);
	let scrollSynced = $state(false);
	let menuButton = $state<HTMLDivElement | null>(null);

	const visibleItems = $derived((items ?? []).slice(0, maxItems));
	const menuAria = $derived(menuOpen ? closeMenuAriaLabel : menuAriaLabel);
	const motionEnabled = $derived(!prefersReducedMotion.current);
	const shellBackground = $derived(shellColor ?? baseColor);

	async function closeMenu() {
		if (!menuOpen) return;

		const active = document.activeElement;
		if (active instanceof HTMLElement && active.closest('#card-nav-v2-panel')) {
			menuButton?.focus();
			await tick();
		}

		menuOpen = false;
	}

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function handleCtaClick() {
		closeMenu();
		if (isExternalHref(ctaHref)) {
			window.open(ctaHref, '_blank', 'noopener,noreferrer');
		}
	}

	function handleLinkClick() {
		void closeMenu();
	}

	function syncScroll() {
		scrolled = window.scrollY > scrollThreshold;
	}

	onMount(() => {
		syncScroll();
		scrollSynced = true;
		window.addEventListener('scroll', syncScroll, { passive: true });
		window.addEventListener('pageshow', syncScroll);

		return () => {
			window.removeEventListener('scroll', syncScroll);
			window.removeEventListener('pageshow', syncScroll);
			document.body.classList.remove('card-nav-v2-open');
		};
	});

	$effect(() => {
		document.body.classList.toggle('card-nav-v2-open', menuOpen);
	});
</script>

{#snippet linkIcon()}
	<svg
		class="card-nav-v2__link-icon shrink-0"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<line x1="7" y1="17" x2="17" y2="7" />
		<polyline points="7 7 17 7 17 17" />
	</svg>
{/snippet}

{#snippet navLink(lnk: CardNavV2Link)}
	<a
		class="card-nav-v2__link"
		href={lnk.href}
		aria-label={lnk.ariaLabel}
		target={isExternalHref(lnk.href) ? '_blank' : undefined}
		rel={isExternalHref(lnk.href) ? 'external noopener noreferrer' : undefined}
		onclick={handleLinkClick}
	>
		{@render linkIcon()}
		<span class="card-nav-v2__link-text">
			<span class="card-nav-v2__link-label">{lnk.label}</span>
			{#if lnk.badge}
				<span class="card-nav-v2__link-badge">{lnk.badge}</span>
			{/if}
		</span>
	</a>
{/snippet}

{#snippet defaultLogo()}
	<img src={logo} alt={logoAlt} class="h-[28px] w-auto" />
{/snippet}

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<div
	class="card-nav-v2-container pointer-events-none absolute inset-0 z-[99] flex justify-center px-3 pt-[1.2em] md:pt-[2em] md:px-5 {className}"
	style:--nav-duration={duration}
	style:--nav-ease={ease}
	style:--nav-width-compact={widthCompact}
	style:--nav-width-default={widthDefault}
	style:--nav-width-expanded={widthExpanded}
	style:--nav-top-height={topHeight}
	style:--nav-shell-bg={shellBackground}
>
	<div
		class="card-nav-v2__backdrop pointer-events-none absolute inset-0 z-0 opacity-0"
		aria-hidden="true"
		data-open={menuOpen ? 'true' : 'false'}
		onclick={closeMenu}
	></div>

	<nav
		class="card-nav-v2 pointer-events-none relative z-[1] w-full max-w-full"
		data-open={menuOpen ? 'true' : 'false'}
		data-scrolled={scrolled ? 'true' : 'false'}
		data-scroll-synced={scrollSynced ? 'true' : 'false'}
		data-motion={motionEnabled ? 'true' : 'false'}
		aria-label="Main navigation"
	>
		<div class="card-nav-v2__brand pointer-events-auto">
			{#if logoHref}
				<a
					href={logoHref}
					class="inline-flex items-center justify-center"
					aria-label={logoAlt}
					onclick={closeMenu}
				>
					{#if logoSnippet}
						{@render logoSnippet()}
					{:else}
						{@render defaultLogo()}
					{/if}
				</a>
			{:else}
				<div class="inline-flex items-center justify-center">
					{#if logoSnippet}
						{@render logoSnippet()}
					{:else}
						{@render defaultLogo()}
					{/if}
				</div>
			{/if}
		</div>

		<div class="pointer-events-auto w-full">
			<div class="card-nav-v2__width mx-auto w-full">
				<div class="card-nav-v2__shell relative overflow-hidden rounded-xl shadow-md">
					<div class="card-nav-v2__top relative z-[2] px-4">
						<div class="card-nav-v2__top-bar">
							<div
								bind:this={menuButton}
								class="card-nav-v2__menu group flex min-h-12 min-w-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-[6px] rounded-lg"
								role="button"
								aria-label={menuAria}
								aria-expanded={menuOpen}
								aria-controls="card-nav-v2-panel"
								tabindex="0"
								onclick={toggleMenu}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										toggleMenu();
									}
								}}
								style:color={menuColor ?? '#000'}
							>
								<div
									class="h-[2px] w-[30px] rounded-sm bg-current transition-[transform,opacity] origin-center {menuOpen
										? 'translate-y-[4px] rotate-45'
										: ''} group-hover:opacity-75"
								></div>
								<div
									class="h-[2px] w-[30px] rounded-sm bg-current transition-[transform,opacity] origin-center {menuOpen
										? '-translate-y-[4px] -rotate-45'
										: ''} group-hover:opacity-75"
								></div>
							</div>

							<div class="card-nav-v2__actions flex items-center justify-end">
								{#if actions}
									{@render actions()}
								{:else}
									<!-- Custom actions slot: e.g. MetallicPaint logo, Button CTA -->
									<div class="hidden md:block">
										<button
											type="button"
											class="card-nav-v2__cta inline-flex h-full min-h-[2.5rem] cursor-pointer items-center rounded-[calc(0.75rem-0.2rem)] border-0 px-4 text-sm font-medium transition-opacity duration-300 hover:opacity-90"
											style:background-color={buttonBgColor}
											style:color={buttonTextColor}
											onclick={handleCtaClick}
										>
											{ctaLabel}
										</button>
									</div>
									<div class="w-12 shrink-0 md:hidden" aria-hidden="true"></div>
								{/if}
							</div>
						</div>
					</div>

					<div class="card-nav-v2__panel-clip" id="card-nav-v2-panel">
						<div class="card-nav-v2__panel">
							<div
								class="card-nav-v2__panel-inner flex flex-col gap-2 p-2 md:flex-row md:items-stretch md:gap-3 md:p-3"
								inert={!menuOpen}
							>
								{#each visibleItems as item (item.label)}
									<div
										class="card-nav-v2__card flex min-h-[60px] min-w-0 flex-1 flex-col gap-8 rounded-[0.55rem] p-3 md:min-h-[140px] md:p-4"
										style:background-color={item.bgColor}
										style:color={item.textColor}
									>
										<div class="text-lg font-normal tracking-[-0.5px] md:text-xl">{item.label}</div>
										<div class="mt-auto flex flex-col gap-0.5">
											{#each item.links ?? [] as lnk (lnk.href + lnk.label)}
												{@render navLink(lnk)}
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</nav>
</div>

<style>
	.card-nav-v2 {
		--nav-logo-top: calc(var(--nav-top-height) / 2);
	}

	.card-nav-v2__brand {
		position: absolute;
		left: 50%;
		top: var(--nav-logo-top);
		z-index: 100;
		transform: translate3d(-50%, -50%, 0);
		backface-visibility: hidden;
	}

	.card-nav-v2__shell {
		background: color-mix(in srgb, var(--nav-shell-bg) 92%, transparent);
		backdrop-filter: blur(8px);
	}

	.card-nav-v2__top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--nav-top-height);
	}

	.card-nav-v2__actions {
		min-width: 3rem;
	}

	.card-nav-v2__menu {
		margin-left: -0.625rem;
		transition:
			transform var(--nav-duration) var(--nav-ease),
			opacity var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2__width {
		max-width: var(--nav-width-default);
		transition: max-width var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__width {
		max-width: var(--nav-width-expanded);
	}

	.card-nav-v2[data-scrolled='true'][data-open='false'] .card-nav-v2__width {
		max-width: var(--nav-width-compact);
	}

	.card-nav-v2:not([data-scroll-synced='true']) .card-nav-v2__width {
		transition: none;
	}

	.card-nav-v2__backdrop {
		background-color: color-mix(in srgb, #000 24%, transparent);
		backdrop-filter: blur(2px);
		transition: opacity var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2__backdrop[data-open='true'] {
		opacity: 1;
		pointer-events: auto;
	}

	.card-nav-v2__panel-clip {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__panel-clip {
		grid-template-rows: 1fr;
	}

	.card-nav-v2__panel {
		overflow: hidden;
		min-height: 0;
		opacity: 0;
		transition: opacity var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__panel {
		opacity: 1;
	}

	.card-nav-v2__card {
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity var(--nav-duration) var(--nav-ease),
			transform var(--nav-duration) var(--nav-ease);
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__card {
		opacity: 1;
		transform: translateY(0);
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__card:nth-child(2) {
		transition-delay: 0.05s;
	}

	.card-nav-v2[data-open='true'] .card-nav-v2__card:nth-child(3) {
		transition-delay: 0.1s;
	}

	.card-nav-v2__link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding-block: 0.125rem;
		font-size: 0.9375rem;
		line-height: 1.35;
		text-decoration: none;
		color: color-mix(in srgb, currentColor 82%, transparent);
		transition:
			color 0.25s ease,
			gap 0.25s ease,
			transform 0.25s ease;
	}

	@media (min-width: 768px) {
		.card-nav-v2__link {
			font-size: 1rem;
		}
	}

	.card-nav-v2__link:hover,
	.card-nav-v2__link:focus-visible {
		color: currentColor;
		gap: 0.5rem;
	}

	.card-nav-v2__link-icon {
		transform-origin: center;
		transition: transform 0.25s ease;
	}

	.card-nav-v2__link:hover .card-nav-v2__link-icon,
	.card-nav-v2__link:focus-visible .card-nav-v2__link-icon {
		transform: rotate(45deg) translateX(1px);
	}

	.card-nav-v2__link-text {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.card-nav-v2__link-badge {
		flex-shrink: 0;
		border-radius: 0.25rem;
		background: color-mix(in srgb, currentColor 20%, transparent);
		padding: 0.18rem 0.35rem;
		font-size: 0.6rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: 0.08em;
		color: currentColor;
	}

	:global(body.card-nav-v2-open) {
		overflow: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		.card-nav-v2__width,
		.card-nav-v2__panel-clip,
		.card-nav-v2__panel,
		.card-nav-v2__card,
		.card-nav-v2__backdrop,
		.card-nav-v2__link,
		.card-nav-v2__link-icon,
		.card-nav-v2__menu {
			transition: none;
		}

		.card-nav-v2[data-open='true'] .card-nav-v2__card {
			transform: none;
		}

		.card-nav-v2__link:hover .card-nav-v2__link-icon,
		.card-nav-v2__link:focus-visible .card-nav-v2__link-icon {
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.card-nav-v2__brand {
			left: auto;
			right: calc(0.75rem + 1rem);
			transform: translate3d(0, -50%, 0);
		}

		.card-nav-v2__width,
		.card-nav-v2[data-open='true'] .card-nav-v2__width,
		.card-nav-v2[data-scrolled='true'][data-open='false'] .card-nav-v2__width {
			max-width: 100%;
			transition: none;
		}
	}
</style>
