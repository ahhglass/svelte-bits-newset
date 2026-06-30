<script lang="ts">
	import type { PropRow } from './PropTable.svelte';
	import { docsUi } from '$lib/i18n/docs';
	import { tPropDescription } from '$lib/i18n';

	type Props = { rows: PropRow[] };
	let { rows }: Props = $props();

	const translatedRows = $derived(
		rows.map((row) => ({
			...row,
			description: tPropDescription(row.description)
		}))
	);
</script>

<section class="prop-table-section">
	<h2 class="demo-title-extra">{docsUi.props}</h2>

	<div class="prop-table-wrap">
		<table class="prop-table">
			<thead>
				<tr>
					<th>{docsUi.propName}</th>
					<th>{docsUi.propType}</th>
					<th>{docsUi.propDefault}</th>
					<th>{docsUi.propDescription}</th>
				</tr>
			</thead>
			<tbody>
				{#each translatedRows as row (row.name)}
					<tr>
						<td><code class="prop-code">{row.name}</code></td>
						<td><span class="prop-type">{row.type}</span></td>
						<td><code class="prop-code">{row.default}</code></td>
						<td>{row.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="prop-cards">
		{#each translatedRows as row (row.name)}
			<div class="prop-card">
				<div class="prop-card-header">
					<code class="prop-code">{row.name}</code>
					<span class="prop-card-type">{row.type}</span>
				</div>
				<p class="prop-card-desc">{row.description}</p>
				<div class="prop-card-default">
					<span class="prop-card-label">{docsUi.defaultLabel}</span>
					<code class="prop-code">{row.default}</code>
				</div>
			</div>
		{/each}
	</div>
</section>
