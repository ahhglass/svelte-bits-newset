<script lang="ts">
	import PreviewLoader from '$lib/components/docs/preview/PreviewLoader.svelte';

	type Props = {
		videoBase: string;
		title: string;
		playing?: boolean;
	};

	let { videoBase, title, playing = false }: Props = $props();

	type Status = 'idle' | 'loading' | 'ready' | 'error';

	let status = $state<Status>('idle');
	let shouldLoad = $state(false);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let wrapEl = $state<HTMLElement | null>(null);

	const webmSrc = $derived(`${videoBase}.webm`);
	const mp4Src = $derived(`${videoBase}.mp4`);

	function beginLoad() {
		if (shouldLoad || status === 'ready') return;
		shouldLoad = true;
		status = 'loading';
	}

	function retryLoad() {
		if (!videoEl) return;
		status = 'loading';
		videoEl.load();
	}

	function handleReady() {
		if (!videoEl) return;
		if (videoEl.currentTime < 0.05) videoEl.currentTime = 0.1;
		status = 'ready';
	}

	function handleError() {
		status = 'error';
	}

	$effect(() => {
		if (!wrapEl) return;
		if (typeof IntersectionObserver === 'undefined') {
			beginLoad();
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) beginLoad();
			},
			{ rootMargin: '200px', threshold: 0 }
		);
		io.observe(wrapEl);
		return () => io.disconnect();
	});

	$effect(() => {
		if (!shouldLoad || !videoEl) return;
		videoEl.load();
	});

	$effect(() => {
		if (!playing) return;
		if (!shouldLoad) beginLoad();
		else if (status === 'error') retryLoad();
	});

	$effect(() => {
		if (!videoEl || status !== 'ready') return;
		if (playing) {
			const play = videoEl.play();
			if (play && typeof play.catch === 'function') play.catch(() => {});
		} else {
			videoEl.pause();
		}
	});
</script>

<div class="preview-wrap" bind:this={wrapEl}>
	{#if status === 'loading'}
		<div class="preview-loader">
			<PreviewLoader />
		</div>
	{/if}

	<video
		bind:this={videoEl}
		class:visible={status === 'ready'}
		loop
		muted
		playsinline
		preload="none"
		onloadeddata={handleReady}
		onloadedmetadata={handleReady}
		onerror={handleError}
		aria-label="{title} preview"
	>
		{#if shouldLoad}
			<source src={webmSrc} type="video/webm" />
			<source src={mp4Src} type="video/mp4" />
		{/if}
	</video>
</div>

<style>
	.preview-wrap {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.preview-loader {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		pointer-events: none;
	}

	video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
		filter: grayscale(100%);
		mix-blend-mode: screen;
		opacity: 0;
		transition: opacity 0.25s ease;
	}

	video.visible {
		opacity: 1;
	}
</style>
