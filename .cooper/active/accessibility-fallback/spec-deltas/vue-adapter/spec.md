# Spec Delta: Vue 3 Adapter (`vue-adapter`)

## Added Requirements

+ ### Capability: Headless Composable (`useHeelslide`)
+
+ #### Requirement: Keyboard Event Handling & Stepping Controls
+ The composable MUST expose methods for keyboard navigation and discrete stepping along rectilinear segments.
+
+ - **GIVEN** an active or idle composable instance
+ - **WHEN** `handleKeyDown(event)` is invoked with Arrow navigation keys
+ - **THEN** progress MUST update in discrete increments and `state` MUST update reactively.
+
+ - **GIVEN** a composable instance
+ - **WHEN** `stepForward()`, `stepBackward()`, or `stepToNextHeel()` is invoked
+ - **THEN** internal progress and handle position coordinates MUST advance or retreat accordingly.
+
+ #### Requirement: Reactive Announcement Ref
+ The composable MUST expose a reactive `announcement` ref reflecting the latest screen reader instruction.
+
+ - **GIVEN** a composable instance configured with accessibility options
+ - **WHEN** milestones (start, heel arrival, unlock, reset) occur
+ - **THEN** `announcement.value` MUST reactively update with descriptive accessibility text.
+
+ #### Requirement: Accessible Fallback State Primitives
+ The composable MUST provide reactive state and methods for accessible fallback flows.
+
+ - **GIVEN** a composable instance
+ - **WHEN** `openFallback()` is called
+ - **THEN** `isFallbackOpen.value` MUST become true.
+ - **WHEN** `confirmFallback()` is called
+ - **THEN** `isFallbackOpen.value` MUST become false, the engine MUST unlock, and `onUnlock` MUST be triggered.
+
+ ### Capability: Presentation Component (`<Heelslide />`)
+
+ #### Requirement: WAI-ARIA Slider Markup & Focusability
+ The component container MUST expose appropriate ARIA slider attributes and support standard keyboard focus.
+
+ - **GIVEN** `<Heelslide />` rendered in a Vue template
+ - **WHEN** the component is mounted
+ - **THEN** the root container MUST have `tabindex="0"`, `role="slider"`, dynamic `aria-valuenow`, and descriptive `aria-valuetext`.
+
+ #### Requirement: Live Region Screen Reader Announcer
+ The component MUST render an embedded visually-hidden live region for screen readers.
+
+ - **GIVEN** a mounted `<Heelslide />`
+ - **WHEN** progress changes or heels are reached
+ - **THEN** the live region element (`aria-live="polite"`, `role="status"`) MUST announce the update.
+
+ #### Requirement: Fallback Dialog Template & Custom Slots
+ The component MUST provide a built-in accessible dialog fallback and support custom template overrides via slots.
+
+ - **GIVEN** `<Heelslide accessibleFallback="dialog" />`
+ - **WHEN** the user activates the accessible fallback trigger or presses Space/Enter on idle slider
+ - **THEN** a focus-trapped confirmation dialog MUST appear.
+
+ - **GIVEN** a `<template #fallback="{ isOpen, confirm, cancel }">` slot provided by the consumer
+ - **WHEN** accessible fallback is engaged
+ - **THEN** the consumer's custom fallback markup MUST be rendered.
