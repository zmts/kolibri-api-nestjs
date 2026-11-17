# API Architecture

## Status and Scope

`kolibri-api-nestjs` is a modular TypeScript API scaffold built on NestJS with
the Express adapter, Node.js 24+, and ECMAScript modules (ESM).

The workspace is a Nest CLI monorepo with one application and shared libraries.
It uses one root `package.json` and `package-lock.json`. Dependencies have exact
versions; `.npmrc` sets `save-exact=true` for future installations.

Add functionality as focused Nest modules. Keep the solution proportional to
current requirements; introduce additional layers only for a concrete need.

This document defines structural responsibilities, dependency direction, shared
infrastructure contracts, and development conventions. Describe feature behavior,
endpoint-specific payloads, and operational settings outside this document.

## Layer Map

```text
apps/api-main/
  src/
    main.ts                 HTTP bootstrap and global transport configuration
    app.module.ts           application composition and global providers
    modules/
      <module>/
        <module>.module.ts  provider ownership and explicit dependencies
        <module>.controller.ts
        <module>.service.ts
        types/              module-owned types and interfaces
        __tests__/          module-specific tests
  tsconfig.app.json         application compiler configuration

libs/
  config/src/               environment loading contracts and configuration factories
  core/src/
    api/                    response envelope, interceptor, filter, validation factory
    errors/                 AppError, ErrorCode, and error response model
  common/src/               shared functionality with a demonstrated common responsibility
```

Every application or library has a project entry in `nest-cli.json` and its own
TypeScript configuration extending the root `tsconfig.json`.

## Placement and Dependency Direction

- Application modules live in `apps/api-main/src/modules/<module>` and own their
  routes, services, DTOs, and types.
- `libs/config` owns environment access and typed configuration. It does not
  depend on application modules or implement feature behavior.
- `libs/core` owns reusable API infrastructure and application error conventions.
  It may depend on NestJS, Express types, and RxJS; it is not a framework-neutral
  domain layer.
- `libs/common` is reserved for shared functionality with a demonstrated common
  responsibility. Keep module-local code with its owner.
- Applications may import libraries. Libraries must not import application code,
  including through type-only imports, aliases, relative paths, or re-exports.
- Keep dependencies acyclic. Do not use `forwardRef()` as the default solution
  to unclear ownership or a circular module graph.
- Share a provider through its owning Nest module's explicit exports and the
  consuming module's imports. Do not reach into another module's private files
  or register its provider again to bypass that ownership.
- Extract code into a library when multiple consumers need the same stable
  responsibility. Similar shapes alone do not justify a shared abstraction.
- Libraries and feature modules expose their public API through `index.ts`
  when they have exports needed by external consumers. Export only the symbols
  intended for use outside that boundary.
- Consumers outside a library or feature module import through its public
  entry point rather than reaching into internal files.
- Within the same boundary, use direct local imports instead of importing
  through its own `index.ts` to avoid circular dependencies.
- An `index.ts` is not required in every nested directory. Add one only when
  that directory has a public API to expose.

## Composition Root and Lifecycle

`apps/api-main/src/app.module.ts` composes the application. It imports feature
modules, registers the global configuration module, and provides
`GlobalExceptionProvider` through Nest's `APP_FILTER` token.

`apps/api-main/src/main.ts` creates the application and configures:

- the typed `ConfigService<AllConfig>` used for the port and environment;
- CORS and the global `api` route prefix;
- `ApiResponseInterceptor` and `ValidationPipe`;
- shutdown hooks and the HTTP listener;
- Nest `Logger` messages for the listening URL and startup failures.

Controllers declare paths relative to `/api`; they must not repeat the global
prefix. Register new feature modules explicitly through Nest module imports.

Use constructor injection for services and other managed providers. Do not
construct dependency-bearing services with `new` in controllers. Application
lookup with `app.get(...)` belongs in bootstrap, not in ordinary services.
Plain response values such as `new ApiResponse(...)` are not managed providers.

Use Nest lifecycle hooks for future resources requiring initialization or
cleanup. Resource ownership and shutdown responsibility must remain explicit.

## Feature Modules and Local Types

A small module starts with its module, controller, service, and any necessary
types. Create additional DTO, helper, or service files only when they have a
concrete responsibility; empty directory trees are not required.

- Controllers connect HTTP parameters and validated DTOs to service operations,
  then return the public response. Keep operation implementations in services.
- Services own application operations and dependencies. They should return data or
  explicit results rather than depend on Express request or response objects.
- Keep module-owned interfaces and types in the module's `types/` directory,
  rather than declaring shared signatures inside a service implementation.
- Validation DTOs are runtime classes with validation decorators. A type-only
  interface cannot replace them for Nest validation.
- Keep module-local helpers beside their owner. Add a shared library only for
  actual reuse; do not add a service that only forwards another service call.

## HTTP Responses and Public Contracts

Controllers return `ApiResponse<T>` directly.

