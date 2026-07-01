<!-- @svelte-bits
{
  "title": "Cinematic 3D Slider",
  "description": "Infinite image slider with cinematic 3D arc layout, scroll inertia, and animated title.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type CinematicSlide = {
		src: string;
		title: string;
		alt?: string;
	};

	export type CinematicLink = {
		label: string;
		href: string;
	};

	export const DEFAULT_CINEMATIC_SLIDES: CinematicSlide[] = [
		{ src: 'https://i.pinimg.com/736x/a6/97/60/a697604c16e3d86b83b1cf3b06da1a42.jpg', title: 'Golden Hour' },
		{ src: 'https://i.pinimg.com/1200x/c9/70/79/c9707949e969fd0c80bb6d3c6eae2ae7.jpg', title: 'Coastal Light' },
		{ src: 'https://i.pinimg.com/736x/37/08/0d/37080d668d6ad4d0bb9744ad94dde367.jpg', title: 'Quiet Forest' },
		{ src: 'https://i.pinimg.com/736x/f8/ca/6f/f8ca6ffeaecac40769434edea7e1b001.jpg', title: 'Urban Frame' },
		{ src: 'https://i.pinimg.com/736x/82/92/d7/8292d7783cec70bd9e0671f9230eb1c0.jpg', title: 'Soft Horizon' },
		{ src: 'https://i.pinimg.com/736x/e5/e8/a4/e5e8a4a1fe63f77cfc1660e89d482ac6.jpg', title: 'Deep Blue' },
		{ src: 'https://i.pinimg.com/736x/bc/73/74/bc73742ca134df729c3379959b779bf2.jpg', title: 'Wild Bloom' },
		{ src: 'https://i.pinimg.com/736x/a0/73/95/a073957fda9305ee674635ba5f7c1109.jpg', title: 'Mountain Air' },
		{ src: 'https://i.pinimg.com/1200x/46/29/2f/46292f80966a3ea24157da98c19dcb93.jpg', title: 'Desert Glow' },
		{ src: 'https://i.pinimg.com/736x/38/53/11/385311c967ac8aafc161e6ed078ff2b3.jpg', title: 'Night Drive' },
		{ src: 'https://i.pinimg.com/736x/41/28/e3/4128e3db448a312a6f33a693e66b4561.jpg', title: 'Studio Mood' },
		{ src: 'https://i.pinimg.com/736x/a1/d6/d6/a1d6d63bc6a514385755ce14a64a4e79.jpg', title: 'Final Frame' }
	];
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		slides?: CinematicSlide[];
		brandText?: string;
		links?: CinematicLink[];
		class?: string;
		backgroundColor?: string;
		showInfoBar?: boolean;
		slideWidth?: number;
		slideHeight?: number;
		slideGap?: number;
		arcDepth?: number;
		centerLift?: number;
		scrollLerp?: number;
		wheelMultiplier?: number;
	};

	let {
		slides = DEFAULT_CINEMATIC_SLIDES,
		brandText = 'Svelte Bits™',
		links = [
			{ label: 'Works', href: '#' },
			{ label: 'About', href: '#about' },
			{ label: 'Contact', href: '#contact' }
		],
		class: className = '',
		backgroundColor = '#fafafa',
		showInfoBar = true,
		slideWidth = 320,
		slideHeight = 420,
		slideGap = 100,
		arcDepth = 200,
		centerLift = 100,
		scrollLerp = 0.05,
		wheelMultiplier = 0.5
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | undefined>();
	let infoBarEl = $state<HTMLDivElement | undefined>();
	let titleEl = $state<HTMLSpanElement | undefined>();
	let activeSlideTitle = $state('');
	let skipTitleAnimation = true;

	$effect(() => {
		void slides;
		void showInfoBar;
		void slideWidth;
		void slideHeight;
		void slideGap;
		void arcDepth;
		void centerLift;
		void scrollLerp;
		void wheelMultiplier;

		const container = rootEl;
		if (!container) return;

		let cancelled = false;
		let teardown: (() => void) | undefined;
		let retryId = 0;

		const start = async () => {
			await tick();
			if (cancelled) return;

			const slideElements = [...container.querySelectorAll<HTMLDivElement>('.cinematic-slide')];
			if (slideElements.length !== slides.length) {
				retryId = requestAnimationFrame(() => {
					void start();
				});
				return;
			}

			const slideCount = slides.length;
			const trackWidth = slideCount * slideGap;

			let containerWidth = container.clientWidth;
			let containerHeight = container.clientHeight;
			let centerX = containerWidth / 2;
			let baselineY = containerHeight * 0.4;

			let scrollTarget = 0;
			let scrollCurrent = 0;
			let activeSlideIndex = -1;
			let rafId = 0;
			let isAnimating = true;
			let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
			let touchStartY = 0;

			const computeSlideTransform = (slideIndex: number, scrollOffset: number) => {
				let wrapperOffsetX =
					(((slideIndex * slideGap - scrollOffset) % trackWidth) + trackWidth) % trackWidth;
				if (wrapperOffsetX > trackWidth / 2) wrapperOffsetX -= trackWidth;

				const slideCenterX = centerX + wrapperOffsetX;
				const normalizedDist = (slideCenterX - centerX) / (containerWidth * 0.5);
				const absDist = Math.min(Math.abs(normalizedDist), 1.3);

				const scaleFactor = Math.max(1 - absDist * 0.8, 0.25);
				const scaledWidth = slideWidth * scaleFactor;
				const scaledHeight = slideHeight * scaleFactor;

				const clampedDist = Math.min(absDist, 1);
				const arcDropY = (1 - Math.cos(clampedDist * Math.PI)) * 0.5 * arcDepth;
				const centerLiftY = Math.max(1 - absDist * 2, 0) * centerLift;

				return {
					x: slideCenterX - scaledWidth / 2,
					y: baselineY - scaledHeight / 2 + arcDropY - centerLiftY,
					width: scaledWidth,
					height: scaledHeight,
					zIndex: Math.round((1 - absDist) * 100),
					distanceFromCenter: Math.abs(wrapperOffsetX)
				};
			};

			const layoutSlides = (scrollOffset: number) => {
				slideElements.forEach((slideEl, i) => {
					const { x, y, width, height, zIndex } = computeSlideTransform(i, scrollOffset);
					gsap.set(slideEl, { x, y, width, height, zIndex, force3D: true });
				});
			};

			const syncActiveTitle = (scrollOffset: number) => {
				if (!showInfoBar) return;

				let closestIndex = 0;
				let closestDist = Infinity;

				slideElements.forEach((_, i) => {
					const { distanceFromCenter } = computeSlideTransform(i, scrollOffset);
					if (distanceFromCenter < closestDist) {
						closestDist = distanceFromCenter;
						closestIndex = i;
					}
				});

				if (closestIndex === activeSlideIndex) return;

				activeSlideIndex = closestIndex;
				activeSlideTitle = slides[closestIndex]?.title ?? '';
			};

			const updateMetrics = () => {
				containerWidth = container.clientWidth;
				containerHeight = container.clientHeight;
				centerX = containerWidth / 2;
				baselineY = containerHeight * 0.4;
			};

			const onResize = () => {
				updateMetrics();
				layoutSlides(scrollCurrent);
				syncActiveTitle(scrollCurrent);
			};

			const animate = () => {
				if (isAnimating) {
					scrollCurrent += (scrollTarget - scrollCurrent) * scrollLerp;
					layoutSlides(scrollCurrent);
					syncActiveTitle(scrollCurrent);
				}
				rafId = requestAnimationFrame(animate);
			};

			const onWheel = (event: WheelEvent) => {
				event.preventDefault();
				event.stopPropagation();
				scrollTarget += event.deltaY * wheelMultiplier;
			};

			const onTouchStart = (event: TouchEvent) => {
				touchStartY = event.touches[0].clientY;
			};

			const onTouchMove = (event: TouchEvent) => {
				event.preventDefault();
				const touchY = event.touches[0].clientY;
				const deltaY = touchStartY - touchY;
				touchStartY = touchY;
				scrollTarget += deltaY * wheelMultiplier;
			};

			const onVisibilityChange = () => {
				isAnimating = !document.hidden;
				if (isAnimating) {
					layoutSlides(scrollCurrent);
					syncActiveTitle(scrollCurrent);
				}
			};

			updateMetrics();
			layoutSlides(0);
			syncActiveTitle(0);
			rafId = requestAnimationFrame(animate);

			container.addEventListener('wheel', onWheel, { passive: false });
			container.addEventListener('touchstart', onTouchStart, { passive: true });
			container.addEventListener('touchmove', onTouchMove, { passive: false });
			document.addEventListener('visibilitychange', onVisibilityChange);

			const resizeObserver = new ResizeObserver(() => {
				if (resizeTimeout) clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(onResize, 100);
			});
			resizeObserver.observe(container);

			teardown = () => {
				cancelAnimationFrame(rafId);
				if (resizeTimeout) clearTimeout(resizeTimeout);
				resizeObserver.disconnect();
				container.removeEventListener('wheel', onWheel);
				container.removeEventListener('touchstart', onTouchStart);
				container.removeEventListener('touchmove', onTouchMove);
				document.removeEventListener('visibilitychange', onVisibilityChange);
			};
		};

		void start();

		return () => {
			cancelled = true;
			cancelAnimationFrame(retryId);
			teardown?.();
		};
	});

	$effect(() => {
		void activeSlideTitle;
		const el = titleEl;
		const bar = infoBarEl;
		if (!showInfoBar || !el) return;

		if (skipTitleAnimation) {
			skipTitleAnimation = false;
			gsap.set(el, { rotationX: 0, y: 0, opacity: 1 });
			return;
		}

		gsap.fromTo(
			el,
			{ rotationX: -90, y: 20, opacity: 0 },
			{ rotationX: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }
		);

		if (bar) {
			requestAnimationFrame(() => {
				bar.style.width = '';
			});
		}
	});
</script>

<div
	class="cinematic-slider-root relative h-full w-full overflow-hidden {className}"
	bind:this={rootEl}
	style:background-color={backgroundColor}
>
	{#each slides as slide (slide.src + slide.title)}
		<div class="cinematic-slide absolute left-0 top-0 overflow-hidden will-change-[transform,width,height]">
			<img
				src={slide.src}
				alt={slide.alt ?? slide.title}
				class="block h-full w-full object-cover"
				loading="lazy"
				draggable="false"
			/>
		</div>
	{/each}

	{#if showInfoBar}
		<div
			class="info-bar pointer-events-none absolute bottom-[16%] left-1/2 z-10 inline-flex -translate-x-1/2 select-none items-center gap-8 whitespace-nowrap rounded-full px-8 py-2.5 text-[1.1rem] font-normal tracking-wide  mix-blend-difference transition-[width] duration-200 will-change-[width]"
			bind:this={infoBarEl}
			style="transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);"
		>
			<span>{brandText}</span>
			<span
				bind:this={titleEl}
				class="slide-title inline-block origin-bottom font-normal"
			>{activeSlideTitle}</span>
			{#if links.length}
				<div class="links pointer-events-auto flex gap-6">
					{#each links as link (link.href + link.label)}
						<a href={link.href} class="text-[#2a2a2a] no-underline transition-colors hover:text-black">
							{link.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@media (max-width: 768px) {
		.info-bar {
			gap: 0.5rem;
			padding: 0.35rem 0.85rem;
			bottom: 22%;
			font-size: clamp(0.68rem, 2.8vw, 0.9rem);
			max-width: calc(100% - 1.25rem);
			white-space: normal;
			flex-wrap: wrap;
			justify-content: center;
			text-align: center;
		}

		.slide-title {
			max-width: 12ch;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.links {
			display: none;
		}
	}
</style>
