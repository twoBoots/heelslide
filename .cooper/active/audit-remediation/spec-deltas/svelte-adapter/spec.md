# Spec Delta: Svelte Adapter (`svelte-adapter`)

## Added Requirements

+ ### Requirement: Initial State Seeding Parity
+ The component MUST accept `initialState` and `initialProgress` props, matching the React
+ adapter, so that controlled consumers can seed a mounted gate from external state.
+
+ - **GIVEN** a component mounted with `initialState` and `initialProgress`
+ - **WHEN** it first renders
+ - **THEN** the exposed `state` and `progress` MUST reflect the supplied values.

+ ### Requirement: Typed Children Snippet
+ The component MUST type its `children` prop as a Svelte `Snippet` rather than `any`, per the
+ TypeScript styleguide's prohibition on `any` in public API surfaces.
+
+ - **GIVEN** the exported `HeelslideProps` interface
+ - **WHEN** type-checked
+ - **THEN** `children` MUST be typed as an optional `Snippet` and MUST NOT be `any`.
