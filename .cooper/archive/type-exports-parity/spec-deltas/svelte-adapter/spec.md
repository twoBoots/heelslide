# Spec Delta: Svelte 5 Adapter (`svelte-adapter`)

## Added Requirements

+ ### Capability: Comprehensive TypeScript Type Exports & Standalone Component Typing
+
+ #### Requirement: Core Geometry & Segment Type Re-exports
+ The package entrypoint MUST re-export core geometry, direction, and segment types.
+
+ - **GIVEN** a consumer importing from `@heelslide/svelte`
+ - **WHEN** accessing package type exports
+ - **THEN** `Bounds`, `Direction`, `Segment`, and `ProjectedPoint` MUST be exported directly without requiring direct `@heelslide/core` imports.
+
+ #### Requirement: Standalone Svelte Component Typing
+ The package entrypoint MUST export the `Heelslide` component typed explicitly as a Svelte 5 `Component<HeelslideProps>`.
+
+ - **GIVEN** an external consumer TypeScript project importing `Heelslide` from `@heelslide/svelte`
+ - **WHEN** compiling without ambient `*.svelte` module shims
+ - **THEN** TypeScript MUST successfully resolve the component type and provide typed props autocompletion without error.
