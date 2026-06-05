# studio_app

Internal studio UI built on Nuxt 3.

## Responsibility

`studio_app` is the internal web surface for studio/content workflows.

## Local run

```bash
npm install
npm run dev
```

App URL:

- [http://localhost:3002](http://localhost:3002)

## Environment

- [studio_app/.env.example](/Users/olegsemenov/Programming/curs/studio_app/.env.example)
- [studio_app/.env.local.example](/Users/olegsemenov/Programming/curs/studio_app/.env.local.example)

Key variables:

- `NUXT_AUTH_SERVICE_BASE_URL`
- `NUXT_AUTH_COOKIE_SECURE`
- `NUXT_COURSE_SERVICE_BASE_URL`
- `NUXT_PUBLIC_API_BASE_URL`
- `NUXT_PUBLIC_SITE_URL`

## Tests and quality

```bash
npm test
npm run lint
npm run format:check
```

## Build

```bash
npm run build
npm run start
```

## Auth onboarding

Studio staff users are created by backend invite flow.

- Invite link opens `/invite/accept?token=<token>`.
- Browser submits `POST /api/auth/invites/accept`.
- Nitro proxies to `auth_service` `POST /v1/auth/invites/accept`.
- On success, Studio stores auth cookies and redirects to `/`.

## Documentation

- [docs/ARCHITECTURE.md](/Users/olegsemenov/Programming/curs/studio_app/docs/ARCHITECTURE.md)
