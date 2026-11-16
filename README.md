# Kolibri API

A minimal monorepo NestJS boilerplate using TypeScript and ESM.

## Getting Started

Requires Node.js 24+.

```sh
npm ci
cp .env.example .env
npm run start:dev
```

Application status: `GET http://localhost:3000/api/status`.
Set `APP_PORT` in `.env` to change the port.

Production:

```sh
npm run build
npm run start:prod
```

## Checks

```sh
npm test
npm run lint
npm run format:check
```

## Architecture

See [project architecture](.ai/architecture.md) for details.
