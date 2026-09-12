# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ### Capability: Segmented Multi-Gesture Support
+
+ #### Requirement: Segmented Props Forwarding
+ `<Heelslide />` and `useHeelslide` MUST accept and pass `segmented`, `checkpointTimeoutMs`, and `onCheckpoint` configuration options to the core engine.
+
+ - **GIVEN** `<Heelslide segmented={true} checkpointTimeoutMs={5000} onCheckpoint={fn} />`
+ - **WHEN** the component mounts
+ - **THEN** the underlying `HeelslideEngine` MUST be initialized with segmented mode enabled, the specified timeout, and callback hook.
+
+ #### Requirement: Checkpoint DOM Data Attribute
+ The component root element MUST expose `data-state="checkpoint"` when resting at an intermediate heel checkpoint.
+
+ - **GIVEN** an active gesture reaching a heel in segmented mode and releasing pointer
+ - **WHEN** the engine transitions to `'checkpoint'` state
+ - **THEN** the container element MUST have attribute `data-state="checkpoint"`.
