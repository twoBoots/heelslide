# Spec Delta: CI Pipeline (`ci-pipeline`)

## Added Requirements

+ ## Capability: Keyboard Accessibility Verification
+
+ ### Requirement: Real-Browser Keyboard End-to-End Gate
+ CI MUST verify keyboard operability in real browsers, not only in simulated DOM.
+ - **GIVEN** a pull request targeting `main`
+ - **WHEN** the Playwright job runs
+ - **THEN** it MUST execute keyboard navigation specs driving real key events across the existing Chromium, WebKit mobile, and Firefox matrix.
+ - **GIVEN** the keyboard specs
+ - **WHEN** they execute
+ - **THEN** they MUST assert full traversal to unlock by keyboard alone, that `Escape` releases focus without trapping it, and that `Tab` order reaches the component.
+ - **GIVEN** a regression that removes a key binding or focusability
+ - **WHEN** CI runs
+ - **THEN** the keyboard gate MUST fail the build.
+ - **GIVEN** the keyboard spec file is renamed, moved, or deleted
+ - **WHEN** the Playwright gate runs
+ - **THEN** the gate MUST fail rather than degrade into a passing skip, consistent with the existing prohibition on gates that pass when their script is missing.

## Preserved Behaviour

+ ### Requirement: Visual Regression Baseline Stability
+ Accessibility changes MUST NOT alter rendered output.
+ - **GIVEN** the accessibility changes in this track
+ - **WHEN** the Playwright visual regression suite runs
+ - **THEN** existing baseline snapshots MUST pass unchanged, since the live region is visually hidden and focusability paints nothing by itself.
+ - **GIVEN** a baseline snapshot diff arising from this track
+ - **WHEN** it is observed
+ - **THEN** it MUST be treated as a genuine visual regression rather than an expected baseline update.
