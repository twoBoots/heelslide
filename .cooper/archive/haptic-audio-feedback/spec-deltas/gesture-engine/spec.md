# Spec Delta: Gesture Engine (`gesture-engine`)

## Added Requirements

+ ## Capability: Gesture Tracking & Tolerance Enforcement
+
+ ### Requirement: Heel Navigation Event Notification (`onTurn`)
+ The engine MUST emit an `onTurn` callback whenever a gesture successfully advances past a heel corner vertex onto a new segment.
+
+ - **GIVEN** an active gesture tracking segment `K`
+ - **WHEN** pointer coordinates reach within vertex tolerance of a heel corner and advance onto segment `K+1`
+ - **THEN** the engine MUST invoke the `onTurn(heelIndex)` callback passing the zero-indexed index of the navigated heel.
+
+ ### Requirement: Built-in Haptic Feedback Triggers
+ When enabled, the engine MUST trigger haptic vibration pulses via the Web Vibration API at gesture state transitions and heel turns.
+
+ - **GIVEN** haptics enabled in engine configuration (`haptics: true` or `{ enabled: true }`)
+ - **WHEN** a heel corner is negotiated (`onTurn`)
+ - **THEN** `navigator.vibrate` MUST be invoked with the configured turn pattern (default: `15ms`).
+ - **GIVEN** haptics enabled
+ - **WHEN** a gesture resets due to deviation or premature release (`onReset`)
+ - **THEN** `navigator.vibrate` MUST be invoked with the configured reset pattern (default: `[40, 60, 40]`).
+ - **GIVEN** haptics enabled
+ - **WHEN** a gesture successfully completes (`onUnlock`)
+ - **THEN** `navigator.vibrate` MUST be invoked with the configured unlock pattern (default: `[30, 50, 80]`).
+ - **GIVEN** an environment where `navigator.vibrate` is unavailable or throws an error
+ - **WHEN** haptic triggers fire
+ - **THEN** the engine MUST degrade silently without throwing exceptions or interrupting gesture tracking.
+
+ ### Requirement: Built-in Synthesized Audio Cues
+ When enabled, the engine MUST synthesize auditory micro-cues via the Web Audio API without external audio file assets.
+
+ - **GIVEN** sound enabled in engine configuration (`sound: true` or `{ enabled: true }`)
+ - **WHEN** a heel corner is navigated
+ - **THEN** a short, high-frequency audio click MUST be synthesized and played through `AudioContext`.
+ - **GIVEN** sound enabled
+ - **WHEN** a gesture resets
+ - **THEN** a low-frequency error tone MUST be synthesized and played through `AudioContext`.
+ - **GIVEN** sound enabled
+ - **WHEN** a gesture unlocks
+ - **THEN** an ascending multi-tone harmonic chime MUST be synthesized and played through `AudioContext`.
+ - **GIVEN** a browser requiring user activation for Web Audio
+ - **WHEN** the first gesture starts (`startGesture`)
+ - **THEN** the engine MUST resume any suspended `AudioContext`.
+
+ ### Requirement: Feedback Configuration & Override
+ - **GIVEN** custom options passed to `HeelslideEngine`
+ - **WHEN** `haptics` or `sound` configurations provide custom patterns, volumes, or frequencies
+ - **THEN** the engine MUST apply custom parameters overriding system defaults.
