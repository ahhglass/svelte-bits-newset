<!-- @svelte-bits
{
  "title": "Animated Cards Way Too Bouncy",
  "description": "Magnetic spring-physics cards that bounce and tilt from cursor velocity with neighbor influence.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type MagneticCardLayout = {
		rotation: number;
		x: number;
		y: number;
	};
</script>

<script lang="ts">
	import { gsap } from 'gsap';

	type CardPhysics = {
		el: HTMLDivElement;
		restX: number;
		restY: number;
		restR: number;
		x: number;
		y: number;
		r: number;
		vx: number;
		vy: number;
		vr: number;
	};

	type Props = {
		images?: string[];
		layouts?: MagneticCardLayout[];
		backgroundColor?: string;
		cardSize?: number;
		cardRadius?: string;
		proximityRadius?: number;
		pushForce?: number;
		tiltAmount?: number;
		neighborInfluence?: number;
		springStiffness?: number;
		bounceFriction?: number;
		cursorSmoothing?: number;
		class?: string;
	};

	const DEFAULT_LAYOUTS: MagneticCardLayout[] = [
		{ rotation: 5, x: -275, y: 10 },
		{ rotation: -5, x: -100, y: -10 },
		{ rotation: 7.5, x: 100, y: 25 },
		{ rotation: -10, x: 275, y: -10 }
	];

	let {
		images = [
			'/assets/magnetic-cards/card-img-1.jpg',
			'/assets/magnetic-cards/card-img-2.jpg',
			'/assets/magnetic-cards/card-img-3.jpg',
			'/assets/magnetic-cards/card-img-4.jpg'
		],
		layouts,
		backgroundColor = '#141414',
		cardSize = 250,
		cardRadius = '1rem',
		proximityRadius = 500,
		pushForce = 10,
		tiltAmount = 0.1,
		neighborInfluence = 0.2,
		springStiffness = 0.05,
		bounceFriction = 0.85,
		cursorSmoothing = 0.75,
		class: className = ''
	}: Props = $props();

	let spotlightEl = $state<HTMLElement | undefined>();

	const buildLayouts = (count: number, custom?: MagneticCardLayout[]) => {
		if (custom && custom.length >= count) return custom.slice(0, count);
		if (count === DEFAULT_LAYOUTS.length) return DEFAULT_LAYOUTS;

		const spread = Math.min(320, 100 + count * 45);
		return Array.from({ length: count }, (_, i) => {
			const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;
			return {
				rotation: t * 10,
				x: t * spread,
				y: (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 7)
			};
		});
	};

	const calculatePushForce = (
		card: CardPhysics,
		cursor: { x: number; y: number; vx: number; vy: number }
	) => {
		const speed = Math.hypot(cursor.vx, cursor.vy);
		if (speed < 0.5) return { fx: 0, fy: 0 };

		const rect = card.el.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const dx = cursor.x - cx;
		const dy = cursor.y - cy;
		const dist = Math.hypot(dx, dy);

		if (dist > proximityRadius) return { fx: 0, fy: 0 };

		const weight = (1 - dist / proximityRadius) ** 3;
		return {
			fx: cursor.vx * pushForce * weight,
			fy: cursor.vy * pushForce * weight
		};
	};

	const applyNeighborInfluence = (
		forces: { fx: number; fy: number }[],
		index: number
	) => {
		forces.forEach((force, j) => {
			if (j === index) return;
			const falloff = neighborInfluence ** Math.abs(j - index);
			forces[index].fx += force.fx * falloff;
			forces[index].fy += force.fy * falloff * 0.6;
		});
	};

	$effect(() => {
		void images;
		void layouts;
		void cardSize;
		void proximityRadius;
		void pushForce;
		void tiltAmount;
		void neighborInfluence;
		void springStiffness;
		void bounceFriction;
		void cursorSmoothing;

		const spotlight = spotlightEl;
		if (!spotlight || images.length === 0) return;

		let cancelled = false;
		let teardown: (() => void) | undefined;

		const setup = () => {
			if (cancelled) return;

			const cardEls = [...spotlight.querySelectorAll<HTMLDivElement>('.acwtb-card')];
			if (cardEls.length !== images.length) {
				requestAnimationFrame(setup);
				return;
			}

			const baseLayouts = buildLayouts(images.length, layouts);
			const layoutScale = Math.min(1, Math.max(0.35, spotlight.clientWidth / 1100));
			const resolvedLayouts = baseLayouts.map((layout) => ({
				rotation: layout.rotation,
				x: layout.x * layoutScale,
				y: layout.y * layoutScale
			}));

			const cursor = { x: 0, y: 0, vx: 0, vy: 0 };
			let prevCursorX = 0;
			let prevCursorY = 0;

			const cardPhysics: CardPhysics[] = cardEls.map((el, i) => {
				const layout = resolvedLayouts[i];
				gsap.set(el, {
					x: layout.x,
					y: layout.y,
					rotation: layout.rotation,
					xPercent: -50,
					yPercent: -50,
					zIndex: i
				});

				return {
					el,
					restX: layout.x,
					restY: layout.y,
					restR: layout.rotation,
					x: layout.x,
					y: layout.y,
					r: layout.rotation,
					vx: 0,
					vy: 0,
					vr: 0
				};
			});

			const onPointerMove = (event: PointerEvent) => {
				cursor.vx = (event.clientX - prevCursorX) * cursorSmoothing;
				cursor.vy = (event.clientY - prevCursorY) * cursorSmoothing;
				cursor.x = event.clientX;
				cursor.y = event.clientY;
				prevCursorX = event.clientX;
				prevCursorY = event.clientY;
			};

			const onPointerLeave = () => {
				cursor.vx = 0;
				cursor.vy = 0;
			};

			const tick = () => {
				const forces = cardPhysics.map((card) => calculatePushForce(card, cursor));
				forces.forEach((_, i) => applyNeighborInfluence(forces, i));

				cardPhysics.forEach((card, i) => {
					const { fx, fy } = forces[i];
					card.vx = (card.vx + (card.restX + fx - card.x) * springStiffness) * bounceFriction;
					card.vy = (card.vy + (card.restY + fy - card.y) * springStiffness) * bounceFriction;
					card.vr = (card.vr + (card.restR + fx * tiltAmount - card.r) * springStiffness) * bounceFriction;
					card.x += card.vx;
					card.y += card.vy;
					card.r += card.vr;

					gsap.set(card.el, {
						x: card.x,
						y: card.y,
						rotation: card.r
					});
				});
			};

			spotlight.addEventListener('pointermove', onPointerMove);
			spotlight.addEventListener('pointerleave', onPointerLeave);
			gsap.ticker.add(tick);

			teardown = () => {
				spotlight.removeEventListener('pointermove', onPointerMove);
				spotlight.removeEventListener('pointerleave', onPointerLeave);
				gsap.ticker.remove(tick);
				cardEls.forEach((el) => gsap.set(el, { clearProps: 'transform' }));
			};
		};

		requestAnimationFrame(setup);

		return () => {
			cancelled = true;
			teardown?.();
		};
	});
</script>

<section
	bind:this={spotlightEl}
	class="acwtb-spotlight {className}"
	style:background-color={backgroundColor}
	style:--acwtb-card-size="{cardSize}px"
	style:--acwtb-card-radius={cardRadius}
>
	<div class="acwtb-cards">
		{#each images as src, i (src + i)}
			<div class="acwtb-card">
				<img {src} alt="" draggable="false" />
			</div>
		{/each}
	</div>
</section>

<style>
	.acwtb-spotlight {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		overflow: hidden;
		touch-action: none;
	}

	.acwtb-cards {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0;
		height: 0;
	}

	.acwtb-card {
		position: absolute;
		top: 0;
		left: 0;
		width: var(--acwtb-card-size, 250px);
		height: var(--acwtb-card-size, 250px);
		border-radius: var(--acwtb-card-radius, 1rem);
		overflow: hidden;
		will-change: transform;
	}

	.acwtb-card img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}
</style>