```ts
return new ApiResponse({ data: result });

return new ApiResponse({ list: items }, { pagination: { limit: 20, total: 100 } });
```

`ApiResponseInterceptor` applies response cookies, headers, and an optional HTTP
status, then serializes the public envelope:

```json
{
  "status": 200,
  "data": {}
}
```

A list response uses `list` instead of `data`; `pagination` and `meta` are
included when supplied. Do not populate both `data` and `list` for one response.
Transport cookie and header options are applied to the HTTP response and are
not exposed as fields in the JSON envelope.

Non-null successful values must be `ApiResponse` instances. Returning a raw
object or string causes the interceptor to reject the response. Null or
undefined results currently produce an empty response. Do not introduce direct
Express responses, streams, or redirects without deliberately accounting for
the global interceptor.

Map internal data to explicitly selected public fields before returning it.
Do not expose a future database entity, credentials, or an internal dependency
payload merely because it is serializable. Keep public transport types readable
and distinct from persistence or service implementation details.

## Input Validation and Errors

The global `ValidationPipe` uses `whitelist: true`,
`forbidNonWhitelisted: true`, and `validationExceptionFactory`. Unknown DTO
properties are rejected. Automatic DTO transformation is not enabled globally;
do not assume request strings are converted to typed values automatically.

Expected application failures use `AppError` and the basic `ErrorCode` entries
defined in `libs/core/src/errors`. Validation failures use `VALIDATION_ERROR`
and preserve field errors, including nested validation errors.

`GlobalExceptionFilter` converts failures into `ApiResponseError`:

- Nest `HttpException` instances retain their HTTP status;
- `AppError` adds its application code and optional error details;
- unexpected exceptions return status 500 and a generic client message;
- the error path retains `/api` and excludes the query string;
- server errors are logged without dumping request bodies or headers.

Do not duplicate error envelopes or generic catch-and-log blocks in each
controller. Add contextual handling only when an operation can recover or map a
specific dependency failure into a meaningful application error. Keep sensitive
details out of public error messages, `meta`, and `error` fields.

`AppError` is an extensible Nest exception. Preserve normal class inheritance;
do not reset instances to the base class prototype.

## Configuration and CORS

`ConfigModule.forRoot()` is registered once in `AppModule` with `isGlobal: true`,
`envFilePath: '.env'`, and `load: [appConfig]`. Run npm commands from the workspace
root so the relative `.env` path resolves consistently.

Keep raw environment reads in `libs/config`. Consumers use the typed
`ConfigService<AllConfig>` and `getOrThrow(..., { infer: true })` for required
configuration. Add new configuration fields to their owning factory and types,
and keep `.env.example` synchronized without adding secrets.

Configuration factories normalize environment values and call `validateConfig`
with their decorated configuration classes before returning configuration.
Invalid configuration must prevent application startup.
Predefined process environment values take precedence over matching `.env` values.
Keep variable names, defaults, allowed values, and precedence rules in the owning
configuration factory and `.env.example`, rather than duplicating them here.

Configure CORS centrally during bootstrap using typed configuration. Treat allowed
origins and credentials as transport policy; CORS does not replace authentication
or server-side authorization.

## ESM, Imports, and Build Contracts

- Preserve `type: module`, `module: ESNext`, `moduleResolution: Bundler`,
  decorator metadata, and strict TypeScript checking.
- Relative TypeScript source imports and re-exports omit file extensions.
  Nest CLI uses the SWC builder to compile `apps/` and `libs/` together,
  excluding `*.spec.ts` files and `__tests__/` directories.
- `npm run build` is the only build script. It runs `npm run typecheck`, clears
  `dist`, and emits one JavaScript file per production TypeScript source with
  the repository-relative directory structure. There are no separate
  application/library npm builds or bundled output.
- SWC resolves `@libs/*` aliases and adds `.js` extensions or `/index.js` to
  output imports during compilation. No post-compilation path processing is
  required. `.swcrc` sets the JavaScript target to ES2023; Nest CLI supplies
  ESM output, decorator metadata, source maps, and full import resolution.
- The application entry point is `dist/apps/api-main/src/main.js`; shared
  library files are under `dist/libs/<library>/src`. Each source has one
  compiled copy. The application TypeScript configuration extends the common
  root build configuration so build and Nest start use the same output paths.
- SWC does not check types. `npm run typecheck` uses `tsconfig.test.json` and
  `tsc --noEmit` to check application, library, test, and Vitest configuration
  types. Both `build` and `test` require this check to succeed before proceeding.
- Use `import type` for type-only dependencies. Nest-injected constructor tokens
  must remain available at runtime.
- Use the configured `@libs/common`, `@libs/config`, and `@libs/core` aliases and
  their public entry points according to the dependency rules above.
- `#package-json` is a native ESM alias declared in the root `package.json`
  `imports` field. Nest CLI assets copy that file to `dist/package.json` and
  watch it for changes. JSON value imports use `with { type: 'json' }`.
  Keep this alias out of TypeScript `paths`: SWC rewrites JSON path aliases
  with the JavaScript output extension.
