# Technical Design: Haptic & Audio Feedback System

## Architecture Overview

The feedback architecture introduces a lightweight, zero-dependency feedback subsystem into `@heelslide/core`, which is then exposed and leveraged transparently through `@heelslide/react`, `@heelslide/vue`, and the documentation playground (`apps/docs`).

```text
packages/core/src/
├── index.ts          # Public exports (including feedback types & helpers)
├── types.ts          # EngineOptions, HapticOptions, SoundOptions, Event callbacks
├── feedback.ts       # Web Audio synthesizer & Web Vibration controller
├── machine.ts        # FSM triggering turn, reset, and unlock feedback
└── engine.ts         # Coordinates feedback lifecycle with engine options
```

---

## 1. Web Vibration API Integration (`navigator.vibrate`)

Haptic feedback communicates structural milestones through device vibration motors.

### Safe Browser Invocation
- Invocations are safely wrapped in feature-detection guards checking `typeof navigator !== 'undefined' && 'vibrate' in navigator`.
- In non-supporting environments (e.g., iOS Safari, desktop browsers, or headless test runners), vibration calls resolve to safe no-ops without throwing errors.
- Default vibration patterns:
  - **Turn (`heel`):** `15ms` single sharp tap.
  - **Reset (`error`):** `[40ms, 60ms, 40ms]` dual-pulse buzz.
  - **Unlock (`success`):** `[30ms, 50ms, 80ms]` affirmative rising buzz.

---

## 2. Web Audio API Synthesis Integration

Auditory cues are synthesized dynamically at runtime using browser-native Web Audio nodes.

### Zero-Asset Architecture
- Uses `AudioContext` (or legacy `webkitAudioContext`).
- Avoids all external asset requests (`.mp3`, `.wav`, `.ogg`), network latency, and bundling bloat.
- Cues are shaped using `OscillatorNode` paired with `GainNode` exponential decay envelopes to eliminate click/pop artifacts.

### Cue Specifications
1. **Turn Tick (`onTurn`):**
   - Waveform: Sine or triangle wave.
   - Frequency: `880 Hz` (A5).
   - Duration: `35ms`.
   - Gain Envelope: Attack `2ms` to peak volume (`0.15`), exponential decay to `0.001` over `33ms`.
2. **Reset Buzz (`onReset`):**
   - Waveform: Sawtooth or descending pitch glide.
   - Frequency: `180 Hz` descending to `110 Hz`.
   - Duration: `120ms`.
   - Gain Envelope: Peak volume (`0.25`), fast linear fade-out.
3. **Unlock Chime (`onUnlock`):**
   - Multi-tone ascending major triad arpeggio:
     - Note 1: `523.25 Hz` (C5) at offset `0ms` (duration `80ms`).
     - Note 2: `659.25 Hz` (E5) at offset `70ms` (duration `80ms`).
     - Note 3: `783.99 Hz` (G5) at offset `140ms` (duration `180ms` with soft resonant ring).
   - Gain Envelope: Warm bell envelope with soft exponential release.

### Autoplay Policy & AudioContext Lifecycle
- Modern browsers suspend `AudioContext` until the user interacts with the page.
- On the first gesture engagement (`pointerdown` / `startGesture`), the feedback controller checks if `audioCtx.state === 'suspended'` and invokes `audioCtx.resume()`.
- Supports explicit audio enablement or volume configuration.

---

## 3. Configuration Models & Interfaces

### `@heelslide/core/src/types.ts`

```typescript
export interface HapticPatterns {
  turn?: number | number[];
  reset?: number | number[];
  unlock?: number | number[];
}

export interface HapticOptions {
  enabled?: boolean;
  patterns?: HapticPatterns;
}

export interface SoundFrequencies {
  turn?: number;
  reset?: number;
  unlock?: number[];
}

export interface SoundOptions {
  enabled?: boolean;
  volume?: number; // Normalized [0..1], default 0.3
  frequencies?: SoundFrequencies;
}

export interface EngineOptions {
  tolerance?: number;
  generator?: GeneratorOptions;
  haptics?: boolean | HapticOptions;
  sound?: boolean | SoundOptions;
  onTurn?: (heelIndex: number) => void;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}
```

---

## 4. State Machine & Feedback Trigger Points

In `packages/core/src/machine.ts`:

1. **`update(point)` heel navigation:**
   - When `isAdvancingOnNext` is true (the handle crosses vertex boundary into next segment):
     ```typescript
     currentSegmentIndex += 1;
     feedbackController.triggerTurn();
     onTurn?.(currentSegmentIndex - 1);
     ```
2. **`triggerReset()`:**
   - When deviation exceeds tolerance or pointer is released prematurely:
     ```typescript
     feedbackController.triggerReset();
     onReset?.();
     ```
3. **`end()` unlock condition:**
   - When user successfully reaches the terminal coordinate:
     ```typescript
     feedbackController.triggerUnlock();
     onUnlock?.();
     ```

---

## 5. React & Vue Adapter Interfaces

### React Adapter (`@heelslide/react`)
- **`useHeelslide` Options:**
  - Inherits `haptics?: boolean | HapticOptions` and `sound?: boolean | SoundOptions`.
  - Accepts `onTurn?: (heelIndex: number) => void`.
- **`<Heelslide />` Component Props:**
  ```tsx
  <Heelslide
    haptics={true}
    sound={true}
    onTurn={(heelIndex) => console.log('Turned heel', heelIndex)}
    onUnlock={() => handleUnlock()}
  />
  ```

### Vue 3 Adapter (`@heelslide/vue`)
- **`useHeelslide` Composable Options:**
  - Accepts `haptics`, `sound`, and `onTurn`.
- **`<Heelslide />` Component Props & Emits:**
  - Props: `haptics: { type: [Boolean, Object], default: false }`, `sound: { type: [Boolean, Object], default: false }`, `onTurn: Function`.
  - Emits: `turn: [heelIndex: number]`.
  ```vue
  <Heelslide
    :haptics="true"
    :sound="true"
    @turn="(heelIndex) => onTurn(heelIndex)"
    @unlock="onUnlock"
  />
  ```

---

## 6. Playground Controls (`apps/docs`)

In `apps/docs/src/components/Controls.tsx` / `App.tsx`:
- Adds toggle controls in the interactive settings panel:
  - `Haptics`: checkbox/switch (enabled by default on touch-capable devices).
  - `Sound FX`: checkbox/switch (with a subtle volume slider or mute toggle).
- Audio test buttons allowing users to audition synthesized cues:
  - "Test Turn Tick"
  - "Test Reset Tone"
  - "Test Unlock Chime"
