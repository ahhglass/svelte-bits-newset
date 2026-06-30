<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlock from '$lib/components/docs/preview/CodeBlock.svelte';
	import {
		PKG_TO_RUNNER,
		RUNNER_TO_PKG,
		RUNNERS,
		jsrepoAddSnippet,
		REGISTRY_BASE,
		registryUrl,
		shadcnAddSnippet,
		type PackageManager,
		type Runner
	} from '$lib/constants/cli';

	type Method = 'manual' | 'jsrepo' | 'shadcn';

	let method = $state<Method>('manual');
	let pkg = $state<PackageManager>('npm');
	let dropOpen = $state(false);
	let dropdownEl = $state<HTMLDivElement | null>(null);

	const runner = $derived<Runner>(PKG_TO_RUNNER[pkg]);
	const featuredJsrepoCommand = $derived(jsrepoAddSnippet('aurora', pkg));
	const genericJsrepoCommand = $derived(jsrepoAddSnippet('<component>', pkg));
	const featuredShadcnCommand = $derived(shadcnAddSnippet('aurora', pkg));
	const genericShadcnCommand = $derived(shadcnAddSnippet('<component>', pkg));

	const usageSnippet = `<` + `script lang="ts">
  import ShinyText from '$lib/components/svelte-bits/ShinyText.svelte';
<` + `/script>

<ShinyText text="Hello, you!" speed={3} />`;

	function pickRunner(r: Runner) {
		pkg = RUNNER_TO_PKG[r];
		dropOpen = false;
	}

	function onDocClick(e: MouseEvent) {
		if (!dropOpen) return;
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) dropOpen = false;
	}

	onMount(() => {
		window.scrollTo(0, 0);
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});
</script>

