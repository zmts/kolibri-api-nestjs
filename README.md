# Kolibri API

A minimal monorepo NestJS boilerplate using TypeScript and ESM, compiled with SWC.

## Getting Started

Requires Node.js 24+.

```sh
npm ci
cp .env.example .env
npm run start:dev:api-main
```

Application status: `GET http://localhost:3000/api/status`.
Set `APP_PORT` in `.env` to change the port.

Production:

```sh
npm run build
npm run start:api-main
```

## Checks

```sh
npm run typecheck
npm test
npm run lint
npm run format:check
```

## Architecture

See [project architecture](.ai/architecture.md) for details.
