<script lang="ts">
	import { docsUi } from '$lib/i18n/docs';

	type Props = {
		name: string;
	};
	let { name }: Props = $props();
</script>

<div class="coming-soon-card">
	<span class="coming-soon-tag">{docsUi.comingSoon}</span>
	<h3 style="margin:0;font-size:1.4rem;color:var(--text-primary);font-weight:700;">
		{name}
	</h3>
	<p style="margin:0;max-width:42ch;line-height:1.55;">
		{docsUi.comingSoonBody}
		<a
			href="https://github.com/DavidHDev/svelte-bits"
			target="_blank"
			rel="noreferrer"
			style="color:var(--color-accent);text-decoration:underline;"
		>
			{docsUi.contributeGithub}
		</a>.
	</p>
</div>
