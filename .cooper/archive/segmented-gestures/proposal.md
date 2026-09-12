# Proposal: Segmented Multi-Gesture Checkpoints

## Motivation & Rationale
Currently, Heelslide requires completing the entire rectilinear path from origin to destination in a single, uninterrupted continuous gesture. While this effectively prevents accidental single swipes and pocket triggers, certain high-consequence operations (financial transactions, infrastructure teardown, medical device triggers) benefit from an even higher degree of deliberate human engagement: **segmented multi-gesture verification**.

In segmented mode, every 90-degree turn ("heel") acts as a discrete physical checkpoint. The user slides the handle to the first heel where it locks into place. The user must intentionally release contact (lift their finger or release the pointer) and initiate a new gesture to trace the subsequent segment. This introduces clear cognitive friction, tactile cadence, and deliberate intention verification. Additionally, for users with limited motor stamina or smaller touch surfaces who struggle with continuous unbroken dragging, segmented gestures allow comfortable stepwise navigation without forfeiting security.

## User & Developer Benefits
- **Heightened Intentionality:** Requires multiple conscious physical interactions (touch -> drag -> release -> re-touch -> drag -> release) before dangerous actions can trigger.
- **Accidental Slip Mitigation:** Prevents momentum-driven slips where a single energetic swipe accidentally traverses the entire track.
- **Improved Ergonomics:** Users on mobile devices can reposition their thumb/finger between segments.
- **Configurable Cadence:** Developers can enable segmented mode via a single boolean flag (`segmented?: boolean`) and configure an optional checkpoint expiration timeout (`checkpointTimeoutMs?: number`).

## Scope Boundaries

### In Scope
- **Core Gesture State Machine:**
  - Introduce `segmented?: boolean` configuration option.
  - Introduce `checkpointTimeoutMs?: number` (optional auto-reset after inactivity at a checkpoint).
  - Introduce `onCheckpoint?: (heelIndex: number, progress: number) => void` callback.
  - Add `'checkpoint'` state to `GestureState` lifecycle (`idle` -> `active` -> `checkpoint` -> `active` ... -> `unlocked`).
  - Clamp slider handle movement at heel corner vertices; prevent continuous advancement onto subsequent segments within the same gesture stroke.
  - Support gesture resumption by engaging handle at the current heel checkpoint.
  - Handle mid-segment premature release: snap back to the last reached heel checkpoint (preserving completed segments rather than resetting to 0).
  - Checkpoint inactivity timer management: auto-reset to origin (`idle`) on timeout expiration, canceled upon resumption.
- **Component Adapters:**
  - Update `@heelslide/react` (`<Heelslide />`) with `segmented`, `checkpointTimeoutMs`, and `onCheckpoint` props.
  - Update `@heelslide/vue` (`<Heelslide />`) with `segmented`, `checkpointTimeoutMs`, and `@checkpoint` event.
  - Update `@heelslide/svelte` (`<Heelslide />`) with `segmented`, `checkpointTimeoutMs`, and `oncheckpoint` event.
  - Expose `data-state="checkpoint"` and styling hooks for visual/auditory pulse at checkpoints.
- **Documentation & Playground:**
  - Add interactive toggle in `apps/docs` configurator playground to demo segmented multi-gesture mode.
- **Testing & Quality Assurance:**
  - Unit tests covering state transitions, checkpoint clamping, mid-segment snapback, and timeout expiration in `packages/core`.
  - Component tests for React, Vue, and Svelte wrappers.
  - Minimum >80% code coverage across all new branches and functions.

### Out of Scope
- Modifying the underlying 2D rectilinear path generation algorithm (`generator.ts`).
- Non-rectilinear or arbitrary curved paths.
- Mandatory biometric authentication at checkpoints (handled by hosting application).
