<!-- @svelte-bits
{
  "title": "Draggable Pill Nav",
  "description": "Draggable pill-shaped nav with elastic expand/collapse and snap-back drop zone.",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type DraggablePillNavItem = {
		label: string;
		href: string;
		ariaLabel?: string;
	};
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { gsap } from 'gsap';
	import { Draggable } from 'gsap/Draggable';

	gsap.registerPlugin(Draggable);

	type Props = {
		logo: string;
		logoAlt?: string;
		items: DraggablePillNavItem[];
		class?: string;
		useFixedPosition?: boolean;
		initialTop?: string;
		initialLeft?: string;
		snapThreshold?: number;
		drawerPadding?: number;
		drawerGap?: number;
		drawerColor?: string;
		pillColor?: string;
		pillHoverColor?: string;
		textColor?: string;
		togglerColor?: string;
		dropZoneBorderColor?: string;
	};

	let {
		logo,
		logoAlt = 'Logo',
		items,
		class: className = '',
		useFixedPosition = true,
		initialTop = '2rem',
		initialLeft = '2rem',
		snapThreshold = 200,
		drawerPadding = 0.35 * 16,
		drawerGap = 0.35 * 16,
		drawerColor = '#e8e6e7',
		pillColor = '#fafafa',
		pillHoverColor = '#f4f4f4',
		textColor = '#0f0f0f',
		togglerColor = '#d3d2d2',
		dropZoneBorderColor = 'rgba(0, 0, 0, 0.5)'
	}: Props = $props();

	let rootEl: HTMLDivElement;
	let menuDropZone: HTMLDivElement;
	let menuDrawer: HTMLDivElement;
	let menuLogo: HTMLDivElement;
	let menuItems: HTMLDivElement;
	let menuToggler: HTMLButtonElement;
	let menuItemElements: HTMLDivElement[] = [];

	let isMenuOpen = false;
	let currentOpenWidth = 0;
	let isAnimating = false;
	let togglerClose = $state(false);
	let closedMenuWidth = 0;

	const posClass = $derived(useFixedPosition ? 'fixed' : 'absolute');
	const originStyle = $derived(`top: ${initialTop}; left: ${initialLeft};`);
	const cssVars = $derived(
		`--dpn-drawer: ${drawerColor}; --dpn-pill: ${pillColor}; --dpn-pill-hover: ${pillHoverColor}; --dpn-text: ${textColor}; --dpn-toggler: ${togglerColor}; --dpn-drop-border: ${dropZoneBorderColor};`
	);

	const bindItem = (node: HTMLDivElement, index: number) => {
		menuItemElements[index] = node;
		return {
			destroy() {
				if (menuItemElements[index] === node) menuItemElements[index] = undefined as unknown as HTMLDivElement;
			}
		};
	};

	const getItemElements = () => menuItemElements.filter(Boolean);

	const isInSnapZone = (x: number, y: number) =>
		Math.abs(x) < snapThreshold && Math.abs(y) < snapThreshold;

	const measureClosedWidth = () => {
		if (!menuLogo || !menuToggler) return 0;
		return drawerPadding + menuLogo.offsetWidth + drawerGap + menuToggler.offsetWidth + drawerPadding;
	};

	const openMenu = () => {
		if (isAnimating || isMenuOpen || !menuItems || !menuDropZone) return;
		isAnimating = true;
		togglerClose = true;

		gsap.set(menuItems, { width: 'auto', marginRight: drawerGap });
		const itemsWidth = menuItems.offsetWidth;
		gsap.set(menuItems, { width: 0, marginRight: 0 });

		const logoWidth = menuLogo.offsetWidth;
		const togglerWidth = menuToggler.offsetWidth;
		const fullOpenWidth =
			drawerPadding + logoWidth + drawerGap + itemsWidth + drawerGap + togglerWidth + drawerPadding;

		const drawerRect = menuDrawer.getBoundingClientRect();
		const overflowRight = drawerRect.left + fullOpenWidth + 10 - window.innerWidth;

		if (overflowRight > 0) {
			const curX = gsap.getProperty(menuDrawer, 'x') as number;
			gsap.set(menuDrawer, { x: curX - overflowRight });
		}

		const itemEls = getItemElements();

		gsap.to(menuItems, {
			width: itemsWidth,
			marginRight: drawerGap,
			duration: 0.8,
			ease: 'elastic.out(1, 0.4)',
			overwrite: 'auto',
			onStart: () => {
				gsap.to(itemEls, {
					opacity: 1,
					scale: 1,
					duration: 0.3,
					stagger: 0.05,
					delay: 0.2,
					ease: 'power3.out',
					overwrite: 'auto'
				});
			},
			onComplete: () => {
				currentOpenWidth = fullOpenWidth;
				gsap.set(menuDropZone, { width: currentOpenWidth });
				isMenuOpen = true;
				isAnimating = false;
			}
		});
	};

	const closeMenu = () => {
		if (isAnimating || !isMenuOpen || !menuItems || !menuDropZone) return;
		isAnimating = true;
		togglerClose = false;

		const itemEls = getItemElements();

		gsap.to(menuItems, {
			width: 0,
			marginRight: 0,
			duration: 0.8,
			ease: 'elastic.out(1, 0.4)',
			overwrite: 'auto',
			onStart: () => {
				gsap.to(itemEls, {
					opacity: 0,
					scale: 0.85,
					duration: 0.3,
					ease: 'power3.out',
					stagger: { each: 0.05, from: 'end' },
					overwrite: 'auto'
				});
			},
			onComplete: () => {
				gsap.set(menuDropZone, { width: closedMenuWidth });
				isMenuOpen = false;
				isAnimating = false;
			}
		});
	};

	const toggleMenu = () => {
		if (isAnimating) return;
		if (isMenuOpen) closeMenu();
		else openMenu();
	};

	const initLayout = () => {
		if (!menuDropZone || !menuItems) return;
		closedMenuWidth = measureClosedWidth();
		gsap.set(menuItems, { width: 0, marginRight: 0 });
		gsap.set(getItemElements(), { opacity: 0, scale: 0.85 });
		gsap.set(menuDropZone, { width: closedMenuWidth, opacity: 0 });
	};

	$effect(() => {
		snapThreshold;
		useFixedPosition;

		if (!menuDrawer || !menuDropZone || !menuLogo || !menuItems || !menuToggler) return;

		let cancelled = false;
		let teardown: (() => void) | undefined;

		tick().then(() => {
			if (cancelled) return;

			initLayout();

			const boundsEl = useFixedPosition ? window : (rootEl ?? menuDrawer.parentElement);
			if (!boundsEl) return;

			const draggable = Draggable.create(menuDrawer, {
				type: 'x,y',
				bounds: boundsEl as HTMLElement | Window,
				cursor: 'grab',
				activeCursor: 'grabbing',
				onDragStart() {
					const activeWidth = isMenuOpen ? currentOpenWidth : closedMenuWidth;
					gsap.set(menuDropZone, { width: activeWidth });
				},
				onDrag() {
					gsap.to(menuDropZone, {
						opacity: isInSnapZone(this.x, this.y) ? 1 : 0,
						duration: 0.1,
						overwrite: 'auto'
					});
				},
				onDragEnd() {
					gsap.to(menuDropZone, {
						opacity: 0,
						duration: 0.1,
						overwrite: 'auto'
					});

					if (isInSnapZone(this.x, this.y)) {
						gsap.to(menuDrawer, {
							x: 0,
							y: 0,
							duration: 0.3,
							ease: 'power2.out',
							overwrite: 'auto'
						});
					}
				}
			})[0];

			const onResize = () => {
				draggable.update();
				if (!isMenuOpen) {
					closedMenuWidth = measureClosedWidth();
					gsap.set(menuDropZone, { width: closedMenuWidth });
				}
			};

			window.addEventListener('resize', onResize);
			window.addEventListener('orientationchange', onResize);

			teardown = () => {
				window.removeEventListener('resize', onResize);
				window.removeEventListener('orientationchange', onResize);
				draggable.kill();
			};
		});

		return () => {
			cancelled = true;
			teardown?.();
		};
	});
</script>

<div class="absolute inset-0 pointer-events-none {className}" bind:this={rootEl} style={cssVars}>
	<div
		class="menu-drop-zone pointer-events-none h-[calc(3.5rem+0.7rem)] rounded-[4rem] border-[0.075rem] border-dashed border-[var(--dpn-drop-border)] {posClass}"
		bind:this={menuDropZone}
		style={originStyle}
		aria-hidden="true"
	></div>

	<div
		class="pointer-events-auto flex items-center rounded-full bg-[var(--dpn-drawer)] p-[0.35rem] ring-0 ring-transparent transition-shadow hover:ring-4 hover:ring-[var(--dpn-drawer)] {posClass}"
		bind:this={menuDrawer}
		style={originStyle}
	>
		<div
			class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
			bind:this={menuLogo}
		>
			<img
				src={logo}
				alt={logoAlt}
				draggable="false"
				class="h-12 w-12 shrink-0 select-none object-contain"
			/>
		</div>

		<div class="flex w-0 gap-[0.35rem] overflow-hidden" bind:this={menuItems}>
			{#each items as item, i (item.href + item.label)}
				<div
					class="menu-item flex h-14 w-max shrink-0 items-center justify-center rounded-full bg-[var(--dpn-pill)] opacity-0 transition-colors duration-200 hover:bg-[var(--dpn-pill-hover)]"
					use:bindItem={i}
				>
					<a
						href={item.href}
						aria-label={item.ariaLabel ?? item.label}
						class="select-none px-6 font-[450] tracking-tight no-underline"
						style="color: {textColor}"
					>{item.label}</a>
				</div>
			{/each}
		</div>

		<button
			type="button"
			class="menu-toggler relative flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-[0.2rem] rounded-full border-0 bg-[var(--dpn-toggler)] p-[1.125rem]"
			class:close={togglerClose}
			bind:this={menuToggler}
			onclick={toggleMenu}
			aria-label="Toggle menu"
			aria-expanded={togglerClose}
		>
			<span class="block h-0.5 w-full" style="background-color: {textColor}"></span>
			<span class="block h-0.5 w-full" style="background-color: {textColor}"></span>
		</button>
	</div>
</div>

<style>
	.menu-drop-zone {
		transition: opacity 150ms ease-out;
	}

	.menu-item {
		scale: 0.85;
	}

	.menu-toggler span {
		transition: transform 0.3s ease;
		transform-origin: center;
		will-change: transform;
	}

	.menu-toggler.close span:nth-child(1) {
		transform: rotate(45deg) translateX(0.125rem) translateY(0.1rem) scaleX(0.9);
	}

	.menu-toggler.close span:nth-child(2) {
		transform: rotate(-45deg) translateX(0.125rem) translateY(-0.1rem) scaleX(0.9);
	}
</style>
