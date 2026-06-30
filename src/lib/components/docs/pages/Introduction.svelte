<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => window.scrollTo(0, 0));
</script>

<svelte:head>
	<title>Введение - svelte-bits</title>
</svelte:head>

<section class="docs-section">
	<h3 class="docs-category-title">Введение</h3>

	<p class="docs-paragraph dim">
		Svelte Bits — открытая коллекция тщательно продуманных UI-компонентов для Svelte-приложений.
	</p>
	<p class="docs-paragraph">
		Это не типичная библиотека компонентов: здесь нет набора стандартных кнопок, полей ввода и
		других привычных UI-элементов.
	</p>
	<p class="docs-paragraph">
		Эти компоненты помогают выделиться визуально и добавить в проекты немного креатива.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Миссия</h3>

	<p class="docs-paragraph dim">
		Цель Svelte Bits проста — дать гибкие, эффектные и, главное, бесплатные компоненты, которые
		выводят веб-проекты на новый уровень.
	</p>
	<p class="docs-paragraph">Для этого проект следует таким принципам:</p>

	<ul class="docs-list">
		<li class="docs-list-item">
			<span class="docs-highlight">Free For All:</span> код ваш, его можно свободно использовать в
			проектах
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Prop-First Approach:</span> удобная настройка через продуманные
			props
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Fully Modular:</span> ставьте только нужное — copy-paste, jsrepo
			или shadcn; Svelte Bits не единый npm-пакет
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">TypeScript + Tailwind:</span> современный стек, типизация и
			utility-first по умолчанию
		</li>
	</ul>

	<h4 class="docs-category-subtitle">Free For All</h4>

	<p class="docs-paragraph">
		Каждый компонент, который вы добавляете в проект, можно менять и расширять — вы видите весь код,
		а не только import.
	</p>

	<h4 class="docs-category-subtitle">Prop-First Approach</h4>

	<p class="docs-paragraph">
		Компоненты гибкие и настраиваемые: props позволяют менять внешний вид без постоянного
		редактирования исходников.
	</p>

	<h4 class="docs-category-subtitle">Fully Modular</h4>

	<p class="docs-paragraph">
		Svelte Bits — не классическая NPM-библиотека: компоненты можно добавить вручную,
		<a class="docs-link" href="/get-started/installation">через jsrepo или shadcn CLI</a>, без
		монолитной зависимости.
	</p>

	<h4 class="docs-category-subtitle">TypeScript + Tailwind</h4>

	<p class="docs-paragraph">
		Компоненты поставляются на TypeScript с Tailwind. Подключите в SvelteKit, настройте props и
		используйте.
	</p>

	<hr class="docs-separator" />

	<h3 class="docs-category-title">Производительность</h3>

	<p class="docs-paragraph dim">
		Мы стараемся оптимизировать компоненты, но при использовании Svelte Bits учитывайте:
	</p>

	<ul class="docs-list">
		<li class="docs-list-item">
			<span class="docs-highlight">Less Is More:</span> больше 2–3 компонентов на странице не
			рекомендуется — анимации могут перегрузить страницу и ухудшить UX
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Mobile Optimization:</span> на мобильных часть эффектов лучше
			отключить и заменить статичными заглушками
		</li>
		<li class="docs-list-item">
			<span class="docs-highlight">Test Thoroughly:</span> ваше устройство может быть мощным, но
			тестируйте на разных устройствах перед релизом
		</li>
	</ul>

	<div class="docs-button-bar">
		<a class="docs-button" href="/get-started/installation">
			Установка
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="5" y1="12" x2="19" y2="12" />
				<polyline points="12 5 19 12 12 19" />
			</svg>
		</a>
	</div>
</section>
