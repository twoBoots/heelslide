# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Real-time Theme Customisation
The app MUST allow adjusting expanded CSS custom properties via control inputs with instant visual feedback.

- - **GIVEN** theme color inputs in the playground
- - **WHEN** a custom color is selected
- - **THEN** the component styles MUST update instantly via inline CSS variables.
+ - **GIVEN** expanded theme controls in the playground (including track width, slider border color, and slider background color)
+ - **WHEN** any theme property is modified
+ - **THEN** the component styles MUST update instantly via the corresponding CSS custom properties.

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, and Vue, adhering to framework-specific style conventions.

- - **GIVEN** selected playground options
- - **WHEN** switching framework tabs (React, Vue, Core)
- - **THEN** the displayed snippet MUST reflect the active heel count, tolerance, and event handlers.
+ - **GIVEN** the Vue framework tab selected in code snippet generator
+ - **WHEN** the code snippet is rendered
+ - **THEN** it MUST encapsulate component CSS custom property configurations within an idiomatic `<style scoped>` block instead of inline `:style` object attributes.
