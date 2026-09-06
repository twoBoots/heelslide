# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Real-time Theme Customisation & Design Presets
The app MUST allow adjusting expanded CSS custom properties via control inputs and selecting curated design presets with instant visual feedback.

- - **GIVEN** theme color inputs in the playground
- - **WHEN** a custom color is selected
- - **THEN** the component styles MUST update instantly via inline CSS variables.
+ - **GIVEN** expanded theme controls in the playground (including track width, handle size, heel background/borders, target heel background/border, target goal background/border, heel typography, numbered heels toggle, and curated presets such as Clean Slate, Cyberpunk, Emerald Vault, High Contrast)
+ - **WHEN** any theme property, preset, or numbered heel option is selected/modified
+ - **THEN** the component styles MUST update instantly via the corresponding CSS custom properties.

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, and Vue, adhering to framework-specific style conventions.

- - **GIVEN** selected playground options
- - **WHEN** switching framework tabs (React, Vue, Core)
- - **THEN** the displayed snippet MUST reflect the active heel count, tolerance, and event handlers.
+ - **GIVEN** the Vue framework tab selected in code snippet generator
+ - **WHEN** the code snippet is rendered
+ - **THEN** it MUST encapsulate component CSS custom property configurations within an idiomatic `<style scoped>` block with `.security-gate` rather than inline `:style` object attributes, including `numberedHeels` and heel theming if enabled.
