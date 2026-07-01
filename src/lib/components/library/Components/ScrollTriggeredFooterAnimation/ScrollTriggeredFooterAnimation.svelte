<!-- @svelte-bits
{
  "title": "Scroll-Triggered Footer Animation",
  "description": "Footer reveal on scroll with SplitText headings, ASCII canvas hands, and parallax hover.",
  "dependencies": ["gsap", "lenis"]
}
-->
<script module lang="ts">
	export type FooterLink = {
		label: string;
		href: string;
	};

	export type AsciiHandConfig = {
		asciiChars?: string;
		fontSize?: number;
		cellSize?: number;
		asciiColumns?: number;
		dpr?: number;
		charColor?: string;
		hoverColor?: string;
		hoverCharColor?: string;
		hoverRadius?: number;
		clusterSize?: number;
		highlightLifetime?: number;
		/** Max rendered width in px. Defaults to min(42vw, 420px). */
		maxDisplayWidth?: number;
		/** 'auto' detects light hand on dark bg vs dark hand on light bg. */
		maskMode?: 'auto' | 'dark' | 'light';
	};
</script>

<script lang="ts">
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { SplitText as GSAPSplitText } from 'gsap/SplitText';
	import Lenis from 'lenis';

	type AsciiCell = {
		col: number;
		row: number;
		char: string;
		highlightEndTime: number;
	};

	type AsciiHand = {
		rows: number;
		canvas: HTMLCanvasElement;
		cellList: AsciiCell[];
		cells: Map<string, AsciiCell>;
		render: () => void;
		hover: (clientX: number, clientY: number) => void;
		destroy: () => void;
	};

	const defaultAsciiConfig: Required<AsciiHandConfig> = {
		asciiChars: ' .:-=+*#%@369',
		fontSize: 18,
		cellSize: 20,
		asciiColumns: 80,
		dpr: 2,
		charColor: '#803500',
		hoverColor: '#ff6a00',
		hoverCharColor: '#0f0f0f',
		hoverRadius: 8,
		clusterSize: 10,
		highlightLifetime: 300,
		maxDisplayWidth: 0,
		maskMode: 'light'
	};

	const shouldSkipPixel = (
		brightness: number,
		charIndex: number,
		backgroundCharIndex: number,
		maskLight: boolean
	) => {
		if (maskLight) {
			// Light hand on dark bg: drop only near-black background pixels.
			return brightness < 0.06;
		}
		// Dark hand on light bg (tutorial): drop highlights / empty areas.
		return brightness > 0.94 || charIndex <= backgroundCharIndex;
	};

	const pixelBrightness = (pixels: Uint8ClampedArray, offset: number) =>
		(pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114) / 255;

	const resolveFooterMetrics = (wrapper: HTMLElement, footer: Element | null) => {
		const footerEl = footer as HTMLElement | null;
		let footerWidth = footerEl?.clientWidth ?? 0;
		let footerHeight = footerEl?.clientHeight ?? 0;

		if (footerWidth < 40 || footerHeight < 40) {
			const scroller = wrapper.closest('.stfa-scroller') as HTMLElement | null;
			footerWidth = Math.max(footerWidth, scroller?.clientWidth ?? 0, window.innerWidth);
			footerHeight = Math.max(
				footerHeight,
				scroller?.clientHeight ?? 0,
				Math.min(window.innerHeight, 900)
			);
		}

		return { footerWidth, footerHeight };
	};

	const getMaxHandWidth = (wrapper: HTMLElement, footer: Element | null) => {
		const measured = wrapper.clientWidth;
		if (measured > 40) return measured;

		const { footerWidth } = resolveFooterMetrics(wrapper, footer);
		const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
		return footerWidth * (isMobile ? 0.48 : 0.5);
	};

	const resolveAsciiColumns = (maxDisplayWidth: number, userColumns?: number) => {
		if (userColumns !== undefined) return userColumns;
		return Math.min(80, Math.max(44, Math.round(maxDisplayWidth / 10)));
	};

	const detectLightSubjectMask = (pixels: Uint8ClampedArray, asciiColumns: number, rows: number) => {
		const offsets = [
			0,
			4 * (asciiColumns - 1),
			4 * asciiColumns * (rows - 1),
			4 * (asciiColumns * (rows - 1) + asciiColumns - 1)
		];
		const avg = offsets.reduce((sum, offset) => sum + pixelBrightness(pixels, offset), 0) / offsets.length;
		return avg < 0.25;
	};

	const sampleImagePixels = (image: HTMLImageElement, gridRows: number, asciiColumns: number) => {
		const canvas = document.createElement('canvas');
		canvas.width = asciiColumns;
		canvas.height = gridRows;
		const ctx = canvas.getContext('2d');
		if (!ctx) return new Uint8ClampedArray(0);
		ctx.drawImage(image, 0, 0, asciiColumns, gridRows);
		return ctx.getImageData(0, 0, asciiColumns, gridRows).data;
	};

	const pixelToCharIndex = (pixels: Uint8ClampedArray, offset: number, asciiChars: string) => {
		const brightness = pixelBrightness(pixels, offset);
		return Math.min(asciiChars.length - 1, Math.floor((1 - brightness) * asciiChars.length));
	};

	const buildCells = (
		image: HTMLImageElement,
		asciiChars: string,
		asciiColumns: number,
		backgroundCharIndex: number,
		maskMode: AsciiHandConfig['maskMode']
	) => {
		const rows = Math.round(asciiColumns / (image.naturalWidth / image.naturalHeight));
		const pixels = sampleImagePixels(image, rows, asciiColumns);
		const cells = new Map<string, AsciiCell>();
		const maskLight =
			maskMode === 'light' || (maskMode === 'auto' && detectLightSubjectMask(pixels, asciiColumns, rows));

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < asciiColumns; col++) {
				const offset = 4 * (col + asciiColumns * row);
				const brightness = pixelBrightness(pixels, offset);
				const charIndex = pixelToCharIndex(pixels, offset, asciiChars);
				if (shouldSkipPixel(brightness, charIndex, backgroundCharIndex, maskLight)) continue;

				cells.set(`${col},${row}`, {
					col,
					row,
					char: asciiChars[charIndex] ?? '.',
					highlightEndTime: 0
				});
			}
		}

		return { rows, cells };
	};

	const highlightCluster = (
		cells: Map<string, AsciiCell>,
		startCell: AsciiCell,
		clusterSize: number,
		highlightLifetime: number
	) => {
		const steps = Math.floor(Math.random() * clusterSize) + 1;
		let current = startCell;

		for (let step = 0; step < steps; step++) {
			current.highlightEndTime = performance.now() + highlightLifetime;
			const neighbors = [
				cells.get(`${current.col + 1},${current.row}`),
				cells.get(`${current.col - 1},${current.row}`),
				cells.get(`${current.col},${current.row + 1}`),
				cells.get(`${current.col},${current.row - 1}`)
			].filter(Boolean) as AsciiCell[];
			if (!neighbors.length) break;
			current = neighbors[Math.floor(Math.random() * neighbors.length)];
		}
	};

	const createAsciiHand = (
		image: HTMLImageElement,
		wrapper: HTMLElement,
		userConfig: AsciiHandConfig = {}
	): AsciiHand => {
		const config = { ...defaultAsciiConfig, ...userConfig };
		const footer = wrapper.closest('.stfa-footer');
		const maxDisplayWidth = config.maxDisplayWidth || getMaxHandWidth(wrapper, footer);
		const asciiColumns = resolveAsciiColumns(maxDisplayWidth, userConfig.asciiColumns);
		const backgroundCharIndex = config.asciiChars.lastIndexOf('.');

		const canvas = document.createElement('canvas');
		canvas.className = 'ascii-hand-canvas';
		wrapper.appendChild(canvas);

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return {
				rows: 0,
				canvas,
				cellList: [],
				cells: new Map(),
				render: () => {},
				hover: () => {},
				destroy: () => canvas.remove()
			};
		}

		const { rows, cells } = buildCells(
			image,
			config.asciiChars,
			asciiColumns,
			backgroundCharIndex,
			config.maskMode
		);
		const cellList = [...cells.values()];
		let rafId = 0;

		const canvasWidth = asciiColumns * config.cellSize;
		const canvasHeight = rows * config.cellSize;
		const { footerHeight } = resolveFooterMetrics(wrapper, footer);
		const maxDisplayHeight = Math.max(280, Math.min(720, footerHeight * 0.62));
		const displayScale = Math.min(1, maxDisplayWidth / canvasWidth, maxDisplayHeight / canvasHeight);
		const displayWidth = Math.max(1, canvasWidth * displayScale);
		const displayHeight = Math.max(1, canvasHeight * displayScale);

		canvas.width = canvasWidth * config.dpr;
		canvas.height = canvasHeight * config.dpr;
		canvas.style.width = `${displayWidth}px`;
		canvas.style.height = `${displayHeight}px`;
		canvas.style.maxWidth = '100%';

		ctx.setTransform(config.dpr, 0, 0, config.dpr, 0, 0);
		ctx.font = `${config.fontSize}px monospace`;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';

		const metrics = ctx.measureText('X');
		const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		const baselineOffset = glyphHeight / 2 - metrics.actualBoundingBoxDescent;

		const render = () => {
			const now = performance.now();
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);

			for (const cell of cellList) {
				const x = cell.col * config.cellSize + config.cellSize / 2;
				const y = cell.row * config.cellSize + config.cellSize / 2;
				const isHighlighted = cell.highlightEndTime > now;

				if (isHighlighted) {
					ctx.fillStyle = config.hoverColor;
					ctx.fillRect(cell.col * config.cellSize, cell.row * config.cellSize, config.cellSize, config.cellSize);
				}

				ctx.fillStyle = isHighlighted ? config.hoverCharColor : config.charColor;
				ctx.fillText(cell.char, x, y + baselineOffset);
			}

			rafId = requestAnimationFrame(render);
		};

		const hover = (clientX: number, clientY: number) => {
			const rect = canvas.getBoundingClientRect();
			const mouseCol = ((clientX - rect.left) / rect.width) * asciiColumns;
			const mouseRow = ((clientY - rect.top) / rect.height) * rows;

			let closest: AsciiCell | null = null;
			let closestDist = Infinity;

			for (const cell of cellList) {
				const dx = cell.col - mouseCol;
				const dy = cell.row - mouseRow;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < closestDist) {
					closestDist = dist;
					closest = cell;
				}
			}

			if (closest && closestDist <= config.hoverRadius) {
				highlightCluster(cells, closest, config.clusterSize, config.highlightLifetime);
			}
		};

		const destroy = () => {
			cancelAnimationFrame(rafId);
			canvas.remove();
		};

		render();

		return {
			rows,
			canvas,
			cellList,
			cells,
			render,
			hover,
			destroy
		};
	};

	gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

	type Props = {
		links?: FooterLink[];
		description?: string;
		leftTitle?: string;
		rightTitle?: string;
		leftHandSrc?: string;
		rightHandSrc?: string;
		backgroundColor?: string;
		textColor?: string;
		useWindowScroll?: boolean;
		enableLenis?: boolean;
		spacerHeight?: string;
		parallaxStrength?: number;
		parallaxEase?: number;
		asciiConfig?: AsciiHandConfig;
		class?: string;
	};

	let {
		links = [
			{ label: 'Work', href: '#' },
			{ label: 'About', href: '#about' },
			{ label: 'Journal', href: '#journal' },
			{ label: 'Contact', href: '#contact' }
		],
		description = 'A multidisciplinary studio working across direction, design and motion. We build considered digital experiences for brands that care about the details.',
		leftTitle = 'Blank',
		rightTitle = 'Canvas',
		leftHandSrc = '/assets/footer-hands/left-hand.png',
		rightHandSrc = '/assets/footer-hands/right-hand.png',
		backgroundColor = '#0f0f0f',
		textColor = '#ffffff',
		useWindowScroll = false,
		enableLenis = true,
		spacerHeight = '120vh',
		parallaxStrength = 20,
		parallaxEase = 0.05,
		asciiConfig = {},
		class: className = ''
	}: Props = $props();

	let scrollerEl = $state<HTMLDivElement | undefined>();
	let innerEl = $state<HTMLDivElement | undefined>();
	let footerEl = $state<HTMLElement | undefined>();
	let revealerEl = $state<HTMLDivElement | undefined>();
	let leftHandWrapper = $state<HTMLDivElement | undefined>();
	let rightHandWrapper = $state<HTMLDivElement | undefined>();
	let leftHandImg = $state<HTMLImageElement | undefined>();
	let rightHandImg = $state<HTMLImageElement | undefined>();

	$effect(() => {
		void links;
		void description;
		void leftTitle;
		void rightTitle;
		void leftHandSrc;
		void rightHandSrc;
		void useWindowScroll;
		void enableLenis;
		void parallaxStrength;
		void parallaxEase;
		void asciiConfig;

		const footer = footerEl;
		const revealer = revealerEl;
		const leftWrapper = leftHandWrapper;
		const rightWrapper = rightHandWrapper;
		const leftImg = leftHandImg;
		const rightImg = rightHandImg;
		const scroller = useWindowScroll ? undefined : scrollerEl;
		const inner = useWindowScroll ? undefined : innerEl;

		if (!footer || !revealer || !leftWrapper || !rightWrapper || !leftImg || !rightImg) return;
		if (!useWindowScroll && (!scroller || !inner)) return;

		let lenis: Lenis | null = null;
		let parallaxRaf = 0;
		let handMountRaf = 0;
		let active = true;
		const asciiHands: AsciiHand[] = [];
		const splits: GSAPSplitText[] = [];
		const triggers: ScrollTrigger[] = [];

		const reveal = { left: -125, right: 125 };
		const pointer = { x: 0, y: 0 };
		const drift = { x: 0, y: 0 };
		const parallaxScale = 1 + parallaxStrength / 100;
		const handWrappers = [leftWrapper, rightWrapper];

		const charStagger = { each: 0.04, from: 'center' as const };

		const splitHeadingChars = () => {
			const headings = footer.querySelectorAll<HTMLElement>('.stfa-heading');
			const chars: Element[] = [];

			headings.forEach((heading) => {
				const split = GSAPSplitText.create(heading, {
					type: 'chars',
					charsClass: 'stfa-char'
				});
				splits.push(split);
				if (split.chars?.length) chars.push(...split.chars);
			});

			gsap.set(chars, { position: 'relative', yPercent: 125 });
			return chars;
		};

		const splitContentLines = () => {
			const targets = footer.querySelectorAll<HTMLElement>('.stfa-line-source');
			const lines: Element[] = [];

			targets.forEach((target) => {
				const split = GSAPSplitText.create(target, {
					type: 'lines',
					mask: 'lines',
					linesClass: 'stfa-line'
				});
				splits.push(split);
				if (split.lines?.length) lines.push(...split.lines);
			});

			gsap.set(lines, { yPercent: 100 });
			return lines;
		};

		const headingChars = splitHeadingChars();
		const contentLines = splitContentLines();

		const animateIn = () => {
			gsap.to(reveal, {
				left: 0,
				right: 0,
				duration: 1,
				ease: 'power3.out',
				overwrite: true
			});

			gsap.to(headingChars, {
				yPercent: 0,
				duration: 1,
				ease: 'power3.out',
				stagger: charStagger,
				overwrite: true
			});

			gsap.to(contentLines, {
				yPercent: 0,
				duration: 1,
				ease: 'power3.out',
				stagger: 0.08,
				overwrite: true
			});
		};

		const animateOut = () => {
			gsap.to(reveal, {
				left: -125,
				right: 125,
				duration: 0.4,
				ease: 'power2.in',
				overwrite: true
			});

			gsap.to(headingChars, {
				yPercent: 125,
				duration: 0.4,
				ease: 'power2.in',
				stagger: { each: 0.01, from: 'center' },
				overwrite: true
			});

			gsap.to(contentLines, {
				yPercent: 100,
				duration: 0.4,
				ease: 'power2.in',
				stagger: 0.02,
				overwrite: true
			});
		};

		const setupHand = (image: HTMLImageElement, wrapper: HTMLDivElement) => {
			wrapper.querySelector('.ascii-hand-canvas')?.remove();

			const mount = () => {
				if (!active) return;
				const hand = createAsciiHand(image, wrapper, asciiConfig);
				asciiHands.push(hand);
				image.style.display = 'none';
				ScrollTrigger.refresh();
				checkReveal();
			};

			handMountRaf = requestAnimationFrame(() => {
				handMountRaf = requestAnimationFrame(mount);
			});
		};

		const initHands = () => {
			if (leftImg.complete) setupHand(leftImg, leftWrapper);
			else leftImg.addEventListener('load', () => setupHand(leftImg, leftWrapper), { once: true });

			if (rightImg.complete) setupHand(rightImg, rightWrapper);
			else rightImg.addEventListener('load', () => setupHand(rightImg, rightWrapper), { once: true });
		};

		initHands();

		const setPointerTarget = (clientX: number, clientY: number) => {
			const rect = footer.getBoundingClientRect();
			pointer.x = ((clientX - (rect.left + rect.width / 2)) / rect.width) * parallaxStrength;
			pointer.y = ((clientY - (rect.top + rect.height / 2)) / rect.height) * parallaxStrength;
		};

		const renderParallax = () => {
			drift.x += (pointer.x - drift.x) * parallaxEase;
			drift.y += (pointer.y - drift.y) * parallaxEase;

			handWrappers.forEach((wrapper, index) => {
				const direction = index === 0 ? -1 : 1;
				const revealX = index === 0 ? reveal.left : reveal.right;
				const x = drift.x * direction;
				const y = drift.y;
				wrapper.style.transform = `translate3d(calc(${x}px + ${revealX}%), ${y}px, 0) scale(${parallaxScale})`;
			});

			parallaxRaf = requestAnimationFrame(renderParallax);
		};

		renderParallax();

		const onPointerMove = (event: PointerEvent) => {
			setPointerTarget(event.clientX, event.clientY);
			asciiHands.forEach((hand) => hand.hover(event.clientX, event.clientY));
		};

		const scrollRoot = useWindowScroll ? window : scroller!;
		scrollRoot.addEventListener('pointermove', onPointerMove as EventListener);

		let ticker: ((time: number) => void) | null = null;

		if (enableLenis) {
			ticker = (time: number) => {
				lenis?.raf(time * 1000);
			};

			if (useWindowScroll) {
				lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
			} else if (scroller && inner) {
				lenis = new Lenis({
					wrapper: scroller,
					content: inner,
					lerp: 0.08,
					smoothWheel: true,
					gestureOrientation: 'vertical'
				});
			}

			if (lenis) {
				lenis.on('scroll', ScrollTrigger.update);
				gsap.ticker.add(ticker);
				gsap.ticker.lagSmoothing(0);
			}
		}

		const scrollerTarget = useWindowScroll ? undefined : scroller;

		triggers.push(
			ScrollTrigger.create({
				trigger: revealer,
				scroller: scrollerTarget,
				start: 'top 55%',
				onEnter: animateIn,
				onEnterBack: animateIn
			})
		);

		triggers.push(
			ScrollTrigger.create({
				trigger: revealer,
				scroller: scrollerTarget,
				start: 'top 85%',
				onLeaveBack: animateOut
			})
		);

		ScrollTrigger.refresh();

		const checkReveal = () => {
			const rootRect = scroller
				? scroller.getBoundingClientRect()
				: { top: 0, height: window.innerHeight };
			const triggerRect = revealer.getBoundingClientRect();
			const relativeTop = triggerRect.top - rootRect.top;
			if (relativeTop <= rootRect.height * 0.55) {
				animateIn();
			}
		};

		checkReveal();

		return () => {
			active = false;
			cancelAnimationFrame(handMountRaf);
			cancelAnimationFrame(parallaxRaf);
			scrollRoot.removeEventListener('pointermove', onPointerMove as EventListener);
			triggers.forEach((trigger) => trigger.kill());
			splits.forEach((split) => split.revert());
			asciiHands.forEach((hand) => hand.destroy());
			if (ticker) gsap.ticker.remove(ticker);
			lenis?.destroy();
			gsap.killTweensOf([reveal, headingChars, contentLines]);
		};
	});
