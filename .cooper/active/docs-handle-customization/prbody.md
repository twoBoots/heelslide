## Summary

This pull request implements comprehensive documentation and interactive playground controls for handle customization and headless integration in `@heelslide` (Track `docs-handle-customization`).

### Background & Motivation
Previously, handle customization knobs—including CSS custom properties (`--heelslide-handle-*`), component children/slot APIs (`children` in React/Svelte and `#handle` scoped slot in Vue), and headless `useHeelslide` handle bindings—were implemented across the framework packages but lacked explicit documentation and interactive demonstration in the documentation portal (`apps/docs`).

### Key Changes
- **CSS Tokens Documentation**: Documented canonical handle custom properties in `DocsReference`:
  - `--heelslide-handle-size`
  - `--heelslide-handle-radius`
  - `--heelslide-handle-shadow`
  - `--heelslide-handle-checkpoint-shadow`
  - `--heelslide-handle-checkpoint-border-color`
- **Component Prop / Slot API**: Documented `children` prop (React, Svelte) and `#handle` scoped slot (Vue) with typed state payloads (`state: 'idle' | 'active' | 'checkpoint' | 'unlocked'`).
- **Dedicated Handle & Headless Guide Tab**: Added a new `"Handle & Headless"` navigation tab in `DocsReference` featuring:
  - Framework tabs (React, Vue, Svelte) with copyable code snippets showing custom nested icons (e.g., SVG lock icons) and CSS handle theming.
  - Headless usage guide highlighting `useHeelslide` and `getHandleProps({ id })` for fully custom markup and unstyled slider handles.
  - CSS Target Selectors table documenting `[data-heelslide-handle]`, `.heelslide-handle`, and `.heelslide-handle-circle`.
- **Interactive Playground Toggle**: Added a `"Custom Handle Icon"` switch in `ConfigPanel` that renders an inline SVG lock inside the handle in `Playground` and dynamically updates React, Vue, and Svelte generator snippets in real time.
- **Cooper SDD Sync**: Updated living capability specification in `.cooper/specs/docs-playground/spec.md`.

---

### Spec Delta Summary
- **Added (`+`)**:
  - `customHandleIcon` parameter support in multi-framework snippet generators (React children, Vue `#handle` slot, Svelte children).
  - Handle CSS custom properties documented in the CSS Reference table.
  - Children and `#handle` scoped slot documented in Component Props reference.
  - Dedicated "Handle & Headless" tab with copyable multi-framework examples, headless hook guide, and CSS selector reference.
  - Interactive "Custom Handle Icon" control in playground panel.
- **Removed (`-`)**: None.

---

### Phase Checkpoints
1. **Phase 1: Reference Tokens & Props Documentation** (`541e247`)
2. **Phase 2: Handle & Headless Dedicated Guide Tab** (`b025870`)
3. **Phase 3: Interactive Playground Toggle & Snippet Generator** (`5558005`)
4. **Phase 4: Verification, Sync & Polish** (`d99ac89`)

---

### Verification Matrix
- **Spec Delta Compliance**: Pass (100% of added requirements implemented and verified).
- **Styleguide Compliance**: Pass (TypeScript strict mode, React/Vue architecture, named exports, CSS conventions).
- **Quality Gates**:
  - `vitest run`: **481 / 481 tests passing** across 47 test files.
  - `tsc -b`: 0 errors.
  - `oxlint .`: 0 warnings, 0 errors.
  - Code Coverage: >80% threshold satisfied (98.4% overall).
