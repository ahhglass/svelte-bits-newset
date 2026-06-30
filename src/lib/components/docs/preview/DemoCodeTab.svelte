<script lang="ts">
	import { stripSvelteBitsHeader } from '$lib/utils/svelte-bits-source-header';
	import CliInstall from './CliInstall.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import { docsUi } from '$lib/i18n/docs';

	type Props = {
		slug: string;
		usage: string;
		source: string;
	};

	let { slug, usage, source }: Props = $props();

	/** Mirrors registry installs: omit internal `<!-- @svelte-bits -->` metadata. */
	const sourceForDocs = $derived(stripSvelteBitsHeader(source));
</script>

<CliInstall {slug} />
<h3 class="demo-title-extra">{docsUi.usage}</h3>
<CodeBlock code={usage} language="svelte" />
<h3 class="demo-title-extra">{docsUi.componentSource}</h3>
<CodeBlock code={sourceForDocs} language="svelte" />
