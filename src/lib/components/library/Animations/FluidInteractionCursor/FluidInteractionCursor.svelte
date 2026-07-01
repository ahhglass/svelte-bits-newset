<!-- @svelte-bits
{
  "title": "Fluid Interaction Cursor",
  "description": "GPU fluid ink cursor with threshold display shader — Cappen-style interaction field.",
  "dependencies": ["three"]
}
-->
<script module lang="ts">
	import * as THREE from 'three';

	export type FluidInteractionConfig = {
		simResolution: number;
		dyeResolution: number;
		curl: number;
		pressureIterations: number;
		velocityDissipation: number;
		dyeDissipation: number;
		splatRadius: number;
		forceStrength: number;
		pressureDecay: number;
		threshold: number;
		edgeSoftness: number;
		inkColor: THREE.Color;
	};

	const BASE_VERT = `
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = uv;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position, 1.0);
}
`;

	const SIMPLE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

	const P = 'precision highp float; precision highp sampler2D;';

	const SHADERS = {
		splat: `${P}
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`,
		advection: `${P}
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}`,
		divergence: `${P}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`,
		curl: `${P}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`,
		vorticity: `${P}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform vec2 texelSize;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(velocity + force * texelSize.y, 0.0, 1.0);
}`,
		pressure: `${P}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`,
		gradientSubtract: `${P}
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`,
		clear: `${P}
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main() {
  gl_FragColor = value * texture2D(uTexture, vUv);
}`,
		display: `${P}
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float threshold;
uniform float edgeSoftness;
uniform vec3 inkColor;
void main() {
  float d = length(texture2D(uTexture, vUv).rgb);
  float a = edgeSoftness > 0.0
    ? smoothstep(threshold - edgeSoftness * 0.5, threshold + edgeSoftness * 0.5, d)
    : step(threshold, d);
  gl_FragColor = vec4(inkColor, a);
}`
	};

	type DoubleFBO = {
		read: THREE.WebGLRenderTarget;
		write: THREE.WebGLRenderTarget;
		swap: () => void;
		dispose: () => void;
	};

	const rtOptions = (): THREE.RenderTargetOptions => ({
		type: THREE.HalfFloatType,
		depthBuffer: false,
		stencilBuffer: false,
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping
	});

	const createDoubleFBO = (w: number, h: number): DoubleFBO => {
		const opts = rtOptions();
		let read = new THREE.WebGLRenderTarget(w, h, opts);
		let write = new THREE.WebGLRenderTarget(w, h, opts);
		return {
			get read() {
				return read;
			},
			get write() {
				return write;
			},
			swap() {
				const tmp = read;
				read = write;
				write = tmp;
			},
			dispose() {
				read.dispose();
				write.dispose();
			}
		};
	};

	const createSingleFBO = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, rtOptions());

	type Materials = Record<
		| 'splat'
		| 'advection'
		| 'divergence'
		| 'curl'
		| 'vorticity'
		| 'pressure'
		| 'gradientSubtract'
		| 'clear'
		| 'display',
		THREE.ShaderMaterial
	>;

	export class FluidInteractionSimulation {
		private renderer: THREE.WebGLRenderer;
		private scene: THREE.Scene;
		private camera: THREE.OrthographicCamera;
		private quad: THREE.Mesh;
		private width = 0;
		private height = 0;
		private dpr = 1;
		private config: FluidInteractionConfig;
		private velocity!: DoubleFBO;
		private dye!: DoubleFBO;
		private divergence!: THREE.WebGLRenderTarget;
		private curl!: THREE.WebGLRenderTarget;
		private pressure!: DoubleFBO;
		private simSize = { w: 0, h: 0 };
		private dyeSize = { w: 0, h: 0 };
		private material!: Materials;
		private mouse = { x: 0, y: 0, velocityX: 0, velocityY: 0, moved: false, initialized: false };
		private raf = 0;
		private lastTime = Date.now();
		private active = true;
		private cleanups: Array<() => void> = [];

		constructor(
			canvas: HTMLCanvasElement,
			config: FluidInteractionConfig,
			maxDpr = 2
		) {
			this.config = config;
			this.renderer = new THREE.WebGLRenderer({
				canvas,
				alpha: true,
				antialias: false,
				powerPreference: 'high-performance',
				premultipliedAlpha: false
			});
			this.renderer.autoClear = false;
			this.renderer.setClearColor(0x000000, 0);
			this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

			this.scene = new THREE.Scene();
			this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
			this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
			this.scene.add(this.quad);

			this.setupTargets();
			this.setupMaterials();
			this.loop();
		}

		resize(cssW: number, cssH: number, dpr = this.dpr) {
			if (cssW <= 0 || cssH <= 0) return;
			this.dpr = dpr;
			this.width = Math.floor(cssW * dpr);
			this.height = Math.floor(cssH * dpr);
			this.renderer.setPixelRatio(1);
			this.renderer.setSize(this.width, this.height, false);
			this.disposeTargets();
			this.setupTargets();
		}

		updateConfig(partial: Partial<Omit<FluidInteractionConfig, 'inkColor'>> & { inkColor?: string }) {
			const { inkColor: inkHex, ...rest } = partial;
			this.config = { ...this.config, ...rest };
			if (inkHex !== undefined) this.config.inkColor.set(inkHex);
			if (inkHex !== undefined) this.material.display.uniforms.inkColor.value.set(inkHex);
			if (partial.threshold !== undefined) this.material.display.uniforms.threshold.value = partial.threshold;
			if (partial.edgeSoftness !== undefined)
				this.material.display.uniforms.edgeSoftness.value = partial.edgeSoftness;
			if (partial.curl !== undefined) this.material.vorticity.uniforms.curl.value = partial.curl;
		}

		private setupTargets() {
			const aspect = this.width / Math.max(1, this.height);
			const { simResolution, dyeResolution } = this.config;

			this.simSize = {
				w: Math.round(simResolution * aspect),
				h: simResolution
			};
			this.dyeSize = {
				w: Math.round(dyeResolution * aspect),
				h: dyeResolution
			};

			this.velocity = createDoubleFBO(this.simSize.w, this.simSize.h);
			this.dye = createDoubleFBO(this.dyeSize.w, this.dyeSize.h);
			this.divergence = createSingleFBO(this.simSize.w, this.simSize.h);
			this.curl = createSingleFBO(this.simSize.w, this.simSize.h);
			this.pressure = createDoubleFBO(this.simSize.w, this.simSize.h);
		}

		private disposeTargets() {
			this.velocity?.dispose();
			this.dye?.dispose();
			this.divergence?.dispose();
			this.curl?.dispose();
			this.pressure?.dispose();
		}

		private makeMaterial(fragment: string, uniforms: Record<string, THREE.IUniform>) {
			return new THREE.ShaderMaterial({
				vertexShader: fragment.includes('vL') ? BASE_VERT : SIMPLE_VERT,
				fragmentShader: fragment,
				uniforms,
				depthTest: false,
				depthWrite: false
			});
		}

		private setupMaterials() {
			const tex = () => ({ value: null as THREE.Texture | null });
			const num = (v = 0) => ({ value: v });
			const vec2 = () => ({ value: new THREE.Vector2() });

			this.material = {
				splat: this.makeMaterial(SHADERS.splat, {
					uTarget: tex(),
					aspectRatio: num(1),
					radius: num(this.config.splatRadius),
					color: { value: new THREE.Vector3() },
					point: vec2()
				}),
				advection: this.makeMaterial(SHADERS.advection, {
					uVelocity: tex(),
					uSource: tex(),
					texelSize: vec2(),
					dt: num(0.016),
					dissipation: num(1)
				}),
				divergence: this.makeMaterial(SHADERS.divergence, {
					uVelocity: tex(),
					texelSize: vec2()
				}),
				curl: this.makeMaterial(SHADERS.curl, {
					uVelocity: tex(),
					texelSize: vec2()
				}),
				vorticity: this.makeMaterial(SHADERS.vorticity, {
					uVelocity: tex(),
					uCurl: tex(),
					curl: num(this.config.curl),
					texelSize: vec2()
				}),
				pressure: this.makeMaterial(SHADERS.pressure, {
					uPressure: tex(),
					uDivergence: tex(),
					texelSize: vec2()
				}),
				gradientSubtract: this.makeMaterial(SHADERS.gradientSubtract, {
					uPressure: tex(),
					uVelocity: tex(),
					texelSize: vec2()
				}),
				clear: this.makeMaterial(SHADERS.clear, {
					uTexture: tex(),
					value: num(this.config.pressureDecay)
				}),
				display: this.makeMaterial(SHADERS.display, {
					uTexture: tex(),
					threshold: num(this.config.threshold),
					edgeSoftness: num(this.config.edgeSoftness),
					inkColor: { value: this.config.inkColor.clone() }
				})
			};

			this.material.display.transparent = true;
		}

		private pass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
			this.quad.material = material;
			this.renderer.setRenderTarget(target);
			this.renderer.render(this.scene, this.camera);
		}

		private splatRadiusValue() {
			return this.config.splatRadius / 100;
		}

		private dissipationFactor(rate: number, dt: number) {
			const capped = rate >= 1 ? 0.9995 : Math.max(0.5, rate);
			return Math.pow(capped, dt * 60);
		}

		private set(material: THREE.ShaderMaterial, values: Record<string, unknown>) {
			for (const [key, val] of Object.entries(values)) {
				material.uniforms[key].value = val;
			}
		}

		private splat(x: number, y: number, velocityX: number, velocityY: number) {
			const { material: m } = this;
			const aspect = this.width / Math.max(1, this.height);
			const point = new THREE.Vector2(x / this.width, 1 - y / this.height);

			this.set(m.splat, { aspectRatio: aspect, point, radius: this.splatRadiusValue() });

			const vel = this.velocity;
			this.set(m.splat, {
				uTarget: vel.read.texture,
				color: new THREE.Vector3(velocityX, velocityY, 0)
			});
			this.pass(m.splat, vel.write);
			vel.swap();

			const dye = this.dye;
			this.set(m.splat, {
				uTarget: dye.read.texture,
				color: new THREE.Vector3(1, 1, 1)
			});
			this.pass(m.splat, dye.write);
			dye.swap();
		}

		private simulate(dt: number) {
			const {
				material: m,
				velocity,
				dye,
				divergence,
				curl,
				pressure,
				simSize,
				dyeSize,
				config
			} = this;

			const simTexel = new THREE.Vector2(1 / simSize.w, 1 / simSize.h);
			const dyeTexel = new THREE.Vector2(1 / dyeSize.w, 1 / dyeSize.h);

			this.set(m.curl, { uVelocity: velocity.read.texture, texelSize: simTexel });
			this.pass(m.curl, curl);

			this.set(m.vorticity, {
				uVelocity: velocity.read.texture,
				uCurl: curl.texture,
				curl: config.curl,
				texelSize: simTexel
			});
			this.pass(m.vorticity, velocity.write);
			velocity.swap();

			this.set(m.divergence, { uVelocity: velocity.read.texture, texelSize: simTexel });
			this.pass(m.divergence, divergence);

			this.set(m.clear, { uTexture: pressure.read.texture, value: config.pressureDecay });
			this.pass(m.clear, pressure.write);
			pressure.swap();

			this.set(m.pressure, {
				uPressure: pressure.read.texture,
				uDivergence: divergence.texture,
				texelSize: simTexel
			});
			for (let i = 0; i < config.pressureIterations; i++) {
				this.set(m.pressure, { uPressure: pressure.read.texture });
				this.pass(m.pressure, pressure.write);
				pressure.swap();
			}

			this.set(m.gradientSubtract, {
				uPressure: pressure.read.texture,
				uVelocity: velocity.read.texture,
				texelSize: simTexel
			});
			this.pass(m.gradientSubtract, velocity.write);
			velocity.swap();

			this.set(m.advection, {
				uVelocity: velocity.read.texture,
				uSource: velocity.read.texture,
				texelSize: simTexel,
				dt,
				dissipation: this.dissipationFactor(config.velocityDissipation, dt)
			});
			this.pass(m.advection, velocity.write);
			velocity.swap();

			this.set(m.advection, {
				uVelocity: velocity.read.texture,
				uSource: dye.read.texture,
				texelSize: dyeTexel,
				dt,
				dissipation: this.dissipationFactor(config.dyeDissipation, dt)
			});
			this.pass(m.advection, dye.write);
			dye.swap();
		}

		private render() {
			this.renderer.setRenderTarget(null);
			this.renderer.clear();
			this.set(this.material.display, { uTexture: this.dye.read.texture });
			this.pass(this.material.display, null);
		}

		private loop() {
			const tick = () => {
				if (!this.active) return;
				const now = Date.now();
				const dt = Math.min((now - this.lastTime) / 1000, 0.016);
				this.lastTime = now;

				if (this.mouse.moved) {
					this.splat(this.mouse.x, this.mouse.y, this.mouse.velocityX, this.mouse.velocityY);
					this.mouse.moved = false;
				}

				if (this.width > 0 && this.height > 0) {
					this.simulate(dt);
					this.render();
				}

				this.raf = requestAnimationFrame(tick);
			};
			tick();
		}

		handlePointer(clientX: number, clientY: number, rect: DOMRect) {
			const x = (clientX - rect.left) * this.dpr;
			const y = (clientY - rect.top) * this.dpr;
			if (!this.mouse.initialized) {
				this.mouse.x = x;
				this.mouse.y = y;
				this.mouse.initialized = true;
				return;
			}
			this.mouse.velocityX = (x - this.mouse.x) * this.config.forceStrength;
			this.mouse.velocityY = (y - this.mouse.y) * this.config.forceStrength;
			const maxVel = 40;
			this.mouse.velocityX = Math.max(-maxVel, Math.min(maxVel, this.mouse.velocityX));
			this.mouse.velocityY = Math.max(-maxVel, Math.min(maxVel, this.mouse.velocityY));
			this.mouse.x = x;
			this.mouse.y = y;
			this.mouse.moved = true;
		}

		dispose() {
			this.active = false;
			cancelAnimationFrame(this.raf);
			this.cleanups.forEach((fn) => fn());
			this.disposeTargets();
			Object.values(this.material).forEach((mat) => mat.dispose());
			this.quad.geometry.dispose();
			this.renderer.dispose();
		}
	}
