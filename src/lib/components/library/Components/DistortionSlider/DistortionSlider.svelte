<!-- @svelte-bits
{
  "title": "Distortion Slider",
  "description": "Three.js image slider with vertex distortion, momentum scroll, and drag interaction.",
  "dependencies": ["three"]
}
-->
<script module lang="ts">
	import * as THREE from 'three';
	import { resolveWebGLImageUrl } from '$lib/utils/imageProxy';

	export type DistortionSlide = {
		name: string;
		img: string;
	};

	export type DistortionSliderOrientation = 'vertical' | 'horizontal';

	export type DistortionSliderConfig = {
		minHeight: number;
		maxHeight: number;
		aspectRatio: number;
		gap: number;
		smoothing: number;
		distortionStrength: number;
		distortionSmoothing: number;
		momentumFriction: number;
		momentumThreshold: number;
		wheelSpeed: number;
		wheelMax: number;
		dragSpeed: number;
		dragMomentum: number;
		touchSpeed: number;
		touchMomentum: number;
	};

	type SlideMeshUserData = {
		originalVertices: Float32Array;
		offset: number;
		name: string;
		index: number;
	};

	type DistortionMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> & {
		userData: SlideMeshUserData;
	};

	export const DEFAULT_DISTORTION_CONFIG: DistortionSliderConfig = {
		minHeight: 1,
		maxHeight: 1.5,
		aspectRatio: 1.5,
		gap: 0.05,
		smoothing: 0.05,
		distortionStrength: 2.5,
		distortionSmoothing: 0.1,
		momentumFriction: 0.95,
		momentumThreshold: 0.001,
		wheelSpeed: 0.01,
		wheelMax: 150,
		dragSpeed: 0.01,
		dragMomentum: 0.01,
		touchSpeed: 0.01,
		touchMomentum: 0.1
	};

	export const DEFAULT_DISTORTION_SLIDES: DistortionSlide[] = [
		{ name: 'Golden Hour', img: 'https://i.pinimg.com/736x/a6/97/60/a697604c16e3d86b83b1cf3b06da1a42.jpg' },
		{ name: 'Coastal Light', img: 'https://i.pinimg.com/1200x/c9/70/79/c9707949e969fd0c80bb6d3c6eae2ae7.jpg' },
		{ name: 'Quiet Forest', img: 'https://i.pinimg.com/736x/37/08/0d/37080d668d6ad4d0bb9744ad94dde367.jpg' },
		{ name: 'Urban Frame', img: 'https://i.pinimg.com/736x/f8/ca/6f/f8ca6ffeaecac40769434edea7e1b001.jpg' },
		{ name: 'Soft Horizon', img: 'https://i.pinimg.com/736x/82/92/d7/8292d7783cec70bd9e0671f9230eb1c0.jpg' },
		{ name: 'Deep Blue', img: 'https://i.pinimg.com/736x/e5/e8/a4/e5e8a4a1fe63f77cfc1660e89d482ac6.jpg' },
		{ name: 'Wild Bloom', img: 'https://i.pinimg.com/736x/bc/73/74/bc73742ca134df729c3379959b779bf2.jpg' },
		{ name: 'Mountain Air', img: 'https://i.pinimg.com/736x/a0/73/95/a073957fda9305ee674635ba5f7c1109.jpg' },
		{ name: 'Desert Glow', img: 'https://i.pinimg.com/1200x/46/29/2f/46292f80966a3ea24157da98c19dcb93.jpg' },
		{ name: 'Night Drive', img: 'https://i.pinimg.com/736x/38/53/11/385311c967ac8aafc161e6ed078ff2b3.jpg' },
		{ name: 'Studio Mood', img: 'https://i.pinimg.com/736x/41/28/e3/4128e3db448a312a6f33a693e66b4561.jpg' },
		{ name: 'Final Frame', img: 'https://i.pinimg.com/736x/a1/d6/d6/a1d6d63bc6a514385755ce14a64a4e79.jpg' }
	];

	const wrap = (value: number, range: number) => ((value % range) + range) % range;

	const applyDistortion = (
		mesh: DistortionMesh,
		position: number,
		strength: number,
		orientation: DistortionSliderOrientation
	) => {
		const positions = mesh.geometry.attributes.position;
		const original = mesh.userData.originalVertices;
		const horizontal = orientation === 'horizontal';

		for (let i = 0; i < positions.count; i++) {
			const x = original[i * 3];
			const y = original[i * 3 + 1];
			const distance = horizontal
				? Math.sqrt((position + x) ** 2 + y * y)
				: Math.sqrt(x * x + (position + y) ** 2);
			const falloff = Math.max(0, 1 - distance / 2);
			const bend = Math.pow(Math.sin((falloff * Math.PI) / 2), 1.5);
			positions.setZ(i, bend * strength);
		}

		positions.needsUpdate = true;
		mesh.geometry.computeVertexNormals();
	};

	const createDistortionSlider = (
		canvas: HTMLCanvasElement,
		container: HTMLElement,
		slides: DistortionSlide[],
		config: DistortionSliderConfig,
		backgroundColor: number | null,
		orientation: DistortionSliderOrientation,
		onActiveSlideChange: (index: number, name: string) => void
	) => {
		const horizontal = orientation === 'horizontal';

		const getSize = () => ({
			width: Math.max(container.clientWidth, 1),
			height: Math.max(container.clientHeight, 1)
		});

		let { width, height } = getSize();

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		if (backgroundColor === null) {
			renderer.setClearColor(0x000000, 0);
		} else {
			renderer.setClearColor(backgroundColor, 1);
		}

		const scene = new THREE.Scene();
		if (backgroundColor !== null) {
			scene.background = new THREE.Color(backgroundColor);
		}

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
		camera.position.z = 5;

		const totalSlides = slides.length;
		const slideSizes = Array.from(
			{ length: totalSlides },
			() => config.minHeight + Math.random() * (config.maxHeight - config.minHeight)
		);

		const slideOffsets: number[] = [];
		let stackPosition = 0;

		for (let i = 0; i < totalSlides; i++) {
			if (i === 0) {
				slideOffsets.push(0);
				stackPosition = slideSizes[0] / 2;
			} else {
				stackPosition += config.gap + slideSizes[i] / 2;
				slideOffsets.push(stackPosition);
				stackPosition += slideSizes[i] / 2;
			}
		}

		const loopLength = stackPosition + config.gap + slideSizes[0] / 2;
		const halfLoop = loopLength / 2;
		const maxSlideSize = config.maxHeight;

		const meshes: DistortionMesh[] = [];
		const textureLoader = new THREE.TextureLoader();

		for (let i = 0; i < totalSlides; i++) {
			const primary = slideSizes[i];
			const planeWidth = horizontal ? primary : primary * config.aspectRatio;
			const planeHeight = horizontal ? primary / config.aspectRatio : primary;
			const segmentsX = horizontal ? 16 : 32;
			const segmentsY = horizontal ? 32 : 16;

			const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
			const material = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				color: 0x999999
			});

			const mesh = new THREE.Mesh(geometry, material) as DistortionMesh;
			mesh.userData = {
				originalVertices: Float32Array.from(geometry.attributes.position.array as Float32Array),
				offset: slideOffsets[i],
				name: slides[i].name,
				index: i
			};

			textureLoader.load(resolveWebGLImageUrl(slides[i].img), (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;

				material.map = texture;
				material.color.set(0xffffff);
				material.needsUpdate = true;

				const imageAspect = texture.image.width / texture.image.height;
				const planeAspect = planeWidth / planeHeight;
				const ratio = imageAspect / planeAspect;

				if (ratio > 1) {
					mesh.scale.y = 1 / ratio;
				} else {
					mesh.scale.x = ratio;
				}
			});

			scene.add(mesh);
			meshes.push(mesh);
		}

		let scrollPosition = 0;
		let scrollTarget = 0;
		let scrollMomentum = 0;
		let isScrolling = false;
		let lastFrameTime = 0;

		let distortionAmount = 0;
		let distortionTarget = 0;
		let velocityPeak = 0;
		let scrollDirection = 0;
		let directionTarget = 0;
		const velocityHistory = [0, 0, 0, 0, 0];

		let isDragging = false;
		let dragStart = 0;
		let dragDelta = 0;
		let touchStart = 0;
		let touchLast = 0;

		let activeSlideIndex = -1;
		let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
		let raf = 0;

		const getWheelDelta = (e: WheelEvent) => {
			if (!horizontal) return e.deltaY;
			return Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
		};

		const getPointer = (e: MouseEvent | Touch) => (horizontal ? e.clientX : e.clientY);

		const addDistortionBurst = (amount: number) => {
			distortionTarget = Math.min(1, distortionTarget + amount);
		};

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const rawDelta = getWheelDelta(e);
			const clampedDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), config.wheelMax);

			addDistortionBurst(Math.abs(clampedDelta) * 0.001);
			scrollTarget += clampedDelta * config.wheelSpeed;
			isScrolling = true;

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				isScrolling = false;
			}, 150);
		};

		const onTouchStart = (e: TouchEvent) => {
			touchStart = touchLast = getPointer(e.touches[0]);
			isScrolling = false;
			scrollMomentum = 0;
		};

		const onTouchMove = (e: TouchEvent) => {
			e.preventDefault();

			const pointer = getPointer(e.touches[0]);
			const delta = pointer - touchLast;
			touchLast = pointer;

			addDistortionBurst(Math.abs(delta) * 0.02);
			scrollTarget -= delta * config.touchSpeed;
			isScrolling = true;
		};

		const onTouchEnd = () => {
			const swipeVelocity = (touchLast - touchStart) * 0.005;

			if (Math.abs(swipeVelocity) > 0.5) {
				scrollMomentum = -swipeVelocity * config.touchMomentum;
				addDistortionBurst(Math.abs(swipeVelocity) * 0.45);
				isScrolling = true;
				setTimeout(() => {
					isScrolling = false;
				}, 800);
			}
		};

		const onMouseDown = (e: MouseEvent) => {
			isDragging = true;
			dragStart = getPointer(e);
			dragDelta = 0;
			scrollMomentum = 0;
			canvas.style.cursor = 'grabbing';
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const pointer = getPointer(e);
			const delta = pointer - dragStart;
			dragStart = pointer;
			dragDelta = delta;

			addDistortionBurst(Math.abs(delta) * 0.02);
			scrollTarget -= delta * config.dragSpeed;
			isScrolling = true;
		};

		const onMouseUp = () => {
			if (!isDragging) return;

			isDragging = false;
			canvas.style.cursor = 'grab';

			if (Math.abs(dragDelta) > 2) {
				scrollMomentum = -dragDelta * config.dragMomentum;
				addDistortionBurst(Math.abs(dragDelta) * 0.005);
				isScrolling = true;
				setTimeout(() => {
					isScrolling = false;
				}, 800);
			}
		};

		const onResize = () => {
			({ width, height } = getSize());
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		canvas.style.cursor = 'grab';

		container.addEventListener('wheel', onWheel, { passive: false });
		container.addEventListener('touchstart', onTouchStart, { passive: false });
		container.addEventListener('touchmove', onTouchMove, { passive: false });
		container.addEventListener('touchend', onTouchEnd);
		canvas.addEventListener('mousedown', onMouseDown);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(container);

		const animate = (time: number) => {
			raf = requestAnimationFrame(animate);

			const deltaTime = lastFrameTime ? (time - lastFrameTime) / 1000 : 0.016;
			lastFrameTime = time;

			const previousScroll = scrollPosition;

			if (isScrolling) {
				scrollTarget += scrollMomentum;
				scrollMomentum *= config.momentumFriction;
				if (Math.abs(scrollMomentum) < config.momentumThreshold) scrollMomentum = 0;
			}

			scrollPosition += (scrollTarget - scrollPosition) * config.smoothing;

			const frameDelta = scrollPosition - previousScroll;

			if (Math.abs(frameDelta) > 0.00001) {
				directionTarget = frameDelta > 0 ? 1 : -1;
			}

			scrollDirection += (directionTarget - scrollDirection) * 0.08;

			const velocity = Math.abs(frameDelta) / deltaTime;
			velocityHistory.push(velocity);
			velocityHistory.shift();
			const averageVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;

			if (averageVelocity > velocityPeak) velocityPeak = averageVelocity;

			const isDecelerating = averageVelocity / (velocityPeak + 0.001) < 0.7 && velocityPeak > 0.5;
			velocityPeak *= 0.99;

			if (velocity > 0.05) {
				distortionTarget = Math.max(distortionTarget, Math.min(1, velocity * 0.1));
			}

			if (isDecelerating || averageVelocity < 0.2) {
				distortionTarget *= isDecelerating ? 0.95 : 0.855;
			}

			distortionAmount += (distortionTarget - distortionAmount) * config.distortionSmoothing;

			const signedDistortion = distortionAmount * scrollDirection;

			let closestDistance = Infinity;
			let closestIndex = 0;

			meshes.forEach((mesh) => {
				const { offset } = mesh.userData;

				let axis = -(offset - wrap(scrollPosition, loopLength));
				axis = wrap(axis + halfLoop, loopLength) - halfLoop;

				if (horizontal) {
					mesh.position.x = axis;
					mesh.position.y = 0;
				} else {
					mesh.position.x = 0;
					mesh.position.y = axis;
				}

				if (Math.abs(axis) < closestDistance) {
					closestDistance = Math.abs(axis);
					closestIndex = mesh.userData.index;
				}

				if (Math.abs(axis) < halfLoop + maxSlideSize) {
					applyDistortion(mesh, axis, config.distortionStrength * signedDistortion, orientation);
				}
			});

			if (closestIndex !== activeSlideIndex) {
				activeSlideIndex = closestIndex;
				onActiveSlideChange(activeSlideIndex, slides[activeSlideIndex].name);
			}

			renderer.render(scene, camera);
		};

		raf = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(scrollTimeout);

			container.removeEventListener('wheel', onWheel);
			container.removeEventListener('touchstart', onTouchStart);
			container.removeEventListener('touchmove', onTouchMove);
			container.removeEventListener('touchend', onTouchEnd);
			canvas.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			resizeObserver.disconnect();

			meshes.forEach((mesh) => {
				mesh.geometry.dispose();
				mesh.material.map?.dispose();
				mesh.material.dispose();
				scene.remove(mesh);
			});

			renderer.dispose();
		};
	};
