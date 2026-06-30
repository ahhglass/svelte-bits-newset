<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import { SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC } from '$lib/constants/cli';
	import claudeIcon from '$lib/assets/icons/claude.svg';
	import cursorIcon from '$lib/assets/icons/cursor.svg';
	import vscodeIcon from '$lib/assets/icons/vscode.svg';

	type Client = 'claude' | 'cursor' | 'vscode';

	let client = $state<Client>('claude');

	const initCommand = $derived(`npx shadcn@latest mcp init --client ${client}`);

	const examplePrompts = [
		'Покажи все доступные фоны из реестра Svelte Bits',
		'Добавь фон Aurora из Svelte Bits на страницу и сделай его оранжевым',
		'Добавь новую секцию, которая плавно появляется при прокрутке с помощью AnimatedContent из Svelte Bits'
	];

	onMount(() => {
		window.scrollTo(0, 0);
	});
</script>

<svelte:head>
	<title>MCP Сервер — svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">MCP Сервер</h3>

	<p class="docs-paragraph">
		<a
			class="docs-link"
			href="https://modelcontextprotocol.io/"
			target="_blank"
			rel="noreferrer">Model Context Protocol (MCP)</a
		>
		— это открытый стандарт, который позволяет AI-ассистентам безопасно подключаться к внешним источникам данных и инструментам.
	</p>

	<p class="docs-paragraph dim">
		Svelte Bits рекомендует использовать
		<a class="docs-link" href="https://ui.shadcn.com/docs/mcp" target="_blank" rel="noreferrer"
			>MCP сервер от shadcn</a
		>
		, чтобы просматривать, искать и устанавливать компоненты с помощью естественного языка.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Быстрый старт</h3>

	<p class="docs-paragraph">
		Реестры настраиваются в файле вашего проекта <code class="prop-code">components.json</code>.
		Добавьте реестр Svelte Bits (например, пространство имён <span class="docs-highlight">@sveltebits</span>; вы можете
		использовать любой ключ по вашему выбору):
	</p>
	<CodeBlock language="json" code={SAMPLE_COMPONENTS_JSON_REGISTRIES_DOC} />

	<p class="docs-paragraph dim">
		Далее выберите клиента ниже и настройте MCP сервер от shadcn.
	</p>

	<div class="installation-methods">
		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'claude'}
			onclick={() => (client = 'claude')}
			aria-label="Claude Code"
		>
			<img src={claudeIcon} alt="Логотип Claude Code" width="40" height="40" />
			<span class="installation-method-label">Claude Code</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'cursor'}
			onclick={() => (client = 'cursor')}
			aria-label="Cursor"
		>
			<img src={cursorIcon} alt="Логотип Cursor" width="40" height="40" />
			<span class="installation-method-label">Cursor</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={client === 'vscode'}
			onclick={() => (client = 'vscode')}
			aria-label="VS Code"
		>
			<img src={vscodeIcon} alt="Логотип VS Code" width="40" height="40" />
			<span class="installation-method-label">VS Code</span>
		</button>
	</div>

	<p class="docs-paragraph short">Выполните эту команду в вашем проекте:</p>
	<CodeBlock language="bash" code={initCommand} />

	{#if client === 'claude'}
		<p class="docs-paragraph">Перезапустите Claude Code, затем попробуйте такие запросы:</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
		<p class="docs-paragraph dim">Совет: используйте <code class="prop-code">/mcp</code> в Claude Code для отладки MCP сервера.</p>
	{:else if client === 'cursor'}
		<p class="docs-paragraph">
			Затем откройте настройки Cursor и включите MCP сервер от shadcn. Попробуйте такие запросы:
		</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
	{:else}
		<p class="docs-paragraph">
			Затем откройте <code class="prop-code">.vscode/mcp.json</code> и нажмите
			<span class="docs-highlight">Start</span> рядом с сервером shadcn. Попробуйте такие запросы:
		</p>
		<ul class="docs-list">
			{#each examplePrompts as prompt (prompt)}
				<li class="docs-list-item dim">{prompt}</li>
			{/each}
		</ul>
	{/if}

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Узнать больше</h3>

	<p class="docs-paragraph dim mcp-learn-more">
		Подробнее о MCP сервере shadcn, в том числе про ручную настройку для разных клиентов, читайте в официальной документации:
	</p>

	<a
		class="docs-paragraph docs-link"
		href="https://ui.shadcn.com/docs/mcp"
		target="_blank"
		rel="noreferrer"
	>
		ui.shadcn.com/docs/mcp
	</a>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/installation">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
			Установка
		</a>
	</div>
</section>

<style>
	.docs-link {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.docs-link:hover {
		color: var(--color-primary);
	}

	.docs-paragraph.short {
		margin-bottom: 0.5rem;
	}

	.installation-methods {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
		margin: 18px 0 32px;
	}

	.installation-method {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 32px 16px;
		border-radius: 12px;
		border: 1px solid var(--border-primary);
		background: var(--bg-card);
		color: rgba(255, 255, 255, 0.55);
		cursor: pointer;
		transition: border-color 0.18s, color 0.18s, background 0.18s, transform 0.18s;
	}

	.installation-method:hover {
		color: rgba(255, 255, 255, 0.9);
		border-color: rgba(255, 255, 255, 0.18);
		transform: translateY(-1px);
	}

	.installation-method.method-active {
		color: var(--color-accent);
		border-color: rgba(255, 138, 76, 0.5);
		background: rgba(255, 138, 76, 0.06);
	}

	.installation-method-label {
		font-family: 'Geist Mono', monospace;
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.mcp-learn-more {
		margin-bottom: 16px;
	}

	@media (max-width: 640px) {
		.installation-methods {
			grid-template-columns: 1fr;
		}
		.installation-method {
			padding: 24px 16px;
		}
	}

	:global(.docs-separator + .docs-category-title),
	:global(.docs-separator + .docs-category-subtitle) {
		margin-top: 0;
	}
</style>
