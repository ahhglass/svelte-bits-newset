<!-- @svelte-bits
{
  "title": "Digital Hover Image",
  "description": "Grid of monospace symbols that scramble and reveal on cursor hover over an image.",
  "dependencies": []
}
-->
<script lang="ts">
	type GridBlock = {
		element: HTMLDivElement;
		x: number;
		y: number;
		gridX: number;
		gridY: number;
		highlightEndTime: number;
		isEmpty: boolean;
		shouldScramble: boolean;
		scrambleInterval: ReturnType<typeof setInterval> | null;
		symbol: string;
	};

	type Props = {
		src: string;
		alt?: string;
		width?: string;
		height?: string;
		symbols?: string[];
		blockSize?: number;
		detectionRadius?: number;
		clusterSize?: number;
		blockLifetime?: number;
		emptyRatio?: number;
		scrambleRatio?: number;
		scrambleInterval?: number;
		blockBackground?: string;
		blockColor?: string;
		blockFontSize?: string;
		class?: string;
	};

	let {
		src,
		alt = '',
		width = '100%',
		height = 'auto',
		symbols = ['0', 'X', '*', '>', '$', 'W'],
		blockSize = 25,
		detectionRadius = 50,
		clusterSize = 7,
		blockLifetime = 300,
		emptyRatio = 0.3,
		scrambleRatio = 0.25,
		scrambleInterval = 150,
		blockBackground = '#1a1a1a',
		blockColor = '#e3e3db',
		blockFontSize = '20px',
		class: className = ''
	}: Props = $props();

	let rootEl = $state<HTMLDivElement | undefined>();
	let overlayEl = $state<HTMLDivElement | undefined>();

	const cssVars = $derived(
		`--dhi-block-bg:${blockBackground};--dhi-block-color:${blockColor};--dhi-block-size:${blockSize}px;--dhi-font-size:${blockFontSize};`
	);

	$effect(() => {
		void src;
		void width;
		void height;
		void symbols;
		void blockSize;
		void detectionRadius;
		void clusterSize;
		void blockLifetime;
		void emptyRatio;
		void scrambleRatio;
		void scrambleInterval;
		void blockBackground;
		void blockColor;
		void blockFontSize;

		const root = rootEl;
		const overlay = overlayEl;
		if (!root || !overlay) return;

		let active = true;
		let blocks: GridBlock[] = [];
		let rafId = 0;

		const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)] ?? '*';

		const clearBlock = (block: GridBlock) => {
			block.element.classList.remove('dhi-block--active');
			block.highlightEndTime = 0;

			if (block.scrambleInterval) {
				clearInterval(block.scrambleInterval);
				block.scrambleInterval = null;
			}

			if (!block.isEmpty) {
				block.symbol = getRandomSymbol();
				block.element.textContent = block.symbol;
			}
		};

		const activateBlock = (block: GridBlock, currentTime: number, delay = 0) => {
			block.element.classList.add('dhi-block--active');
			block.highlightEndTime = currentTime + blockLifetime + delay;

			if (block.shouldScramble && !block.scrambleInterval) {
				block.scrambleInterval = setInterval(() => {
					block.element.textContent = getRandomSymbol();
				}, scrambleInterval);
			}
		};

		const buildGrid = () => {
			overlay.replaceChildren();
			blocks = [];

			const widthPx = root.offsetWidth;
			const heightPx = root.offsetHeight;
			if (widthPx <= 0 || heightPx <= 0) return;

			const cols = Math.ceil(widthPx / blockSize);
			const rows = Math.ceil(heightPx / blockSize);

			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const element = document.createElement('div');
					element.className = 'dhi-block';

					const isEmpty = Math.random() < emptyRatio;
					const symbol = isEmpty ? '' : getRandomSymbol();

					element.textContent = symbol;
					element.style.width = `${blockSize}px`;
					element.style.height = `${blockSize}px`;
					element.style.left = `${col * blockSize}px`;
					element.style.top = `${row * blockSize}px`;

					overlay.appendChild(element);

					blocks.push({
						element,
						x: col * blockSize + blockSize / 2,
						y: row * blockSize + blockSize / 2,
						gridX: col,
						gridY: row,
						highlightEndTime: 0,
						isEmpty,
						shouldScramble: !isEmpty && Math.random() < scrambleRatio,
						scrambleInterval: null,
						symbol
					});
				}
			}
		};

		const handleMouseMove = (event: MouseEvent) => {
			const rect = root.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			let closestBlock: GridBlock | null = null;
			let closestDistance = Infinity;

			for (const block of blocks) {
				const dx = mouseX - block.x;
				const dy = mouseY - block.y;
				const distance = Math.hypot(dx, dy);

				if (distance < closestDistance) {
					closestDistance = distance;
					closestBlock = block;
				}
			}

			if (!closestBlock || closestDistance > detectionRadius) return;

			const currentTime = Date.now();
			activateBlock(closestBlock, currentTime);

			const clusterCount = Math.floor(Math.random() * clusterSize) + 1;
			let currentBlock = closestBlock;
			const activeBlocks: GridBlock[] = [closestBlock];

			for (let i = 0; i < clusterCount; i++) {
				const neighbors = blocks.filter((neighbor) => {
					if (activeBlocks.includes(neighbor)) return false;

					const dx = Math.abs(neighbor.gridX - currentBlock!.gridX);
					const dy = Math.abs(neighbor.gridY - currentBlock!.gridY);

					return dx <= 1 && dy <= 1;
				});

				if (neighbors.length === 0) break;

				const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]!;
				activateBlock(randomNeighbor, currentTime, i * 10);
				activeBlocks.push(randomNeighbor);
				currentBlock = randomNeighbor;
			}
		};

		const updateHighlights = () => {
			if (!active) return;

			const currentTime = Date.now();

			for (const block of blocks) {
				if (block.highlightEndTime > 0 && currentTime > block.highlightEndTime) {
					clearBlock(block);
				}
			}

			rafId = requestAnimationFrame(updateHighlights);
		};

		const handleResize = () => {
			buildGrid();
		};

		const resizeObserver = new ResizeObserver(handleResize);

		buildGrid();
		resizeObserver.observe(root);
		root.addEventListener('mousemove', handleMouseMove);
		rafId = requestAnimationFrame(updateHighlights);

		return () => {
			active = false;
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			root.removeEventListener('mousemove', handleMouseMove);

			for (const block of blocks) {
				if (block.scrambleInterval) clearInterval(block.scrambleInterval);
			}

			blocks = [];
			overlay.replaceChildren();
		};
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap"
	/>
</svelte:head>

<div
	class="dhi-root {className}"
	class:dhi-root--fixed={height !== 'auto'}
	bind:this={rootEl}
	style="{cssVars}width:{width};{height === 'auto' ? '' : `height:${height};`}"
>
	<img class="dhi-img" {src} {alt} draggable="false" />
	<div class="dhi-grid" bind:this={overlayEl} aria-hidden="true"></div>
</div>

<style>
	.dhi-root {
		position: relative;
		overflow: hidden;
		max-width: 100%;
	}

	.dhi-root:not(.dhi-root--fixed) {
		aspect-ratio: 7 / 5;
	}

	.dhi-img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		user-select: none;
		pointer-events: none;
	}

	.dhi-grid {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
	}

	.dhi-grid :global(.dhi-block) {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--dhi-block-bg);
		color: var(--dhi-block-color);
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: var(--dhi-font-size);
		font-weight: 400;
		line-height: 1;
		opacity: 0;
		will-change: opacity;
	}

	.dhi-grid :global(.dhi-block--active) {
		opacity: 1;
	}
</style>