</script>

<script lang="ts">
	type Props = {
		slides?: DistortionSlide[];
		config?: Partial<DistortionSliderConfig>;
		backgroundColor?: string | null;
		orientation?: DistortionSliderOrientation;
		showInfo?: boolean;
		class?: string;
	};

	let {
		slides = DEFAULT_DISTORTION_SLIDES,
		config: configOverrides = {},
		backgroundColor = null,
		orientation = 'vertical',
		showInfo = true,
		class: className = ''
	}: Props = $props();

	let rootEl = $state<HTMLElement | undefined>();
	let canvasEl = $state<HTMLCanvasElement | undefined>();
	let activeTitle = $state('');
	let activeIndex = $state(0);

	const zeroPad = (n: number) => String(n).padStart(2, '0');

	const sliderConfig = $derived({ ...DEFAULT_DISTORTION_CONFIG, ...configOverrides });
	const sceneBackground = $derived(
		backgroundColor ? Number.parseInt(backgroundColor.replace('#', ''), 16) : null
	);

	$effect(() => {
		void slides;
		void orientation;
		void backgroundColor;
		void showInfo;
		const config = sliderConfig;

		const container = rootEl;
		const canvas = canvasEl;
		if (!container || !canvas) return;

		return createDistortionSlider(
			canvas,
			container,
			slides,
			config,
			sceneBackground,
			orientation,
			(index, name) => {
				activeIndex = index;
				activeTitle = name;
			}
		);
	});
</script>

<section
	class="relative h-full w-full overflow-hidden {className}"
	bind:this={rootEl}
	data-orientation={orientation}
>
	{#if showInfo}
		<div
			class="distortion-info pointer-events-none absolute z-[2] flex text-white mix-blend-difference
				{orientation === 'vertical'
				? 'top-1/2 left-0 w-full -translate-y-1/2 justify-between px-8'
				: 'top-0 left-1/2 h-full -translate-x-1/2 flex-col items-center justify-between py-8'}"
		>
			<p class="text-center text-[clamp(1rem,4vw,2.5rem)] font-medium tracking-tight">{activeTitle}</p>
			<p class="text-[clamp(1rem,4vw,2.5rem)] font-medium opacity-85">{zeroPad(activeIndex + 1)}</p>
		</div>
	{/if}

	<canvas bind:this={canvasEl} class="absolute inset-0 z-[1] h-full w-full touch-none"></canvas>
</section>

<style>
	@media (max-width: 768px) {
		.distortion-info {
			padding-inline: 1rem;
		}
	}
</style>
