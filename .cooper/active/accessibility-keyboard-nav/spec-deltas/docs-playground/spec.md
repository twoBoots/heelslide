# Spec Delta: Documentation Playground (`docs-playground`)

## Added Requirements

+ ## Capability: Accessibility Demonstration & Verification
+
+ ### Requirement: Keyboard Navigation Showcase
+ The playground MUST demonstrate keyboard operation of the gesture gate.
+ - **GIVEN** a visitor on the playground
+ - **WHEN** the live demo is focused via `Tab`
+ - **THEN** a visible focus indicator MUST appear and the demo MUST be completable using only the documented key bindings.
+ - **GIVEN** a visitor operating the demo by keyboard
+ - **WHEN** progress advances
+ - **THEN** the playground MUST surface the current `aria-valuetext` and the most recent live-region announcement as visible text, so sighted visitors can observe what assistive technology receives.
+
+ ### Requirement: Accessible Fallback Mode Control
+ The configurator MUST expose the accessible fallback mode.
+ - **GIVEN** the configuration panel
+ - **WHEN** it is rendered
+ - **THEN** it MUST offer an `accessibleFallback` control covering `stepped` and `custom`.
+ - **GIVEN** a visitor changing the `accessibleFallback` control
+ - **WHEN** a mode is selected
+ - **THEN** the live demo MUST re-render in that mode and the generated code snippets MUST include the corresponding prop.
+
+ ### Requirement: Generated Snippet Accessibility Parity
+ Generated snippets MUST reflect accessibility configuration across every supported framework.
+ - **GIVEN** a non-default accessibility configuration
+ - **WHEN** React, Vue, and Svelte snippets are generated
+ - **THEN** each MUST include the accessibility props in that framework's idiomatic syntax.
+
+ ### Requirement: Documented Key Bindings
+ The playground MUST document how to operate the component by keyboard.
+ - **GIVEN** a visitor on the playground
+ - **WHEN** the accessibility section is viewed
+ - **THEN** it MUST tabulate every bound key and its action, and MUST state that `End` is intentionally unbound to prevent bypassing intent validation.