</script>

{#if useWindowScroll}
	<footer
		bind:this={footerEl}
		class="stfa-footer {className}"
		style:background-color={backgroundColor}
		style:color={textColor}
	>
		<div bind:this={revealerEl} class="stfa-revealer" aria-hidden="true"></div>
		<div class="stfa-inner">
			<div class="stfa-top">
				<nav class="stfa-links stfa-line-source" aria-label="Footer">
					{#each links as link (link.href + link.label)}
						<a href={link.href}>{link.label}</a>
					{/each}
				</nav>

				<div class="stfa-copy stfa-line-source">
					<p>{description}</p>
				</div>
			</div>

			<div class="stfa-hands" aria-hidden="true">
				<div bind:this={leftHandWrapper} class="stfa-hand stfa-hand--left">
					<img bind:this={leftHandImg} class="stfa-hand-source" src={leftHandSrc} alt="" draggable="false" />
				</div>
				<div bind:this={rightHandWrapper} class="stfa-hand stfa-hand--right">
					<img bind:this={rightHandImg} class="stfa-hand-source" src={rightHandSrc} alt="" draggable="false" />
				</div>
			</div>

			<div class="stfa-header">
				<h1 class="stfa-heading">{leftTitle}</h1>
				<h1 class="stfa-heading">{rightTitle}</h1>
			</div>
		</div>
	</footer>
{:else}
	<div
		bind:this={scrollerEl}
		class="stfa-scroller {className}"
		style:--stfa-spacer-height={spacerHeight}
	>
		<div bind:this={innerEl} class="stfa-scroll-inner">
			<div class="stfa-spacer">
				<p class="stfa-spacer-label">Scroll down</p>
			</div>

			<footer bind:this={footerEl} class="stfa-footer" style:background-color={backgroundColor} style:color={textColor}>
				<div bind:this={revealerEl} class="stfa-revealer" aria-hidden="true"></div>
				<div class="stfa-inner">
					<div class="stfa-top">
						<nav class="stfa-links stfa-line-source" aria-label="Footer">
							{#each links as link (link.href + link.label)}
								<a href={link.href}>{link.label}</a>
							{/each}
						</nav>

						<div class="stfa-copy stfa-line-source">
							<p>{description}</p>
						</div>
					</div>

					<div class="stfa-hands" aria-hidden="true">
						<div bind:this={leftHandWrapper} class="stfa-hand stfa-hand--left">
							<img bind:this={leftHandImg} class="stfa-hand-source" src={leftHandSrc} alt="" draggable="false" />
						</div>
						<div bind:this={rightHandWrapper} class="stfa-hand stfa-hand--right">
							<img bind:this={rightHandImg} class="stfa-hand-source" src={rightHandSrc} alt="" draggable="false" />
						</div>
					</div>

					<div class="stfa-header">
						<h1 class="stfa-heading">{leftTitle}</h1>
						<h1 class="stfa-heading">{rightTitle}</h1>
					</div>
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	.stfa-scroller {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 560px;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
		border-radius: inherit;
	}

	.stfa-scroll-inner {
		min-height: 100%;
	}

	.stfa-spacer {
		display: grid;
		place-items: center;
		min-height: var(--stfa-spacer-height, 120vh);
	}

	.stfa-spacer-label {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 800;
		opacity: 0.45;
		letter-spacing: -0.03em;
		user-select: none;
	}

	.stfa-footer {
		position: relative;
		min-height: 100svh;
		overflow: hidden;
	}

	.stfa-scroller .stfa-inner {
		min-height: 100svh;
	}

	.stfa-revealer {
		position: absolute;
		top: 35%;
		left: 0;
		width: 100%;
		height: 1px;
		pointer-events: none;
	}

	.stfa-inner {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		padding: clamp(2rem, 5vw, 4rem);
	}

	.stfa-top {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: clamp(1.5rem, 4vw, 3rem);
		width: 100%;
	}

	.stfa-links {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex-shrink: 0;
	}

	.stfa-links :global(a) {
		color: inherit;
		text-decoration: none;
		font-size: clamp(0.95rem, 2vw, 1.05rem);
		line-height: 1.35;
		width: fit-content;
		opacity: 0.92;
	}

	.stfa-copy {
		max-width: min(26rem, 42vw);
		margin-left: auto;
	}

	.stfa-copy :global(p) {
		margin: 0;
		font-size: clamp(0.95rem, 2.2vw, 1.05rem);
		line-height: 1.55;
		opacity: 0.78;
	}

	.stfa-line-source :global(.stfa-line) {
		overflow: hidden;
	}

	.stfa-hands {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
		pointer-events: none;
		z-index: 1;
	}

	.stfa-hand {
		position: relative;
		width: 50%;
		height: 100%;
		display: flex;
		align-items: center;
		will-change: transform;
	}

	.stfa-hand--left {
		justify-content: flex-start;
	}

	.stfa-hand--right {
		justify-content: flex-end;
	}

	.stfa-hand :global(.ascii-hand-canvas) {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: min(62vh, 720px);
	}

	.stfa-hand-source {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: min(62vh, 720px);
	}

	.stfa-header {
		margin-top: auto;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		z-index: 2;
	}

	.stfa-heading {
		margin: 0;
		font-size: clamp(3rem, 14vw, 9rem);
		line-height: 0.9;
		font-weight: 800;
		letter-spacing: -0.05em;
		text-transform: none;
	}

	@media (max-width: 768px) {
		.stfa-top {
			flex-direction: column;
			gap: 1.5rem;
		}

		.stfa-copy {
			margin-left: 0;
			max-width: 100%;
		}

		.stfa-hand {
			width: 48%;
		}

		.stfa-hand :global(.ascii-hand-canvas),
		.stfa-hand-source {
			max-height: min(50vh, 360px);
		}

		.stfa-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.stfa-heading {
			font-size: clamp(2.4rem, 18vw, 4.5rem);
		}
	}
</style>
