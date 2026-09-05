# Technical Design: Vue 3 Component & Composable Adapter

## Architecture Overview

`@heelslide/vue` provides idiomatic Vue 3 primitives layered directly on top of `@heelslide/core`.

```text
packages/vue/
├── package.json          # Workspace dependency on @heelslide/core, vue peerDep
├── tsconfig.json          # TypeScript project references & composite build
├── vite.config.ts         # Library mode build (ESM, CJS, dts) + Vue SFC compiler
└── src/
    ├── index.ts          # Public barrel exports
    ├── types.ts          # Props, emits, composable options and return types
    ├── useHeelslide.ts   # Headless composable wrapping HeelslideEngine
    ├── Heelslide.vue     # Presentation component with procedural SVG & pointer capture
    └── style.css         # CSS custom properties and default styling
```

---

## Data Models & Interfaces

```typescript
import type {
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
  TrackPath
} from '@heelslide/core';
import type { ComputedRef, Ref } from 'vue';

export interface UseHeelslideOptions extends EngineOptions {
  track?: TrackPath;
  containerRef?: Ref<HTMLElement | null | undefined>;
}

export interface UseHeelslideReturn {
  state: Readonly<Ref<GestureState>>;
  progress: Readonly<Ref<number>>;
  track: Readonly<Ref<TrackPath>>;
  currentSegmentIndex: Readonly<Ref<number>>;
  handlePosition: ComputedRef<Point2D>;
  isDragging: ComputedRef<boolean>;
  startGesture: (pointOrEvent: Point2D | PointerEvent) => boolean;
  updateGesture: (pointOrEvent: Point2D | PointerEvent) => void;
  endGesture: () => void;
  cancelGesture: () => void;
  reset: () => void;
  regeneratePath: (overrideOptions?: Partial<GeneratorOptions>) => TrackPath;
}

export interface HeelslideProps {
  track?: TrackPath;
  heels?: HeelCountConfig;
  tolerance?: number;
  bounds?: { width: number; height: number };
  gridStep?: number;
  margin?: number;
  seed?: number;
  disabled?: boolean;
  ariaLabel?: string;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}

export interface HeelslideEmits {
  (e: 'unlock'): void;
  (e: 'reset'): void;
  (e: 'progress', progress: number): void;
  (e: 'stateChange', state: GestureState): void;
}
```

---

## Component Logic & Composable Design

### 1. Headless Composable (`useHeelslide.ts`)
- Instantiates a `HeelslideEngine` with reactive state tracking.
- Maintains reactive `state` (`idle`, `active`, `unlocked`, `reset`), `progress` (`0.0` to `1.0`), `track`, and `currentSegmentIndex`.
- Computes `handlePosition` (starts at `track.points[0]`, updates along current segment or matches gesture projection).
- Translates pointer events:
  - If a `PointerEvent` is passed, computes offset coordinates relative to `containerRef` (using `getBoundingClientRect()`), accounting for CSS scale and scroll offsets.
  - If a raw `Point2D` is passed, feeds coordinates directly to engine.
- Bridges callback hooks (`onUnlock`, `onReset`, `onProgress`, `onStateChange`) cleanly into consumer notifications.

### 2. Presentation Component (`Heelslide.vue`)
- Written in `<script setup lang="ts">`.
- Accepts both callback props (`onUnlock`, `onReset`, `onProgress`, `onStateChange`) and emits (`unlock`, `reset`, `progress`, `stateChange`) to match developer expectations.
- Renders:
  - Container `<div>` with `class="heelslide-container"` and responsive inline CSS styles.
  - `<svg>` element with `viewBox="0 0 width height"`.
  - Background track `<path class="heelslide-track-bg" ...>` connecting all points.
  - Progress track `<path class="heelslide-track-progress" ...>` rendering traversed segments up to handle position.
  - Heel turn indicators `<circle class="heelslide-heel-marker" ...>` at each 90-degree corner.
  - Draggable handle `<g class="heelslide-handle" ...>` with `<circle>` and optional `#handle` slot.
  - Start and end destination markers.
- Accessible ARIA attributes (`role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow="progress * 100"`, `aria-label`).
- Manages pointer capture on `pointerdown` via `(e.target as HTMLElement).setPointerCapture(e.pointerId)` and releases capture on `pointerup` / `pointercancel`.
- Automatically tears down and releases listeners in `onUnmounted`.

---

## CSS Custom Properties Design (`style.css`)

All styling is isolated under `--heelslide-*` variables with built-in fallbacks:

```css
.heelslide-container {
  --heelslide-width: 300px;
  --heelslide-height: 150px;
  --heelslide-track-bg: #e2e8f0;
  --heelslide-track-progress: #3b82f6;
  --heelslide-track-width: 12px;
  --heelslide-handle-radius: 18px;
  --heelslide-handle-color: #ffffff;
  --heelslide-handle-border: 2px solid #3b82f6;
  --heelslide-handle-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --heelslide-heel-color: #94a3b8;
  --heelslide-heel-radius: 4px;
  --heelslide-end-color: #10b981;
  --heelslide-end-radius: 6px;
  --heelslide-transition: transform 0.15s ease, stroke 0.15s ease;
}
```

---

## Build & Test Architecture

- `packages/vue/package.json`:
  - `name`: `@heelslide/vue`
  - `peerDependencies`: `vue: ^3.3.0`
  - `dependencies`: `@heelslide/core: workspace:*`
  - `devDependencies`: `@vitejs/plugin-vue`, `@vue/test-utils`, `jsdom`, `vite`, `vite-plugin-dts`, `typescript`, `vitest`
- `vite.config.ts`:
  - Bundles SFC and composable using `@vitejs/plugin-vue` and `vite-plugin-dts`.
  - Externalizes `vue` and `@heelslide/core`.
  - Generates both ESM and CJS bundles with bundled `.d.ts`.
