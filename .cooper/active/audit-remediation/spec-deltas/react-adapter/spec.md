# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ### Requirement: Visual Progress Highlighting
+ The component MUST render a progress overlay path reflecting traversed length, matching the
+ requirement already carried by the Vue and Svelte adapter specifications. Its absence from
+ this specification mirrored its absence from the implementation.
+
+ - **GIVEN** an active gesture at progress `P`
+ - **WHEN** the component renders
+ - **THEN** an overlay progress path MUST visually reflect the exact traversed length up to
+   the current handle position.
+
+ - **GIVEN** a gesture that resets to progress 0
+ - **WHEN** the component renders
+ - **THEN** the overlay progress path MUST collapse to zero traversed length.

+ ### Requirement: Stable Headless Hook Identity
+ `useHeelslide` MUST tolerate option objects constructed inline at call time. The hook MUST
+ NOT rebuild its engine on every render merely because an options object has a new reference,
+ because doing so drives an unbounded render loop through the hook's own state
+ synchronisation effect.
+
+ - **GIVEN** a consumer calling `useHeelslide({ generator: { ... } })` with an inline object
+   literal recreated on each render
+ - **WHEN** the consuming component re-renders for any ordinary reason
+ - **THEN** the hook MUST settle after a bounded number of renders and MUST NOT re-enter
+   rendering indefinitely.
+
+ - **GIVEN** a consumer whose generator configuration values are unchanged between renders
+ - **WHEN** the component re-renders
+ - **THEN** the hook MUST preserve engine identity and MUST NOT regenerate the track.
+
+ - **GIVEN** a consumer who changes a generator configuration value
+ - **WHEN** the component re-renders
+ - **THEN** the hook MUST rebuild the engine and regenerate the track.

+ ### Requirement: Cross-Adapter Prop Parity
+ Component props MUST remain consistent with `@heelslide/vue` and `@heelslide/svelte` as
+ required by the adapter styleguides.
+
+ - **GIVEN** the `HeelslideProps` interface
+ - **WHEN** compared against the Vue and Svelte adapters
+ - **THEN** it MUST accept `bounds`, `track`, `initialState`, and `initialProgress` with
+   identical semantics.
+
+ - **GIVEN** a consumer passing the legacy `width` and `height` props
+ - **WHEN** the component renders
+ - **THEN** they MUST continue to be honoured as aliases for `bounds`, with `bounds` taking
+   precedence when both are supplied.

+ ### Requirement: Distributable Stylesheet
+ The package MUST ship a stylesheet exposing the `--heelslide-*` default cascade, exported as
+ `./style.css`, matching the Vue and Svelte adapters.
+
+ - **GIVEN** a consumer importing `@heelslide/react/style.css`
+ - **WHEN** the bundle resolves
+ - **THEN** the stylesheet MUST resolve and define the documented `--heelslide-*` defaults.