</script>

<script lang="ts">
	type Props = {
		class?: string;
		simResolution?: number;
		dyeResolution?: number;
		curl?: number;
		pressureIterations?: number;
		velocityDissipation?: number;
		dyeDissipation?: number;
		splatRadius?: number;
		forceStrength?: number;
		pressureDecay?: number;
		threshold?: number;
		edgeSoftness?: number;
		inkColor?: string;
		mixBlendMode?: string;
		maxDevicePixelRatio?: number;
		zIndex?: number;
	};

	let {
		class: className = '',
		simResolution = 256,
		dyeResolution = 1024,
		curl = 25,
		pressureIterations = 50,
		velocityDissipation = 0.95,
		dyeDissipation = 0.95,
		splatRadius = 0.25,
		forceStrength = 5,
		pressureDecay = 0.75,
		threshold = 1.0,
		edgeSoftness = 0,
		inkColor = '#ffffff',
		mixBlendMode = 'difference',
		maxDevicePixelRatio = 2,
		zIndex = 2
	}: Props = $props();

	const effectiveInkColor = $derived(mixBlendMode === 'difference' ? '#ffffff' : inkColor);

	let host: HTMLDivElement;
	let canvasEl: HTMLCanvasElement;
	let simRef: FluidInteractionSimulation | null = null;

	$effect(() => {
		const parent = host?.parentElement;
		const canvas = canvasEl;
		if (!host || !parent || !canvas) return;

		let active = true;
		const prevParentPos = parent.style.position;
		if (!prevParentPos || prevParentPos === 'static') parent.style.position = 'relative';

		const config: FluidInteractionConfig = {
			simResolution,
			dyeResolution,
			curl,
			pressureIterations,
			velocityDissipation,
			dyeDissipation,
			splatRadius,
			forceStrength,
			pressureDecay,
			threshold,
			edgeSoftness,
			inkColor: new THREE.Color(effectiveInkColor)
		};

		const sim = new FluidInteractionSimulation(canvas, config, maxDevicePixelRatio);
		simRef = sim;

		const resize = () => {
			if (!active) return;
			const rect = parent.getBoundingClientRect();
			const cssW = Math.floor(rect.width);
			const cssH = Math.floor(rect.height);
			if (cssW <= 0 || cssH <= 0) return;
			const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
			sim.resize(cssW, cssH, dpr);
		};

		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(parent);
		ro.observe(host);

		const onMove = (clientX: number, clientY: number) => {
			sim.handlePointer(clientX, clientY, parent.getBoundingClientRect());
		};

		const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
		const onTouchMove = (e: TouchEvent) => {
			if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
		};

		parent.addEventListener('mousemove', onMouseMove);
		parent.addEventListener('touchmove', onTouchMove, { passive: true });

		return () => {
			active = false;
			simRef = null;
			parent.removeEventListener('mousemove', onMouseMove);
			parent.removeEventListener('touchmove', onTouchMove);
			ro.disconnect();
			sim.dispose();
			if (!prevParentPos || prevParentPos === 'static') parent.style.position = prevParentPos;
		};
	});

	$effect(() => {
		simRef?.updateConfig({
			curl,
			splatRadius,
			forceStrength,
			velocityDissipation,
			dyeDissipation,
			pressureDecay,
			threshold,
			edgeSoftness,
			inkColor: effectiveInkColor
		});
	});
</script>

<div
	class="pointer-events-none absolute inset-0 {className}"
	bind:this={host}
	style="z-index: {zIndex}; mix-blend-mode: {mixBlendMode};"
	aria-hidden="true"
>
	<canvas
		bind:this={canvasEl}
		class="fic-canvas block h-full w-full"
		style:pointer-events="none"
	></canvas>
</div>

<style>
	.fic-canvas {
		background: transparent !important;
	}
</style>