- Vitest resolves library aliases through Vite's `resolve.tsconfigPaths` and
  the JSON alias through native package imports; do not duplicate mappings.
- `npm run start:api-main` starts existing compiled output without rebuilding.
  `start:dev:api-main` and `start:debug:api-main` use `tsc-watch` with
  `tsconfig.test.json` and `--noEmit` to continuously check application, library,
  test, and Vitest configuration types. Each check stops the previous server;
  type errors are printed and prevent startup until corrected.
- After a successful check, `tsc-watch` runs `nest start api-main` (with `--debug`
  for debugging). Nest CLI performs a complete SWC build of `apps/` and `libs/`
  and starts the server. Do not add `--watch` to this child command: `tsc-watch`
  alone owns change detection and server restarts.
- Verify compilation, watch mode, debug mode, and runtime together when changing
  aliases, compiler configuration, or output paths.

## Testing

The primary focus is service behavior and shared functions with independent
logic. Tests protect observable behavior rather than repeat the implementation.

### Location

- Place tests in a `__tests__` directory next to the code that owns them.
- Name test files `<name>.service.spec.ts` or `<name>.spec.ts`.
- Keep fixtures, mocks, and test helpers inside the corresponding `__tests__`.
- Production code must not import test files. Exclude tests from production
  builds.

Example:

```text
modules/example/
  example.module.ts
  example.controller.ts
  example.service.ts
  types/
  __tests__/
    example.service.spec.ts
```

### What to Test

- Test services through their public methods: inputs, results, expected errors,
  and significant side effects.
- Test shared functions separately when they contain independent calculations,
  transformations, or rules.
- Do not create separate repository tests.
- Do not create separate unit tests for configuration files, factories, or schemas.
  Validate configuration during startup rather than adding tests that repeat its
  declarations.
- Cover successful scenarios, boundary values, invalid inputs, and dependency
  failures.
- Simple delegation, getters, type declarations, and trivial wrappers do not
  require separate tests without a concrete regression risk.
- Test counts and coverage percentages do not replace checks of important
  scenarios.

### Dependencies and Isolation

- Replace external dependencies in service tests with mocks or stubs through
  existing Nest dependency injection points.
- Mock or stub repositories in service tests. Verify the service's decisions,
  results, and requested operations, not SQL queries or repository internals.
- A `TestingModule` is not required for every test: a service with explicit
  dependencies can be instantiated directly. Use Nest testing utilities when
  checking dependency injection or module behavior.
- Run pure functions for real.
- Ordinary unit tests must not require a running server, database, or external
  API.
- Control time and randomness where they affect the result. Tests must not
  depend on execution order.

### HTTP and Shared Infrastructure

Separate controller unit tests are unnecessary when a controller only delegates
to a service and returns `ApiResponse`.

Verify changes to global infrastructure with targeted HTTP integration tests:
routing and the `/api` prefix, DTO validation, response and error formats, HTTP
status codes, CORS, headers, and cookies.

These checks must use the application's actual handlers to detect errors in
their combined registration and behavior.

### Tooling

Run `npm test` from the workspace root. It first checks application, library,
and test types using `tsconfig.test.json` without emitting files, then runs
Vitest once. Both the application and test configuration use ESM. Vitest
transforms source test modules through Vite independently of the SWC
production build.

The root `vitest.config.ts` discovers `*.spec.ts` files inside `__tests__`
directories under both `apps/` and `libs/`. Tests use the Node environment and
explicit imports from `vitest`; test globals are not added to production types.
`vitest.setup.ts` loads `reflect-metadata` before test modules execute.

Library aliases in `tsconfig.json` use Vite's native tsconfig path resolution;
`#package-json` uses the package `imports` field. Production still builds through
Nest CLI; passing tests do not replace the production build.

Restore mocks and real timers after using them. The shared configuration enables
`restoreMocks`; tests that enable fake timers must restore real timers in their
cleanup. Service tests may use an in-memory `ConfigService` without loading
`.env` or starting the application.

The baseline checks remain `npm run build`, `npm run lint`, and
`npm run format:check`. The common build checks application and library sources
together. These checks do not replace behavior tests.

## Extension Criteria

Before adding a feature, verify that:

- its module has one clear responsibility and explicit Nest registration;
- its providers have one owner and use constructor injection;
- incoming data is validated and outgoing fields are intentionally selected;
- successful HTTP results use `ApiResponse` and expected failures use the shared
  exception handling;
- types remain with their owner and dependencies do not point from libraries
  back into applications;
- configuration and `.env.example` stay consistent;
- existing behavior is preserved and the affected runtime path is checked.

Add databases, authentication, queues, repositories, or migration workflows only
when a concrete feature requires them. Define their ownership and verification
then, rather than adopting unrelated infrastructure from another project.
