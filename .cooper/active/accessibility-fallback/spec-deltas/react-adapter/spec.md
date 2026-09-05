# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ### Capability: Headless Hook (`useHeelslide`)
+
+ #### Requirement: Keyboard Event Prop Generation
+ The hook MUST provide keyboard event listeners in `getHandleProps()` and `getContainerProps()` to support non-pointer navigation.
+
+ - **GIVEN** an idle hook instance with keyboard navigation enabled
+ - **WHEN** `onKeyDown` receives an `ArrowRight` or `ArrowDown` event
+ - **THEN** progress MUST advance along the active segment and state MUST update reactively.
+
+ - **GIVEN** an active hook instance
+ - **WHEN** `onKeyDown` receives an `Escape` or `Home` event
+ - **THEN** state MUST reset to `idle` and progress MUST return to 0.
+
+ #### Requirement: Accessible Stepping Controls & Reactive Announcements
+ The hook MUST expose stepping methods and an announcement ref for live regions.
+
+ - **GIVEN** a mounted `useHeelslide` hook
+ - **WHEN** stepping or state changes occur
+ - **THEN** `announcement` MUST update with descriptive screen reader text and `stepForward`, `stepBackward`, `stepToNextHeel` MUST be callable directly.
+
+ #### Requirement: Accessible Fallback State Management
+ - **GIVEN** a mounted hook instance
+ - **WHEN** `openFallback()` is called
+ - **THEN** `isFallbackOpen` MUST transition to true and allow accessible non-gesture unlock via `confirmFallback()`.
+
+ ### Capability: Presentation Component (`<Heelslide />`)
+
+ #### Requirement: Comprehensive ARIA Slider Semantics
+ The component container MUST adhere to the WAI-ARIA Slider design pattern.
+
+ - **GIVEN** `<Heelslide />` rendered in the DOM
+ - **WHEN** mounted
+ - **THEN** the container element MUST have `tabindex="0"`, `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, dynamic `aria-valuenow`, and descriptive `aria-valuetext`.
+
+ #### Requirement: Integrated ARIA Live Region
+ The component MUST include a visually-hidden live region for real-time assistive announcements.
+
+ - **GIVEN** `<Heelslide />` mounted
+ - **WHEN** gesture progress, heel arrivals, or resets occur
+ - **THEN** the child element with `role="status"` and `aria-live="polite"` MUST be populated with the latest instruction text.
+
+ #### Requirement: Accessible Confirmation Dialog Fallback
+ The component MUST support an alternative accessible confirmation flow when `accessibleFallback="dialog"` is configured.
+
+ - **GIVEN** `<Heelslide accessibleFallback="dialog" />`
+ - **WHEN** the user activates the accessible fallback trigger (or presses Space/Enter on idle slider)
+ - **THEN** an accessible dialog (`role="dialog"`, `aria-modal="true"`) MUST open with confirm and cancel actions.
+
+ - **GIVEN** an open accessible confirmation dialog
+ - **WHEN** the confirm action is triggered
+ - **THEN** the dialog MUST close, state MUST transition to `unlocked`, and `onUnlock` MUST be called.
