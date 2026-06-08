# Studio App Architecture (Senior Pattern)

`studio_app` построен по layered/FSD-подходу поверх Nuxt 3.

## Слои

- `src/app`:
  - глобальные стили,
  - приложение/инициализация,
  - конфигурация окружения.
- `src/pages`:
  - route-level страницы,
  - композиция виджетов/фич.
- `src/features`:
  - изолированные бизнес-фичи,
  - структура внутри фичи: `model`, `api`, `ui`.
- `src/shared`:
  - переиспользуемый UI,
  - `lib` утилиты,
  - `api` thin-клиенты,
  - `types` контрактные типы.
- `src/server`:
  - Nitro API handlers.

## Правила зависимостей

- `pages` может импортировать из `shared`.
- `pages` может импортировать из `features`.
- `features` может импортировать из `shared`.
- `features` не импортирует другие `features` напрямую.
- `shared` не импортирует `pages`.
- `server` изолирован от UI-слоя.
- Общие типы DTO выносятся в `shared/types`.

## Папки

- `src/features/*/{model,api,ui}`: вертикальные срезы фич.
- `src/shared/ui/*`: атомарные компоненты.
- `src/shared/lib/*`: чистые функции (без side effects).
- `src/shared/lib/preferences/*`: i18n + theme preferences (`light|dark|system`).
- `src/shared/api/*`: обертки над `useFetch`.
- `src/shared/types/*`: DTO контракты backend read models.
- `tests/unit/*`: юнит-тесты по слоям shared/server.

## Backend contracts

- Studio UI ходит только в относительный `/api`.
- Nitro server routes проксируют backend-сервисы и добавляют auth/tracing headers.
- Course authoring/read model берется из `course_service` через:
  - `GET /api/admin/courses` -> `GET /v1/admin/courses`;
  - `GET /api/admin/courses/:courseId/authoring` -> `GET /v1/admin/courses/:courseId/authoring`.
- Course builder mutations stay backend-owned and are proxied through relative
  Studio routes:
  - `POST /api/admin/courses/:courseId/modules/:moduleId/archive`;
  - `POST /api/admin/courses/:courseId/modules/:moduleId/duplicate`;
  - `POST /api/admin/courses/:courseId/modules/reorder`;
  - `POST /api/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId/archive`;
  - `POST /api/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId/duplicate`;
  - `POST /api/admin/courses/:courseId/modules/:moduleId/lessons/reorder`.
- Course offer editing is proxied server-side:
  - `GET /api/admin/courses/:courseId/offers` ->
    `commercial_catalog_service` `GET /internal/v1/courses/:courseId/offers`;
  - `POST /api/admin/courses/:courseId/offers/default` ->
    `commercial_catalog_service` `POST /internal/v1/course-offers`;
  - before every offer proxy call, Studio checks
    `course_service` `GET /v1/admin/courses/:courseId/authoring`, so course
    authoring permissions remain owned by `course_service`;
  - offer reads are allowed for Studio users with course authoring access;
  - offer writes are admin-only because price/offer state is commercial policy,
    not teacher/content authoring.
- Studio invite onboarding:
  - `/invite/accept?token=<token>` is a public auth page;
  - `POST /api/auth/invites/accept` -> `POST /v1/auth/invites/accept`;
  - server proxy stores auth cookies after successful invite acceptance.
- Frontend после create/update/reorder должен делать refetch authoring endpoint, а не собирать состояние из нескольких raw objects.

## Why this

- предсказуемый рост проекта,
- легкий onboarding,
- контроль связности и границ слоя.
