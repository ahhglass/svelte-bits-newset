<script lang="ts">
	import type { Snippet } from 'svelte';
	import { docsUi } from '$lib/i18n/docs';

	type Props = { children: Snippet };
	let { children }: Props = $props();
</script>

<h2 class="demo-title-extra">{docsUi.customize}</h2>
<div class="preview-options">
	{@render children()}
</div>
