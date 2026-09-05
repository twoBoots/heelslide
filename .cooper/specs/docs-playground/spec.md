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

### Requirement: Real-time Theme Customisation
The app MUST allow adjusting CSS custom properties (`--heelslide-*`) via color pickers or presets with instant visual feedback.

- **GIVEN** theme color inputs in the playground
- **WHEN** a custom color is selected
- **THEN** the component styles MUST update instantly via inline CSS variables.

### Requirement: Multi-Framework Code Snippets
The app MUST generate and display copyable code examples matching the current playground parameters across Vanilla JS/TS, React, and Vue.

- **GIVEN** selected playground options
- **WHEN** switching framework tabs (React, Vue, Core)
- **THEN** the displayed snippet MUST reflect the active heel count, tolerance, and event handlers.

### Requirement: Static Production Bundling
The app MUST build into a standalone static bundle (`dist/`) suitable for GitHub Pages deployment under the repository subpath.

- **GIVEN** the `apps/docs` build command
- **WHEN** `npm run build` is executed
- **THEN** clean static HTML, CSS, and JS files MUST be emitted into `apps/docs/dist/`.
