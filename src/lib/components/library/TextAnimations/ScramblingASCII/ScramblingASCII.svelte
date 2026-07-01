<!-- @svelte-bits
{
  "title": "Scrambling ASCII",
  "description": "Interactive ASCII grid logo with character scrambling and mouse-repulsion physics.",
  "dependencies": []
}
-->
<script lang="ts">
	type Cell = {
		col: number;
		row: number;
		char: string;
		isLit: boolean;
		offsetX: number;
		offsetY: number;
		velX: number;
		velY: number;
	};

	type Props = {
		src: string;
		logoWidth?: string;
		class?: string;
		backgroundColor?: string;
		gridColor?: string;
		charColor?: string;
		asciiChars?: string;
		threshold?: number;
		pushRadius?: number;
		pushForce?: number;
		spring?: number;
		damping?: number;
		scrambleInterval?: number;
	};

	let {
		src,
		logoWidth = '75%',
		class: className = '',
		backgroundColor = '#0f0f0f',
		gridColor = '#171717',
		charColor = '#dadada',
		asciiChars = '.:+*#%@0369',
		threshold = 0.5,
		pushRadius = 5,
		pushForce = 30,
		spring = 0.025,
		damping = 0.5,
		scrambleInterval = 50
	}: Props = $props();

	let rootEl: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;
	let logoImg: HTMLImageElement;

	$effect(() => {
		void src;
		void logoWidth;
		void backgroundColor;
		void gridColor;
		void charColor;
		void asciiChars;
		void threshold;
		void pushRadius;
		void pushForce;
		void spring;
		void damping;
		void scrambleInterval;

		if (!rootEl || !canvasEl || !logoImg) return;

		const ctx = canvasEl.getContext('2d', { alpha: true });
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		let cellSize = 8;
		let cellGap = 2;
		let cellStep = cellSize + cellGap;
		let cols = 0;
		let rows = 0;
		let cells: Cell[] = [];
		let rafId = 0;
		let scrambleTimer: ReturnType<typeof setInterval> | undefined;
		let idleTimer: ReturnType<typeof setTimeout> | undefined;

		const mouse = { col: -999, row: -999, isMoving: false };

		const pickChar = (brightness: number) =>
			asciiChars[Math.min(asciiChars.length - 1, Math.floor(brightness * asciiChars.length))] ?? ' ';

		const randomChar = () => asciiChars[Math.floor(Math.random() * asciiChars.length)] ?? '.';

		const setupCanvas = () => {
			const width = rootEl.clientWidth;
			const height = rootEl.clientHeight;

			cellSize = width < 768 ? 3 : 8;
			cellGap = width < 768 ? 1 : 2;
			cellStep = cellSize + cellGap;
			cols = Math.floor(width / cellStep);
			rows = Math.floor(height / cellStep);

			canvasEl.width = Math.max(1, Math.floor(width * dpr));
			canvasEl.height = Math.max(1, Math.floor(height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const sampleLogoIntoCells = () => {
			const containerRect = rootEl.getBoundingClientRect();
			const imgRect = logoImg.getBoundingClientRect();

			const logoCols = Math.max(1, Math.ceil(imgRect.width / cellStep));
			const logoRows = Math.max(1, Math.ceil(imgRect.height / cellStep));
			const startCol = Math.floor((imgRect.left - containerRect.left) / cellStep);
			const startRow = Math.floor((imgRect.top - containerRect.top) / cellStep);

			const sampleCanvas = document.createElement('canvas');
			sampleCanvas.width = logoCols;
			sampleCanvas.height = logoRows;
			const sampleCtx = sampleCanvas.getContext('2d');
			if (!sampleCtx) return;

			sampleCtx.fillStyle = '#000';
			sampleCtx.fillRect(0, 0, logoCols, logoRows);
			sampleCtx.drawImage(logoImg, 0, 0, logoCols, logoRows);
			const { data } = sampleCtx.getImageData(0, 0, logoCols, logoRows);

			cells = [];
			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols; col++) {
					const inLogo =
						col >= startCol &&
						col < startCol + logoCols &&
						row >= startRow &&
						row < startRow + logoRows;

					let isLit = false;
					let char = ' ';

					if (inLogo) {
						const localCol = col - startCol;
						const localRow = row - startRow;
						const idx = (localRow * logoCols + localCol) * 4;
						const brightness =
							(data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
						isLit = brightness > threshold;
						char = isLit ? pickChar(brightness) : ' ';
					}

					cells.push({
						col,
						row,
						char,
						isLit,
						offsetX: 0,
						offsetY: 0,
						velX: 0,
						velY: 0
					});
				}
			}
		};

		const renderFrame = () => {
			const width = rootEl.clientWidth;
			const height = rootEl.clientHeight;

			ctx.font = `${cellSize + 2}px monospace`;
			ctx.textBaseline = 'top';
			ctx.textAlign = 'center';
			ctx.clearRect(0, 0, width, height);

			ctx.fillStyle = gridColor;
			for (const { col, row } of cells) {
				ctx.fillRect(col * cellStep, row * cellStep, cellSize, cellSize);
			}

			ctx.fillStyle = charColor;
			for (const { col, row, char, isLit, offsetX, offsetY } of cells) {
				if (!isLit) continue;
				const x = (col + offsetX) * cellStep + cellSize / 2;
				const y = (row + offsetY) * cellStep;
				ctx.fillText(char, x, y);
			}
		};

		const updatePhysics = () => {
			for (const cell of cells) {
				if (!cell.isLit) continue;

				if (mouse.isMoving) {
					const dx = cell.col - mouse.col + cell.offsetX;
					const dy = cell.row - mouse.row + cell.offsetY;
					const dist = Math.hypot(dx, dy);

					if (dist < pushRadius && dist > 0.01) {
						const force = (1 - dist / pushRadius) ** 2 * pushForce;
						cell.velX += (dx / dist) * force;
						cell.velY += (dy / dist) * force;
					}
				}

				cell.velX += -cell.offsetX * spring;
				cell.velY += -cell.offsetY * spring;
				cell.velX *= damping;
				cell.velY *= damping;
				cell.offsetX += cell.velX;
				cell.offsetY += cell.velY;

				if (Math.abs(cell.offsetX) < 0.01 && Math.abs(cell.velX) < 0.01) {
					cell.offsetX = 0;
					cell.velX = 0;
				}
				if (Math.abs(cell.offsetY) < 0.01 && Math.abs(cell.velY) < 0.01) {
					cell.offsetY = 0;
					cell.velY = 0;
				}
			}
		};

		const animate = () => {
			updatePhysics();
			renderFrame();
			rafId = requestAnimationFrame(animate);
		};

		const init = () => {
			setupCanvas();
			sampleLogoIntoCells();
			renderFrame();
		};

		const onResize = () => init();

		const onMouseMove = (event: MouseEvent) => {
			const rect = canvasEl.getBoundingClientRect();
			mouse.col = (event.clientX - rect.left) / cellStep;
			mouse.row = (event.clientY - rect.top) / cellStep;
			mouse.isMoving = true;
			if (idleTimer) clearTimeout(idleTimer);
			idleTimer = setTimeout(() => {
				mouse.isMoving = false;
			}, 50);
		};

		const onMouseLeave = () => {
			mouse.isMoving = false;
			mouse.col = -999;
			mouse.row = -999;
			if (idleTimer) clearTimeout(idleTimer);
		};

		const onLogoLoad = () => init();

		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(rootEl);

		window.addEventListener('resize', onResize);
		canvasEl.addEventListener('mousemove', onMouseMove);
		canvasEl.addEventListener('mouseleave', onMouseLeave);
		logoImg.addEventListener('load', onLogoLoad);

		if (logoImg.complete && logoImg.naturalWidth > 0) init();

		scrambleTimer = setInterval(() => {
			for (const cell of cells) {
				if (cell.isLit) cell.char = randomChar();
			}
			renderFrame();
		}, scrambleInterval);

		rafId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(rafId);
			if (scrambleTimer) clearInterval(scrambleTimer);
			if (idleTimer) clearTimeout(idleTimer);
			resizeObserver.disconnect();
			window.removeEventListener('resize', onResize);
			canvasEl.removeEventListener('mousemove', onMouseMove);
			canvasEl.removeEventListener('mouseleave', onMouseLeave);
			logoImg.removeEventListener('load', onLogoLoad);
		};
	});
</script>

<div
	class="relative h-full w-full overflow-hidden {className}"
	bind:this={rootEl}
	style:background-color={backgroundColor}
>
	<canvas class="block h-full w-full" bind:this={canvasEl} aria-hidden="true"></canvas>

	<div
		class="pointer-events-none invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
		style:width={logoWidth}
	>
		<img bind:this={logoImg} {src} alt="" class="block h-full w-full object-contain" />
	</div>
</div>
