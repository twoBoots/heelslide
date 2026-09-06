# Spec Delta: Vue 3 Adapter (`vue-adapter`)

## Added Requirements

+ ## Capability: Headless Composable (`useHeelslide`)
+
+ ### Requirement: Feedback Composable Options
+ The composable MUST support `haptics`, `sound`, and `onTurn` options in its initialization arguments.
+
+ - **GIVEN** `useHeelslide({ haptics: true, sound: true, onTurn: handleTurn })`
+ - **WHEN** gesture tracking navigates heels or triggers state changes
+ - **THEN** feedback effects MUST execute and the `onTurn` callback MUST be invoked.
+
+ ## Capability: Presentation Component (`<Heelslide />`)
+
+ ### Requirement: Dual Feedback Props and Emits Support
+ The component MUST expose `haptics`, `sound`, and `onTurn` props alongside a `@turn` emit.
+
+ - **GIVEN** `<Heelslide :haptics="true" :sound="true" @turn="onTurn" :onTurn="propTurn" />`
+ - **WHEN** a heel vertex is crossed
+ - **THEN** both the `@turn` event MUST be emitted with the heel index and the `:onTurn` callback MUST be invoked.
+ - **WHEN** unlock or reset conditions occur
+ - **THEN** audio and haptic feedback cues MUST execute according to configured options.
