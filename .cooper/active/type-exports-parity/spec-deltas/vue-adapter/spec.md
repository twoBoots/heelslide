# Spec Delta: Vue 3 Adapter (`vue-adapter`)

## Added Requirements

+ ### Capability: Self-Contained TypeScript Component Declarations
+
+ #### Requirement: Standalone Component Typing
+ The package entrypoint MUST export the `Heelslide` component typed explicitly as a Vue 3 `DefineComponent` with `HeelslideProps` and `HeelslideEmits`.
+
+ - **GIVEN** an external consumer TypeScript project importing `Heelslide` from `@heelslide/vue`
+ - **WHEN** compiling without ambient `*.vue` module shims
+ - **THEN** TypeScript MUST successfully resolve the component type and provide typed props and emits autocompletion without error.
