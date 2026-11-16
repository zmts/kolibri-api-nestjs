# General information about the project:

- Project name: **kolibri-api-nodejs**
- Language: **TypeScript**
- Runtime stack: **Node.js, Nest.js**

---

## Core principles: KISS & DRY

### KISS — Keep It Simple, Stupid

Choose the simplest solution that meets current requirements without compromising correctness, readability, security, reliability, or maintainability.

- Avoid unnecessary complexity, abstractions, architecture layers, design patterns, classes, interfaces, and factories.
- Introduce these structures only to solve a concrete problem.
- Follow project conventions. Reuse existing infrastructure and tools when sufficient.
- Do not implement features or abstractions for hypothetical future needs.
- Do not add unnecessary dependencies.
- Do not sacrifice code quality to reduce code length.

**Criterion:** Remove complexity if no required behavior or system property is lost.

### DRY — Don't Repeat Yourself

Keep each shared business rule, algorithm, validation, configuration, or definition in one authoritative location.

- Reuse existing implementations. Do not create independent copies of shared logic.
- Extract logic into functions, modules, or services only when it serves the same responsibility.
- Do not create abstractions solely because code fragments look similar.
- Keep responsibilities separate when they differ or can evolve independently.
- Avoid generalizations that increase complexity, coupling, or reduce readability.

**Criterion:** Changing one business rule must not require updating independent copies of that rule.

### Balance

- Prefer small, explicit implementations over premature generalization.
- Remove duplicated knowledge, not merely similar code.
- Introduce abstractions only when they solve a concrete problem and reduce overall complexity.
- Preserve existing behavior during refactoring unless changes are explicitly required.

## Code Quality

- If the `javascript-typescript-code-quality` skill is available in the current environment, apply it whenever implementing or modifying JavaScript/TypeScript code.
- If the `javascript-typescript-code-quality` skill is unavailable, proceed using the project's existing conventions.
- Do not duplicate code quality rules in `AGENTS.md`. Architectural rules belong in [`architecture.md`](.ai/architecture.md).

## Architecture

Architectural rules, layers, and dependency conventions for this NestJS project are defined in [`architecture.md`](.ai/architecture.md). Update that document when architectural boundaries or shared application contracts change.

Before modifying `.ai/architecture.md`, notify the user of the planned changes and explain why they are needed. This requirement also applies to documentation updates made as part of implementation or refactoring; never change the file silently.

Document detailed feature behavior and operational guides in `docs/` when needed. Keep `.ai/architecture.md` focused on architectural responsibilities and conventions rather than duplicating implementation details.
