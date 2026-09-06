# Spec Delta: Documentation & Playground (`docs-playground`)

## Added Requirements

+ ### Capability: Deterministic Visual Test Fixture Harness
+
+ #### Requirement: Visual Regression Fixture Route
+ The documentation application MUST provide a dedicated visual regression testing fixture view accessible via URL parameter or route (`?fixture=visual`), bypassing playground layout controls to isolate component renders.
+
+ - **GIVEN** the docs application loaded with query parameter `?fixture=visual`
+ - **WHEN** rendered in an automated headless browser
+ - **THEN** it MUST display the deterministic visual test fixture container without navigation headers or interactive configuration panels.
+
+ #### Requirement: Deterministic Seed & Animation Freezing
+ The visual fixture view MUST enforce deterministic rendering parameters, including fixed RNG seeds and zero CSS transitions or animations.
+
+ - **GIVEN** the visual test fixture loaded in a browser
+ - **WHEN** component instances mount
+ - **THEN** procedural track generation MUST use a deterministic pinned seed (`seed: 4242`), and CSS animations and transitions MUST be disabled to guarantee reproducible pixel captures.
+
+ #### Requirement: Component State & Theming Fixture Selectors
+ The visual fixture MUST support rendering specific interaction states (`idle`, `active`, `unlocked`, `disabled`) and custom theme property overrides via query parameters (`&state=...`, `&theme=...`, `&heels=...`).
+
+ - **GIVEN** the visual fixture URL containing state parameters (e.g., `?fixture=visual&state=disabled` or `?fixture=visual&state=unlocked`)
+ - **WHEN** the page is rendered
+ - **THEN** the `<Heelslide />` component MUST mount directly in the requested state reflecting corresponding handle positions, visual indicators, or CSS variable overrides.
