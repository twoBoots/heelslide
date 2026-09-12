# Spec Delta: Vue Adapter (`vue-adapter`)

## Added Requirements

+ ### Requirement: Initial State Seeding Parity
+ The component MUST accept `initialState` and `initialProgress` props, matching the React
+ adapter, so that controlled consumers can seed a mounted gate from external state.
+
+ - **GIVEN** a component mounted with `initialState` and `initialProgress`
+ - **WHEN** it first renders
+ - **THEN** the exposed `state` and `progress` MUST reflect the supplied values.
+
+ - **GIVEN** a component mounted with `initialState: 'unlocked'`
+ - **WHEN** a subsequent gesture is rejected for trajectory deviation
+ - **THEN** the component MUST settle in `'idle'` with progress 0, and MUST NOT return to
+   `'unlocked'`.
