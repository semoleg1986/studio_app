# studio_app (Nuxt 3)

Минимальный frontend на Vue + Nitro.

## Архитектурный паттерн

- `src/app`: глобальная инициализация/стили.
- `src/pages`: route-страницы.
- `src/features`: бизнес-фичи (`model/api/ui`).
- `src/shared`: UI, lib, api, types.
- `src/server`: Nitro handlers.

Подробно: `docs/ARCHITECTURE.md`.

## UI Preferences

- Переключатель языка и темы находится на странице `/settings`.
- Footer содержит ссылку на настройки.
- Год в footer подставляется динамически.

## PWA и SEO

- `manifest.webmanifest` и PWA-иконки: `public/manifest.webmanifest`, `public/icons/*`.
- SEO/PWA meta подключены глобально в `src/app.vue`.
- `robots.txt` отдается как `Disallow: /` (приложение закрыто от индексации).
- Meta robots/googlebot: `noindex, nofollow, noarchive, nosnippet`.

## Локальный запуск
```bash
npm install
npm run dev
```

Откроется на `http://localhost:3002`.

## Тесты
```bash
npm test
```

## Lint и Format
```bash
npm run lint
npm run format:check
```

Автоисправление:
```bash
npm run lint:fix
npm run format
```

## Docker
```bash
docker compose -f docker-compose.yml up -d --build
```
