# Proposal: Monorepo Scaffolding & Core Gesture Engine

## Problem & Intent
Standard slide-to-unlock patterns use linear 1D swipes that are vulnerable to accidental pocket brushes and unintentional touches. Critical or destructive operations require deliberate, verified user confirmation.

This track establishes the monorepo workspace infrastructure and implements `@heelslide/core`: a framework-agnostic engine that procedurally generates 2D rectilinear tracks containing 90-degree directional changes ("heels") and validates touch tracing along the path in real time.

## Scope Guardrails

### In-Scope (MVP Intent)
- Root monorepo workspace setup (`packages/*`, `apps/*`, TypeScript v7, Oxc lint/format configs, Vitest workspace).
- `@heelslide/core` package skeleton with build scripts emitting ESM, CJS, and `.d.ts`.
- Rectilinear 2D path generator producing non-self-intersecting tracks with configurable heel counts (`heels: number | { min: number, max: number }`).
- Gesture state machine (`idle`, `active`, `unlocked`, `reset`).
- Trajectory tolerance validation and immediate origin reset on release, cancel, or deviation.
- Vitest unit test suite enforcing >80% branch, line, and function coverage.

### Out-of-Scope
- React component wrapper (`@heelslide/react`) — deferred to dedicated track.
- Vue component wrapper (`@heelslide/vue`) — deferred to dedicated track.
- Interactive documentation site and live demo app (`apps/docs`) — deferred to follow-up track.
- Visual regression tests with Playwright — introduced alongside UI component packages.