<svelte:head>
	<title>Установка - svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">Установка</h3>

	<p class="docs-paragraph dim">
		Подключить компоненты очень просто — справится любой.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Выберите способ</h3>

	<p class="docs-paragraph">
		Можно вставить исходный код со страницы компонента или подтянуть через
		<a class="docs-link" href="https://www.jsrepo.dev/" target="_blank" rel="noreferrer">jsrepo</a> или
		<a class="docs-link" href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">shadcn CLI</a>.
	</p>

	<p class="docs-paragraph dim">Нажмите на карточку, чтобы выбрать способ.</p>

	<div class="installation-methods">
		<button
			type="button"
			class="installation-method"
			class:method-active={method === 'manual'}
			onclick={() => (method = 'manual')}
		>
			<svg
				width="44"
				height="44"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
			</svg>
			<span class="installation-method-label">Manual</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={method === 'jsrepo'}
			onclick={() => (method = 'jsrepo')}
		>
			<img
				class="installation-method-logo"
				src="/vendor/install-brands/jsrepo-favicon.ico"
				alt=""
				width="44"
				height="44"
				loading="lazy"
				decoding="async"
			/>
			<span class="installation-method-label">jsrepo</span>
		</button>

		<button
			type="button"
			class="installation-method"
			class:method-active={method === 'shadcn'}
			onclick={() => (method = 'shadcn')}
			aria-label="shadcn CLI"
		>
			<img
				class="installation-method-logo"
				src="/vendor/install-brands/shadcn-favicon.ico"
				alt=""
				width="44"
				height="44"
				loading="lazy"
				decoding="async"
			/>
			<span class="installation-method-label">shadcn</span>
		</button>
	</div>

	<h3 class="docs-category-title">Шаги</h3>

	{#if method === 'manual'}
		<p class="docs-paragraph dim">Ручная установка:</p>

		<h4 class="docs-category-subtitle">1. Выберите компонент</h4>
		<p class="docs-paragraph">
			Найдите компонент в боковом меню и откройте вкладку
			<span class="docs-highlight">Code</span>.
		</p>

		<h4 class="docs-category-subtitle">2. Установите зависимости</h4>
		<p class="docs-paragraph short">
			Некоторые компоненты используют внешние библиотеки (например, <code class="prop-code">gsap</code>,
			<code class="prop-code">ogl</code>, <code class="prop-code">motion</code>,
			<code class="prop-code">three</code>). Установите те, что указаны в начале вкладки Code.
		</p>
		<CodeBlock language="bash" code="npm install gsap" />

		<h4 class="docs-category-subtitle">3. Скопируйте код</h4>
		<p class="docs-paragraph short">
			На вкладке <span class="docs-highlight">Code</span> — полный исходник компонента. Каждый
			компонент Svelte Bits — один файл <code class="prop-code">.svelte</code>, без соседних
			утилит. Вставьте в <code class="prop-code">src/lib/components/</code> — и готово.
		</p>

		<h4 class="docs-category-subtitle">4. Используйте компонент</h4>
		<p class="docs-paragraph short">
			На странице компонента есть пример использования. Все props — на вкладке
			<span class="docs-highlight">Preview</span>: панель настроек и таблица props.
		</p>
		<CodeBlock language="svelte" code={usageSnippet} />
	{:else}
		<div class="install-runner-row">
			<span class="install-runner-label">Runner</span>
			<div class="install-runner-dropdown" bind:this={dropdownEl}>
				<button
					type="button"
					class="install-runner-trigger"
					onclick={(e) => {
						e.stopPropagation();
						dropOpen = !dropOpen;
					}}
				>
					{runner}
					<svg
						class="install-runner-caret"
						class:open={dropOpen}
						width="11"
						height="11"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.4"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				<div class="install-runner-menu" class:open={dropOpen}>
					{#each RUNNERS as r (r)}
						<button
							type="button"
							class="install-runner-item"
							class:active={runner === r}
							onclick={() => pickRunner(r)}
						>
							{r}
						</button>
					{/each}
				</div>
			</div>
		</div>

		{#if method === 'jsrepo'}
			<h4 class="docs-category-subtitle">Установка</h4>
			<p class="docs-paragraph short">
				Выполните команды ниже — в примере устанавливается
				<a class="docs-link" href="/backgrounds/aurora">Aurora</a>:
			</p>

			<CodeBlock language="bash" code={featuredJsrepoCommand} />

			<h4 class="docs-category-subtitle">Общий вид</h4>
			<p class="docs-paragraph short">
				Замените <code class="prop-code">&lt;component&gt;</code> на slug компонента (например,
				<code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>,
				<code class="prop-code">dock</code>). Slug указан на странице каждого компонента.
			</p>
			<CodeBlock language="bash" code={genericJsrepoCommand} />

			<h4 class="docs-category-subtitle">Куда попадает файл</h4>
			<p class="docs-paragraph short">
				По умолчанию файл копируется в
				<code class="prop-code">$lib/components/&lt;Component&gt;.svelte</code>. Переносите куда
				удобно — это обычный Svelte-файл. jsrepo сам установит нужные зависимости (
				<code class="prop-code">gsap</code>, <code class="prop-code">ogl</code> и т.д.).
			</p>
		{:else}
			<p class="docs-paragraph">
				Нужен инициализированный shadcn с <code class="prop-code">components.json</code>.
			</p>

			<h4 class="docs-category-subtitle">Установка</h4>
			<p class="docs-paragraph short">
				Установите
				<a class="docs-link" href="/backgrounds/aurora">Aurora</a>
				с выбранным runner:
			</p>

			<CodeBlock language="bash" code={featuredShadcnCommand} />

			<h4 class="docs-category-subtitle">Общий вид</h4>
			<p class="docs-paragraph short">
				Подставьте slug вместо <code class="prop-code">&lt;component&gt;</code> — как в URL
				документации (<code class="prop-code">aurora</code>, <code class="prop-code">shiny-text</code>,
				<code class="prop-code">dock</code>):
			</p>
			<CodeBlock language="bash" code={genericShadcnCommand} />

			<h4 class="docs-category-subtitle">Куда попадает файл</h4>
			<p class="docs-paragraph short">
				CLI следует метаданным реестра — путь совпадает с jsrepo (обычно
				<code class="prop-code">$lib/components/svelte-bits/</code>). Переносите свободно.
				Зависимости ставятся вместе с <code class="prop-code">add</code>.
			</p>
		{/if}

		<p class="docs-paragraph dim install-tip">
			Совет: на каждой странице компонента под вкладкой <span class="docs-highlight">Code</span> есть
			блок установки — команды jsrepo/shadcn уже с нужным slug.
		</p>
	{/if}

	<hr class="docs-separator" />

	<h4 class="docs-category-subtitle">Готово!</h4>

	<p class="docs-paragraph">
		Дальше — интеграция в ваш проект. Код ваш: меняйте стили, поведение, props — что угодно.
	</p>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/introduction">
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
			Введение
		</a>
		<a class="docs-button" href="/get-started/mcp-server">
			MCP Server
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
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</svg>
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

	/* ── Method selector cards ── */

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

	.installation-method-logo {
		width: 44px;
		height: 44px;
		object-fit: contain;
		flex-shrink: 0;
		transition:
			opacity 0.18s ease,
			filter 0.18s ease;
		pointer-events: none;
	}

	.installation-method:not(.method-active) .installation-method-logo {
		opacity: 0.48;
		filter: grayscale(0.15);
	}

	.installation-method:hover:not(.method-active) .installation-method-logo {
		opacity: 0.85;
		filter: grayscale(0.08);
	}

	.installation-method.method-active .installation-method-logo {
		opacity: 1;
		filter: none;
	}

	@media (max-width: 720px) {
		.installation-methods {
			grid-template-columns: 1fr;
		}
		.installation-method {
			padding: 24px 16px;
		}
	}

	/* ── Runner dropdown (CLI step) ── */

	.install-runner-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 14px 0 10px;
	}

	.install-runner-label {
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.45);
	}

	.install-runner-dropdown {
		position: relative;
	}

	.install-runner-trigger {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.85);
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		border-radius: 7px;
		padding: 6px 10px 6px 12px;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.install-runner-trigger:hover {
		border-color: rgba(255, 255, 255, 0.18);
		background: rgba(255, 255, 255, 0.03);
	}

	.install-runner-caret {
		transition: transform 0.18s ease;
		opacity: 0.7;
	}

	.install-runner-caret.open {
		transform: rotate(180deg);
	}

	.install-runner-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		min-width: 140px;
		display: flex;
		flex-direction: column;
		padding: 4px;
		border-radius: 9px;
		border: 1px solid var(--border-primary);
		background: rgba(29, 24, 20, 0.98);
		backdrop-filter: blur(20px) saturate(1.3);
		-webkit-backdrop-filter: blur(20px) saturate(1.3);
		box-shadow:
			0 8px 28px rgba(0, 0, 0, 0.4),
			inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
		z-index: 20;
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
		transition: opacity 0.15s ease, transform 0.15s ease;
	}

	.install-runner-menu.open {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.install-runner-item {
		font-family: 'Geist Mono', monospace;
		font-size: 12px;
		text-align: left;
		color: rgba(255, 255, 255, 0.7);
		background: transparent;
		border: none;
		border-radius: 6px;
		padding: 7px 10px;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.install-runner-item:hover {
		color: rgba(255, 255, 255, 0.95);
		background: rgba(255, 255, 255, 0.05);
	}

	.install-runner-item.active {
		color: var(--color-accent);
		background: rgba(255, 138, 76, 0.08);
	}

	.install-tip {
		margin-top: 1rem;
	}

	:global(.docs-separator + .docs-category-title),
	:global(.docs-separator + .docs-category-subtitle) {
		margin-top: 0;
	}
</style>
