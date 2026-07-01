<!-- @svelte-bits
{
  "title": "Pixelated Video Hover",
  "description": "Video with pixelated grid deformation and chromatic aberration on cursor movement.",
  "dependencies": ["three"]
}
-->
<script lang="ts">
	import * as THREE from 'three';

	type Props = {
		videoSrc: string;
		gridSize?: number;
		mouseRadius?: number;
		strength?: number;
		relaxation?: number;
		displacement?: number;
		aberration?: number;
		autoplay?: boolean;
		muted?: boolean;
		loop?: boolean;
		class?: string;
	};

	let {
		videoSrc,
		gridSize = 20,
		mouseRadius = 0.25,
		strength = 0.1,
		relaxation = 0.925,
		displacement = 0.015,
		aberration = 0.15,
		autoplay = true,
		muted = true,
		loop = true,
		class: className = ''
	}: Props = $props();

	let rootEl = $state<HTMLElement | undefined>();
	let videoEl = $state<HTMLVideoElement | undefined>();

	const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const fragmentShader = `
		uniform sampler2D uTexture;
		uniform sampler2D uDataTexture;
		uniform float uDisplacement;
		uniform float uAberration;
		varying vec2 vUv;

		void main() {
			vec4 offset = texture2D(uDataTexture, vUv);
			vec2 shift = uDisplacement * offset.rg;
			vec2 split = shift * uAberration;

			float r = texture2D(uTexture, vUv - shift + split).r;
			float g = texture2D(uTexture, vUv - shift).g;
			float b = texture2D(uTexture, vUv - shift - split).b;

			gl_FragColor = vec4(r, g, b, 1.0);
		}
	`;

	$effect(() => {
		void videoSrc;
		void gridSize;
		void mouseRadius;
		void strength;
		void relaxation;
		void displacement;
		void aberration;

		const container = rootEl;
		const video = videoEl;
		if (!container || !video) return;

		let width = container.offsetWidth;
		let height = container.offsetHeight;
		if (width === 0 || height === 0) return;

		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
		camera.position.z = 1;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.domElement.className = 'pixelated-video-hover__canvas';
		renderer.domElement.style.touchAction = 'none';
		// eslint-disable-next-line svelte/no-dom-manipulating
		container.appendChild(renderer.domElement);

		video.src = videoSrc;
		video.muted = muted;
		video.loop = loop;
		video.autoplay = autoplay;
		video.playsInline = true;
		video.style.opacity = '0';

		const videoTexture = new THREE.VideoTexture(video);
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.generateMipmaps = false;

		let gridX = gridSize;
		let gridY = gridSize;

		const createDataTexture = () => {
			const aspect = width / height;
			if (aspect >= 1) {
				gridX = Math.round(gridSize * aspect);
				gridY = gridSize;
			} else {
				gridX = gridSize;
				gridY = Math.round(gridSize / aspect);
			}

			const data = new Float32Array(gridX * gridY * 4);
			const texture = new THREE.DataTexture(data, gridX, gridY, THREE.RGBAFormat, THREE.FloatType);
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.needsUpdate = true;
			return texture;
		};

		let dataTexture = createDataTexture();

		const getCoverScale = () => {
			const videoAspect = (video.videoWidth || 16) / (video.videoHeight || 9);
			const containerAspect = width / height;
			let scaleX = 1;
			let scaleY = 1;

			if (containerAspect > videoAspect) {
				scaleX = containerAspect / videoAspect;
			} else {
				scaleY = videoAspect / containerAspect;
			}

			return [2 * scaleX, 2 * scaleY] as const;
		};

		const material = new THREE.ShaderMaterial({
			uniforms: {
				uTexture: { value: videoTexture },
				uDataTexture: { value: dataTexture },
				uDisplacement: { value: displacement },
				uAberration: { value: aberration }
			},
			vertexShader,
			fragmentShader
		});

		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...getCoverScale()), material);
		scene.add(mesh);

		const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };

		const updateDataTexture = () => {
			const data = dataTexture.image.data as Float32Array;

			for (let i = 0; i < data.length; i += 4) {
				data[i] *= relaxation;
				data[i + 1] *= relaxation;
			}

			const gridMouseX = gridX * mouse.x;
			const gridMouseY = gridY * mouse.y;
			const maxDist = gridSize * mouseRadius;

			for (let i = 0; i < gridX; i++) {
				for (let j = 0; j < gridY; j++) {
					const distanceSq = (gridMouseX - i) ** 2 + (gridMouseY - j) ** 2;
					if (distanceSq >= maxDist * maxDist) continue;

					const index = 4 * (i + gridX * j);
					const power = Math.min(10, maxDist / Math.sqrt(distanceSq));
					data[index] += strength * 100 * mouse.vX * power;
					data[index + 1] -= strength * 100 * mouse.vY * power;
				}
			}

			mouse.vX *= 0.9;
			mouse.vY *= 0.9;
			dataTexture.needsUpdate = true;
		};

		const onPointerMove = (event: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			// WebGL UV/data-texture Y=0 is at the bottom; screen Y=0 is at the top.
			const y = 1 - (event.clientY - rect.top) / rect.height;

			mouse.vX = x - mouse.prevX;
			mouse.vY = y - mouse.prevY;
			mouse.prevX = mouse.x;
			mouse.prevY = mouse.y;
			mouse.x = x;
			mouse.y = y;
		};

		const refreshGeometry = () => {
			mesh.geometry.dispose();
			mesh.geometry = new THREE.PlaneGeometry(...getCoverScale());
		};

		const onResize = () => {
			width = container.offsetWidth;
			height = container.offsetHeight;
			if (width === 0 || height === 0) return;

			refreshGeometry();
			dataTexture.dispose();
			dataTexture = createDataTexture();
			material.uniforms.uDataTexture.value = dataTexture;
			renderer.setSize(width, height);
		};

		const onVideoReady = () => {
			refreshGeometry();
		};

		const resizeObserver = new ResizeObserver(onResize);

		renderer.domElement.addEventListener('pointermove', onPointerMove);
		video.addEventListener('loadeddata', onVideoReady);
		resizeObserver.observe(container);

		renderer.setAnimationLoop(() => {
			if (video.readyState >= video.HAVE_CURRENT_DATA) {
				videoTexture.needsUpdate = true;
			}

			material.uniforms.uDisplacement.value = displacement;
			material.uniforms.uAberration.value = aberration;
			updateDataTexture();
			renderer.render(scene, camera);
		});

		void video.play().catch(() => {});

		return () => {
			renderer.setAnimationLoop(null);
			resizeObserver.disconnect();
			renderer.domElement.removeEventListener('pointermove', onPointerMove);
			video.removeEventListener('loadeddata', onVideoReady);
			video.pause();
			video.removeAttribute('src');
			video.load();

			scene.remove(mesh);
			mesh.geometry.dispose();
			material.dispose();
			dataTexture.dispose();
			videoTexture.dispose();
			renderer.dispose();

			if (renderer.domElement.parentNode === container) {
				container.removeChild(renderer.domElement);
			}
		};
	});
</script>

<section
	class="pixelated-video-hover relative h-full w-full overflow-hidden {className}"
	bind:this={rootEl}
>
	<video
		bind:this={videoEl}
		class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
		{autoplay}
		{muted}
		{loop}
		playsinline
	></video>
</section>

<style>
	.pixelated-video-hover :global(.pixelated-video-hover__canvas) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
