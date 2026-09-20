# Track Design: Handle Customization & Headless API Documentation (`docs-handle-customization`)

## Architecture & Component Breakdown

### 1. Documentation Reference Tabs (`apps/docs/src/components/DocsReference.tsx`)
Expand `DocsReference.tsx` with three view tabs:
1. **Component Props & API (`props`)**:
   - Add `children` prop documentation: type `React.ReactNode | Snippet`, default `undefined`, describing custom icons and elements rendered inside the handle.
   - Add `#handle` scoped slot documentation: type `Slot<{ position, progress, state }>`, default `undefined`, describing custom handle templating for Vue.
2. **CSS Custom Properties (`css`)**:
   - Add `--heelslide-handle-size`: default `32px`, category `Handle Tokens`.
   - Update `--heelslide-handle-radius`: default `18px`, category `Handle Tokens`.
   - Add `--heelslide-handle-shadow`: default `0 2px 8px rgba(0, 0, 0, 0.15)`, category `Handle Tokens`.
   - Add `--heelslide-handle-checkpoint-border-color`: default `#f59e0b`, category `Handle Tokens`.
   - Add `--heelslide-handle-checkpoint-shadow`: default `0 0 12px rgba(245, 158, 11, 0.6)`, category `Handle Tokens`.
3. **Handle & Headless Guide (`handle`)**:
   - A dedicated tab providing copyable multi-framework examples:
     - **Custom Handle Content & Icons**:
       - React: `<Heelslide><LockIcon /></Heelslide>`
       - Vue: `<template #handle="{ state, progress }"><LockIcon :state="state" /></template>`
       - Svelte: `<Heelslide><LockIcon /></Heelslide>`
     - **Headless Hook Composition**:
       - React: Using `useHeelslide` with `getHandleProps()` and `handlePosition` `{ x, y }` for completely headless render trees.
       - Svelte: Using `createHeelslide` store with `handlePosition`.
     - **CSS Selector Styling Reference**:
       - React: `[data-heelslide-handle]`
       - Vue / Svelte: `.heelslide-handle` (group wrapper) and `.heelslide-handle-circle` (SVG circle element).

### 2. Playground & Snippet Generator Integration (`apps/docs/src/utils/snippets.ts`)
- Add `customHandleIcon?: boolean` to `PlaygroundConfig`.
- When `customHandleIcon` is enabled in playground:
  - In `Playground.tsx`, render a custom lock icon child inside `<Heelslide>`.
  - In `snippets.ts`, generate framework-specific snippets demonstrating the children/slot usage:
    - React: `<Heelslide ...><LockIcon /></Heelslide>`
    - Vue: `<template #handle="{ state }"><LockIcon :unlocked="state === 'unlocked'" /></template>`
    - Svelte: `<Heelslide ...><LockIcon /></Heelslide>`
- Add a toggle in `ConfigPanel.tsx` under gate/interaction configuration for "Custom Handle Icon".

### 3. Visual & Style Consistency
- All new table entries, code blocks, and tabs in `DocsReference.tsx` adhere to existing card and theme token styles in `apps/docs/src/styles.css`.
- Ensure mobile responsiveness for the expanded reference tables and code containers.

## Testing Strategy
- **`DocsReference.test.tsx`**:
  - Test rendering of new handle props (`children`, `#handle`).
  - Test tab switching to the CSS tab and verify new handle CSS tokens (`--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, etc.).
  - Test tab switching to the new `Handle & Headless Guide` tab and verify code blocks for React, Vue, Svelte, and headless `useHeelslide`.
- **`generatorSnippet.test.ts`**:
  - Test code snippet generation when `customHandleIcon` is enabled across React, Vue, and Svelte.
