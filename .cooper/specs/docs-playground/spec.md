# Capability Specification: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Live Slider Preview
The docs app MUST render a functional `<Heelslide />` security gate component responding in real time to touch and pointer drags.

- **GIVEN** the documentation app loaded in a browser
- **WHEN** the user drags the slider handle along the rectilinear track
- **THEN** progress MUST update continuously and trigger unlock state upon reaching the endpoint.

### Requirement: Dynamic Configuration Controls
The app MUST provide interactive controls adjusting heel count, tolerance, dimensions, and seed.

- **GIVEN** the control panel
- **WHEN** the user selects a different heel count (e.g., 1 to 4) or tolerance value
- **THEN** the track MUST regenerate immediately reflecting the chosen parameters.

### Requirement: Real-time Theme Customisation & Design Presets
The app MUST allow adjusting expanded CSS custom properties via control inputs and selecting curated design presets with instant visual feedback.

- **GIVEN** expanded theme controls in the playground (including track width, handle size, heel background/borders, target heel background/border, target goal background/border, heel typography, numbered heels toggle, and curated presets such as Clean Slate, Cyberpunk, Emerald Vault, High Contrast)
- **WHEN** any theme property, preset, or numbered heel option is selected/modified
- **THEN** the component styles MUST update instantly via the corresponding CSS custom properties.

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, Vue, and Svelte, adhering to framework-specific style conventions.

- **GIVEN** the Vue framework tab selected in code snippet generator
- **WHEN** the code snippet is rendered
- **THEN** it MUST encapsulate component CSS custom property configurations within an idiomatic `<style scoped>` block with `.security-gate` rather than inline `:style` object attributes, including `numberedHeels` and heel theming if enabled.
- **GIVEN** the Svelte framework tab selected in code snippet generator
- **WHEN** the code snippet is rendered
- **THEN** it MUST generate a Svelte 5 component with idiomatic `<style>` block encapsulation and lowercase event handlers (`onunlock`, `onreset`).

### Requirement: Static Production Bundling
The app MUST build into a standalone static bundle (`dist/`) suitable for GitHub Pages deployment under the repository subpath.

- **GIVEN** the `apps/docs` build command
- **WHEN** `npm run build` is executed
- **THEN** clean static HTML, CSS, and JS files MUST be emitted into `apps/docs/dist/`.

## Capability: Deterministic Visual Test Fixture Harness

### Requirement: Visual Regression Fixture Route
The documentation application MUST provide a dedicated visual regression testing fixture view accessible via URL parameter or route (`?fixture=visual`), bypassing playground layout controls to isolate component renders.

- **GIVEN** the docs application loaded with query parameter `?fixture=visual`
- **WHEN** rendered in an automated headless browser
- **THEN** it MUST display the deterministic visual test fixture container without navigation headers or interactive configuration panels.

### Requirement: Deterministic Seed & Animation Freezing
The visual fixture view MUST enforce deterministic rendering parameters, including fixed RNG seeds and zero CSS transitions or animations.

- **GIVEN** the visual test fixture loaded in a browser
- **WHEN** component instances mount
- **THEN** procedural track generation MUST use a deterministic pinned seed (`seed: 4242`), and CSS animations and transitions MUST be disabled to guarantee reproducible pixel captures.

### Requirement: Component State & Theming Fixture Selectors
The visual fixture MUST support rendering specific interaction states (`idle`, `active`, `unlocked`, `disabled`) and custom theme property overrides via query parameters (`&state=...`, `&theme=...`, `&heels=...`).

- **GIVEN** the visual fixture URL containing state parameters (e.g., `?fixture=visual&state=disabled` or `?fixture=visual&state=unlocked`)
- **WHEN** the page is rendered
- **THEN** the `<Heelslide />` component MUST mount directly in the requested state reflecting corresponding handle positions, visual indicators, or CSS variable overrides.

## Capability: Segmented Gesture Demonstration

### Requirement: Interactive Segmented Configurator Controls
The documentation playground MUST provide controls to toggle segmented multi-gesture mode and set optional checkpoint timeout.

- **GIVEN** the interactive configurator in `apps/docs`
- **WHEN** the user enables the "Segmented Mode" checkbox
- **THEN** the live preview component MUST switch to segmented multi-gesture behavior and visually guide the user to lift and re-engage at heels.
