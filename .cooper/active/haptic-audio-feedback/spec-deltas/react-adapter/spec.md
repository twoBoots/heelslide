# Spec Delta: React Adapter (`react-adapter`)

## Added Requirements

+ ## Capability: Headless Hook (`useHeelslide`)
+
+ ### Requirement: Haptic & Audio Hook Configuration
+ The hook MUST accept haptic and audio feedback configuration options and forward them to the underlying engine.
+
+ - **GIVEN** `useHeelslide({ haptics: true, sound: true })`
+ - **WHEN** gestures advance across heels, reset, or unlock
+ - **THEN** tactile vibrations and synthesized audio cues MUST trigger in accordance with engine specifications.
+
+ ### Requirement: Turn Callback Support
+ - **GIVEN** `useHeelslide({ onTurn: fn })`
+ - **WHEN** a heel vertex is navigated during active dragging
+ - **THEN** `onTurn(heelIndex)` MUST be invoked with the completed heel index.
+
+ ## Capability: Presentation Component (`<Heelslide />`)
+
+ ### Requirement: Feedback Component Props
+ `<Heelslide />` MUST expose `haptics`, `sound`, and `onTurn` as first-class component props.
+
+ - **GIVEN** `<Heelslide haptics={true} sound={{ volume: 0.5 }} onTurn={handleTurn} />`
+ - **WHEN** pointer interactions occur on the component
+ - **THEN** feedback triggers and turn callbacks MUST be executed without requiring custom hook orchestration.
