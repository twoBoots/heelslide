# TypeScript Style Guide

## General Rules
- Prefer `const` over `let`. Never use `var`.
- Enforce strict typing (`strict: true` in `tsconfig.json`, TypeScript v7).
- Avoid `any`. Use `unknown` with explicit type guards if a type is dynamic.
- Prefer explicit interface definitions for public APIs and types, and use named exports.
- Follow Oxc standards (`oxlint` rules and `oxc` code formatting).

## Core Architecture (@heelslide/core)
- Keep `@heelslide/core` strictly framework-agnostic with zero external runtime dependencies.
- Math, geometry, path generation, and state machine algorithms must be pure and fully deterministic when provided an optional seed.
- Use explicit return types on all exported functions and class methods.

## CSS Variable Conventions
- All customizable styles must consume namespaced CSS custom properties starting with `--heelslide-*`.
- Always provide sensible fallback values:
  ```css
  background-color: var(--heelslide-track-bg, #e2e8f0);
  ```

## Testing & Quality
- Enforce Test-Driven Development (TDD): Red -> Green -> Refactor.
- Maintain >80% code coverage across statements, branches, and functions using Vitest.
- Group unit tests logically using `describe` blocks and explicit `it('should ...')` assertions.
