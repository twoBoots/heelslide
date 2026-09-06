# Proposal: Haptic & Audio Feedback System

## Problem & Intent

The core Heelslide gesture security mechanism relies on navigating a 2D rectilinear track with 90-degree directional changes ("heels"). While visual cues (path rendering, color transitions, progress fill) show user trajectory, touch-screen interactions inherently lack the physical, tactile resistance and auditory confirmation of physical toggles, keys, and tumbler locks.

Without multi-sensory feedback:
1. Users may not realize they successfully rounded a 90-degree heel corner, causing hesitation or accidental trajectory deviation.
2. When a gesture fails due to tolerance deviation or premature finger release, the sudden visual reset can feel abrupt or confusing without an accompanying haptic error pulse and auditory cue.
3. Successful completion ("unlock") lacks the satisfying physical confirmation and reward characteristic of premium mobile user experiences.

This track introduces a built-in, zero-dependency **Haptic & Audio Feedback System** across `@heelslide/core`, `@heelslide/react`, and `@heelslide/vue`. By integrating the Web Vibration API (`navigator.vibrate`) and synthesizing micro-audio cues in real time via the Web Audio API (`AudioContext`), Heelslide provides immediate physical and auditory confirmation at every key gesture milestone without external media assets or network latency.

---

## User Feedback Benefits

- **Tactile Turn Clicks (`onTurn`):** A sharp, light haptic tick (10–15ms) and high-frequency synthesized audio click when the user cleanly rounds a 90-degree corner, confirming segment advancement.
- **Error Rejection Cue (`onReset`):** A distinct double-pulse haptic buzz and low-frequency negative tone when the pointer deviates beyond tolerance or drops before completion, instantly signaling that the gesture was cancelled.
- **Rewarding Unlock Confirmation (`onUnlock`):** A smooth ascending multi-tone harmonic chime paired with an affirmative haptic pulse upon reaching the final destination, confirming successful verification.
- **Accessibility & Multi-Sensory Reinforcement:** Users with low vision gain immediate non-visual awareness of track navigation, segment completion, and unlock status.

---

## Mobile & Browser Compatibility

- **Web Vibration API (`navigator.vibrate`):**
  - Universally supported on Android mobile browsers (Chrome, Firefox, Edge, Opera, Samsung Internet).
  - Gracefully degrades silently to a no-op on platforms without vibration hardware or browser support (e.g. desktop browsers, iOS Safari).
  - Handles browser permissions and user activation requirements seamlessly without throwing runtime errors.

- **Web Audio API (`AudioContext` / `webkitAudioContext`):**
  - Full cross-platform support across iOS Safari, Android browsers, and all major desktop platforms.
  - Zero external asset dependencies: all tones are synthesized dynamically via oscillator nodes (`OscillatorNode`) and gain envelopes (`GainNode`).
  - Strict compliance with browser autoplay policies by initializing or resuming the audio context upon the initial user gesture (`pointerdown`).

---

## Scope Guardrails

### In-Scope

1. **Feedback Subsystem in `@heelslide/core`:**
   - Feedback manager module (`feedback.ts`) providing Web Vibration and Web Audio synthesis logic.
   - Configurable options: `haptics: boolean | HapticOptions`, `sound: boolean | SoundOptions`.
   - Event trigger integration within `GestureStateMachine` and `HeelslideEngine` for `turn`, `reset`, and `unlock`.
   - Custom pattern overrides for vibration durations and tone frequencies.
2. **React Adapter Integration (`@heelslide/react`):**
   - Support for `haptics` and `sound` options in `useHeelslide`.
   - Prop passthrough and callback bindings in `<Heelslide />` (`haptics`, `sound`, `onTurn`).
3. **Vue 3 Adapter Integration (`@heelslide/vue`):**
   - Support for `haptics` and `sound` options in `useHeelslide` composable.
   - Props (`haptics`, `sound`), callbacks (`onTurn`), and Vue emits (`@turn`) in `<Heelslide />` component.
4. **Documentation & Playground Integration (`apps/docs`):**
   - Interactive control switches for Haptics and Audio in the playground UI.
   - Live demonstration verifying auditory and tactile feedback during interactive drags.
5. **Comprehensive Test Suite:**
   - Unit and integration tests mocking `navigator.vibrate` and `AudioContext` to verify correct timing, pattern invocation, and error handling.
   - Maintaining >80% branch, statement, and function coverage across all modified packages.

### Out-of-Scope

- Loading external audio files (e.g., MP3, WAV, OGG) or configuring remote asset CDN URLs. All sound must remain 100% procedurally synthesized micro-audio.
- Gamepad Vibration API / hardware game controller triggers.
- Complex custom polyphonic audio compositions or speech synthesis.
