# Heelslide

## Vision
**Heelslide** is an intentional-gesture security gate Web UI component designed to prevent accidental touchscreen activations (such as pocket presses or accidental swipes) on dangerous, sensitive, or irreversible actions. Unlike standard 1-dimensional "slide to unlock" controls, Heelslide generates a dynamic multi-segment track with 90-degree directional changes ("heels") that the user must deliberately trace to complete the action.

## Target Audience
- Frontend developers and teams building mobile web or responsive apps with critical actions (e.g., initiating payments, deleting resources, executing production commands, emergency triggers).
- End-users on touchscreen devices who need protection against unintentional pocket touches or accidental swipes.

## Core Capabilities & Initial Scope
1. **Dynamic Track & Heel Generation**: Procedural generation of a continuous 2D path containing 90-degree turns ("heels"), constrained by configurable parameters:
   - Fixed count of heels or `[min, max]` range.
   - Grid or bound dimensions to fit within mobile UI viewports.
2. **Intent & Gesture Verification**: Pointer/touch event tracking that validates continuous tracing along the generated path within configurable tolerance thresholds, resetting or rejecting deviations.
3. **Multi-Framework Ecosystem**:
   - Framework-agnostic core engine (state machine, path generator, gesture tracker).
   - Dedicated **React** component wrapper (`@heelslide/react` or `heelslide-react`).
   - Dedicated **Vue** component wrapper (`@heelslide/vue` or `heelslide-vue`).
   - Identical, consistent configuration schema and event contracts across frameworks.
4. **Customizable Styling via CSS Variables**:
   - Fully customizable visual appearance using namespaced CSS custom properties prefixed with `--heelslide-*` (e.g., `--heelslide-track-bg`, `--heelslide-slider-color`, `--heelslide-corner-radius`, `--heelslide-heel-indicator`).
   - Zero hardcoded runtime styling dependencies.

## Quality & Non-Functional Goals
- **Responsiveness & Fluidity**: 60fps pointer/touch tracking with minimal latency.
- **Accessibility**: Screen-reader accessible alternative / fallback security confirmation flow (ARIA compliance).
- **Test Coverage**: >80% automated unit and gesture interaction test coverage across core and framework wrappers.
- **Lightweight**: Minimal bundle size with zero heavy runtime dependencies.
