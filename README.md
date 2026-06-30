<div align="center">
	<br>
	<br>
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="src/lib/assets/logo/svelte-bits-logo-black.svg">
    <source media="(prefers-color-scheme: dark)" srcset="src/lib/assets/logo/svelte-bits-logo.svg">
    <img src="src/lib/assets/logo/svelte-bits-logo-black.svg" alt="svelte-bits logo" width="600">
  </picture>
	<br>
	<br>
  <strong>Творческая библиотека анимированных Svelte-компонентов.</strong>
  <br />
  <sub>Выделяйтесь с помощью бесплатных настраиваемых анимаций для текста, фонов и UI.</sub>
	<br>
	<br>
  <a href="https://github.com/DavidHDev/svelte-bits/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/DavidHDev/svelte-bits"></a>
  <a href="https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-MIT+Commons_Clause-orange"></a>
  <br>
  <br>
  <a href="https://sveltebits.xyz/">Документация</a> · <a href="https://sveltebits.xyz/get-started/installation">Быстрый старт</a> · <a href="https://github.com/DavidHDev/react-bits">React Bits</a>
</div>

<br />

## Зачем Svelte Bits?

Svelte Bits помогает **быстрее собирать эффектные Svelte-интерфейсы**. Вместо того чтобы часами писать анимации с нуля, возьмите готовый компонент и настройте его под свой проект.

> **Анимация текста** · **Анимации** · **Компоненты** · **Фоны**

## Возможности

- **Паритет с React Bits** — Svelte-порт лендинга, документации и коллекции компонентов React Bits
- **Copy-paste компоненты** — каждый компонент — отдельный файл `.svelte`
- **TypeScript + Tailwind** — один сфокусированный вариант на компонент, без лишнего boilerplate
- **Настоящие анимационные стеки** — порты сохраняют исходные зависимости, шейдеры, физику и поведение
- **Полная настройка** — меняйте props или правьте исходник напрямую
- **Документация под Cloudflare** — сайт собирается через SvelteKit Cloudflare adapter

## Установка

Svelte Bits поддерживает ручное копирование, [jsrepo](https://www.jsrepo.dev/) или [shadcn CLI](https://ui.shadcn.com/docs/registry) с **прямыми HTTPS-URL** на каждый элемент реестра.

**jsrepo** (настройте один раз, затем добавляйте компоненты):

```bash
pnpm dlx jsrepo init https://sveltebits.xyz/r
pnpm dlx jsrepo add aurora
```

**shadcn** (`add` с URL `.json` нужного элемента):

```bash
pnpm dlx shadcn@latest add https://sveltebits.xyz/r/aurora.json
```

На странице каждого компонента указаны зависимости, props, пример использования и готовые команды установки. Подробнее — в [руководстве по установке](https://sveltebits.xyz/get-started/installation): npm/pnpm/Yarn/Bun и настройка MCP, если вы работаете с реестрами через [shadcn MCP server](https://ui.shadcn.com/docs/mcp).

## Локальная разработка

```bash
npm install
npm run dev
```

Сборка реестра и production-сайта:

```bash
npm run build
```

Проверка Svelte-диагностикой:

```bash
npm run check
```

## Деплой на Cloudflare

В репозитории используется `@sveltejs/adapter-cloudflare` в `svelte.config.js` и `wrangler.jsonc` в формате Worker.

Локальная сборка:

```bash
npm run build
```

Деплой через Wrangler:

```bash
npx wrangler deploy
```

Cloudflare-сборка попадает в `.svelte-kit/cloudflare`: точка входа Worker — `.svelte-kit/cloudflare/_worker.js`, статика отдаётся из той же директории через binding `ASSETS`.

При деплое через панель Cloudflare укажите:

| Параметр | Значение |
| -------- | -------- |
| Build command | `npm run build` |
| Build output directory | `.svelte-kit/cloudflare` |
| Node.js version | `20` или новее |

## Участие в разработке

Svelte Bits собирается постепенно на базе [React Bits](https://github.com/DavidHDev/react-bits). Порты компонентов должны максимально сохранять upstream-реализацию: зависимости, шейдеры, spring-конфиги, props и поведение.

## Мейнтейнер

**[David Haz](https://github.com/DavidHDev)** — автор и ведущий мейнтейнер

## Адаптация

**[Lxrdinsky](https://github.com/ahhglass)** — перевёл проект на русский язык и дополнил компонентами

## Благодарности

Svelte Bits — официальный Svelte-порт, вдохновлённый [React Bits](https://github.com/DavidHDev/react-bits). React Bits иногда опирается на публично доступные примеры кода, переработанные в полноценные настраиваемые компоненты.

## Лицензия

[MIT + Commons Clause](https://github.com/DavidHDev/svelte-bits/blob/main/LICENSE.md)
