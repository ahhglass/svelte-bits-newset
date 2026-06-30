<script lang="ts">
	import ComponentList from '$lib/components/docs/ComponentList.svelte';
	import { COMPONENT_INDEX_ITEMS } from '$lib/constants/componentIndex';
</script>

<svelte:head>
	<title>Svelte Bits — каталог компонентов</title>
</svelte:head>

<ComponentList title="Каталог" items={COMPONENT_INDEX_ITEMS} />
