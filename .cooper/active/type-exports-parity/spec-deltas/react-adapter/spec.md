# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ### Capability: Comprehensive TypeScript Type Exports
+
+ #### Requirement: Core Geometry Type Re-exports
+ The package entrypoint MUST re-export core geometry types needed to configure generator options and track bounds.
+
+ - **GIVEN** a consumer importing from `@heelslide/react`
+ - **WHEN** accessing package type exports
+ - **THEN** `Bounds` and `Direction` MUST be exported alongside existing core types without requiring direct `@heelslide/core` imports.
