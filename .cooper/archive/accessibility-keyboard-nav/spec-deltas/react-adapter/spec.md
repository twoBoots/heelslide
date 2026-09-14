# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ## Capability: Keyboard Operation & Accessible Semantics
+
+ ### Requirement: Keyboard Navigation Bindings
+ The component MUST be fully operable by keyboard, satisfying WCAG 2.2 SC 2.1.1 (Keyboard).
+ - **GIVEN** a rendered, enabled `<Heelslide />` with `accessibleFallback="stepped"`
+ - **WHEN** the container receives focus and `ArrowRight` or `ArrowDown` is pressed
+ - **THEN** `stepForward()` MUST be invoked and progress MUST advance.
+ - **GIVEN** a focused component at intermediate progress
+ - **WHEN** `ArrowLeft` or `ArrowUp` is pressed
+ - **THEN** `stepBackward()` MUST be invoked and progress MUST decrement subject to engine flooring rules.
+ - **GIVEN** a focused component at any progress
+ - **WHEN** `Home` is pressed
+ - **THEN** the engine MUST reset to `idle` at progress 0.
+ - **GIVEN** a focused component at any progress
+ - **WHEN** `End` is pressed
+ - **THEN** no state change MUST occur; the key MUST remain unbound so a single keypress cannot bypass intent validation.
+ - **GIVEN** a focused component whose progress has reached the destination
+ - **WHEN** `Enter` or `Space` is pressed
+ - **THEN** the gate MUST unlock and `onUnlock` MUST fire.
+ - **GIVEN** a focused component with an in-progress keyboard gesture
+ - **WHEN** `Escape` is pressed
+ - **THEN** the gesture MUST cancel and focus MUST remain released, constituting no keyboard trap per SC 2.1.2.
+ - **GIVEN** a component rendered with `disabled`
+ - **WHEN** any bound key is pressed
+ - **THEN** no engine method MUST be invoked.
+ - **GIVEN** a focused, enabled component
+ - **WHEN** a bound arrow key is pressed
+ - **THEN** `preventDefault()` MUST be called so the page does not scroll, and MUST NOT be called for unbound keys.
+
+ ### Requirement: Slider Element Normalization
+ The `role="slider"` contract MUST be carried by the container element. This adapter already places it there; the requirement is stated so all three adapters are held to one normalised structure.
+ - **GIVEN** a rendered component
+ - **WHEN** the accessibility tree is inspected
+ - **THEN** exactly one element MUST carry `role="slider"`, and it MUST be the container carrying `data-heelslide-container`.
+ - **GIVEN** the handle element
+ - **WHEN** the component is rendered
+ - **THEN** the handle MUST remain presentational, carrying no `role="slider"`, no `tabindex`, and no `aria-value*` attributes.
+
+ ### Requirement: Complete ARIA Slider Semantics
+ The component MUST complete the `role="slider"` contract it already declares, satisfying WCAG 2.2 SC 4.1.2 (Name, Role, Value).
+ - **GIVEN** an enabled component
+ - **WHEN** it is rendered
+ - **THEN** the container MUST expose `tabindex="0"`, and `tabindex="-1"` when `disabled`. This adapter currently exposes no `tabindex` at all, leaving its declared slider unreachable by keyboard.
+ - **GIVEN** a component at any progress
+ - **WHEN** progress changes
+ - **THEN** `aria-valuetext` MUST update to a descriptive string stating percentage complete and the next required direction.
+ - **GIVEN** a component on an active segment
+ - **WHEN** the segment direction is `horizontal` or `vertical`
+ - **THEN** `aria-orientation` MUST reflect that direction.
+ - **GIVEN** an enabled component with `accessibleFallback="stepped"`
+ - **WHEN** it is rendered
+ - **THEN** `aria-keyshortcuts` MUST enumerate the bound keys and `aria-describedby` MUST reference a node containing the engine's accessible path description.
+
+ ### Requirement: Visible Focus Indicator
+ The slider MUST present a visible focus indicator when focused by keyboard, satisfying WCAG 2.2 SC 2.4.7 (Focus Visible).
+ - **GIVEN** an enabled component
+ - **WHEN** the slider receives keyboard focus
+ - **THEN** a visible focus indicator MUST be rendered on the container, themeable via a `--heelslide-focus-*` custom property with a built-in fallback.
+ - **GIVEN** the shipped stylesheet sets `outline: none` on `.heelslide-handle`
+ - **WHEN** the slider role moves to the container
+ - **THEN** that rule MUST NOT suppress the container's focus indicator.
+
+ ### Requirement: Polite Live Region Announcements
+ The component MUST announce progress to assistive technology without interrupting the user.
+ - **GIVEN** a component with `accessibleFallback="stepped"`
+ - **WHEN** it is rendered
+ - **THEN** it MUST render a visually hidden node carrying `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
+ - **GIVEN** a rendered live region
+ - **WHEN** the engine emits an announcement
+ - **THEN** the region's text content MUST update to the announcement message, and `aria-live` MUST NOT be `assertive`.
+ - **GIVEN** a consumer supplying an `onAnnouncement` callback prop
+ - **WHEN** the engine emits an announcement
+ - **THEN** the callback MUST receive the `AccessibleAnnouncement`.
+
+ ### Requirement: Accessible Fallback Modes
+ The adapter MUST support stepped and custom accessible fallback modes.
+ - **GIVEN** `accessibleFallback` is unset or `"stepped"`
+ - **WHEN** the component renders
+ - **THEN** key bindings and the live region MUST be active.
+ - **GIVEN** `accessibleFallback="custom"`
+ - **WHEN** the component renders
+ - **THEN** no key handlers MUST be bound and no live region MUST be rendered, leaving the host responsible for the accessible flow.
+
+ ### Requirement: Headless Stepping Primitives
+ The `useHeelslide` hook MUST expose stepping primitives for host-rendered accessible flows.
+ - **GIVEN** a consumer calling `useHeelslide`
+ - **WHEN** the hook returns
+ - **THEN** it MUST expose `stepForward`, `stepBackward`, `stepToNextHeel`, `steps`, and `description` alongside the existing return value.
+ - **GIVEN** returned stepping primitives
+ - **WHEN** they are referenced across renders
+ - **THEN** their identities MUST be stable, so consumers may use them in dependency arrays without re-subscription loops.
