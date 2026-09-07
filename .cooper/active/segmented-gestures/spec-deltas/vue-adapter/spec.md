# Spec Delta: Vue Adapter (`vue-adapter`)

## Added Requirements

+ ### Capability: Segmented Multi-Gesture Support
+
+ #### Requirement: Segmented Props & Emits
+ The Vue `<Heelslide />` component and composable MUST support `segmented` and `checkpointTimeoutMs` props and emit `checkpoint` events.
+
+ - **GIVEN** `<Heelslide :segmented="true" :checkpoint-timeout-ms="3000" @checkpoint="onCheckpoint" />`
+ - **WHEN** mounted and interacted with
+ - **THEN** segmented behavior MUST be enforced and the `checkpoint` event emitted upon reaching and releasing at heel vertices.
+
+ #### Requirement: Checkpoint State Synchronization
+ - **GIVEN** an active gesture pausing at a heel in segmented mode
+ - **WHEN** pointer release occurs
+ - **THEN** the root container element MUST reflect `data-state="checkpoint"`.
