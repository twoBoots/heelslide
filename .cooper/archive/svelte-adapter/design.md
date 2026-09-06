# Technical Design: Svelte 5 Component Adapter (`svelte-adapter`)

## Architecture Overview

`@heelslide/svelte` delivers idiomatic Svelte 5 primitives layered directly on top of `@heelslide/core`, utilizing Svelte 5's fine-grained reactive runes (`$state`, `$derived`, `$props`).

```text
packages/svelte/
├── package.json               # Workspace dependency on @heelslide/core, svelte ^5.0.0 peerDep
├── tsconfig.json              # Composite TypeScript build referencing tsconfig.base.json
├── vite.config.ts             # Vite library mode with @sveltejs/vite-plugin-svelte & vite-plugin-dts
└── src/
    ├── index.ts               # Barrel exports: Heelslide, createHeelslide, types
    ├── types.ts               # Props, options, and rune return interfaces
    ├── createHeelslide.svelte.ts # Headless rune composable wrapping HeelslideEngine
    ├── Heelslide.svelte       # Presentation component with procedural SVG & pointer capture
    └── style.css              # Namespaced CSS custom properties and default styling
```

---

## Data Models & Interfaces (`src/types.ts`)

```typescript
import type {
  EngineOptions,
  GeneratorOptions,
  GestureState,
  HeelCountConfig,
  Point2D,
  TrackPath
} from '@heelslide/core';

export interface CreateHeelslideOptions extends EngineOptions {
  track?: TrackPath;
  containerElement?: HTMLElement | null;
}

export interface CreateHeelslideReturn {
  // Reactive Rune Getters / State
  readonly state: GestureState;
  readonly progress: number;
  readonly track: TrackPath;
  readonly currentSegmentIndex: number;
  readonly handlePosition: Point2D;
  readonly isDragging: boolean;

  // Interaction Controls & Life Cycle
  startGesture: (pointOrEvent: Point2D | PointerEvent) => boolean;
  updateGesture: (pointOrEvent: Point2D | PointerEvent) => void;
  endGesture: () => void;
  cancelGesture: () => void;
  reset: () => void;
  regeneratePath: (overrideOptions?: Partial<GeneratorOptions>) => TrackPath;
  setContainerElement: (element: HTMLElement | null) => void;
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
  class?: string;

  // Svelte 5 Standard Lowercase Event Props
  onunlock?: () => void;
  onreset?: () => void;
  onprogress?: (progress: number) => void;
  onstatechange?: (state: GestureState) => void;

  // CamelCase Compatibility Fallbacks
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  onStateChange?: (state: GestureState) => void;
}
```

---

## Component Logic & Composable Design

### 1. Headless Rune Composable (`createHeelslide.svelte.ts`)

The composable provides headless state management backed by Svelte 5 runes:

```typescript
export function createHeelslide(options: CreateHeelslideOptions = {}): CreateHeelslideReturn {
  let state = $state<GestureState>('idle');
  let progress = $state<number>(0);
  let track = $state<TrackPath>(options.track ?? generateDefaultTrack(options));
  let currentSegmentIndex = $state<number>(0);
  let isDragging = $state<boolean>(false);
  let container = $state<HTMLElement | null>(options.containerElement ?? null);

  const engine = new HeelslideEngine({
    ...options,
    track,
    onStateChange: (newState) => {
      state = newState;
      isDragging = newState === 'active';
      options.onStateChange?.(newState);
    },
    onProgress: (newProgress) => {
      progress = newProgress;
      options.onProgress?.(newProgress);
    },
    onUnlock: () => {
      options.onUnlock?.();
    },
    onReset: () => {
      options.onReset?.();
    }
  });

  const handlePosition = $derived.by<Point2D>(() => {
    // Computes point along track matching current progress
    return computePointAtProgress(track, progress);
  });

  function normalizeCoordinates(pointOrEvent: Point2D | PointerEvent): Point2D {
    if ('clientX' in pointOrEvent) {
      if (!container) return { x: pointOrEvent.clientX, y: pointOrEvent.clientY };
      const rect = container.getBoundingClientRect();
      return {
        x: pointOrEvent.clientX - rect.left,
        y: pointOrEvent.clientY - rect.top
      };
    }
    return pointOrEvent;
  }

  // Returns reactive getters and control methods
  return {
    get state() { return state; },
    get progress() { return progress; },
    get track() { return track; },
    get currentSegmentIndex() { return currentSegmentIndex; },
    get handlePosition() { return handlePosition; },
    get isDragging() { return isDragging; },
    startGesture: (p) => engine.start(normalizeCoordinates(p)),
    updateGesture: (p) => engine.update(normalizeCoordinates(p)),
    endGesture: () => engine.end(),
    cancelGesture: () => engine.cancel(),
    reset: () => { engine.reset(); progress = 0; },
    regeneratePath: (overrides) => { /* re-generates and resets */ },
    setContainerElement: (el) => { container = el; }
  };
}
```

### 2. Presentation Component (`Heelslide.svelte`)

Built using Svelte 5's `$props()` rune:

- **Props Destructuring:**
  ```svelte
  <script lang="ts">
    import { createHeelslide } from './createHeelslide.svelte';
    import type { HeelslideProps } from './types';

    let {
      track,
      heels = 2,
      tolerance = 24,
      bounds = { width: 300, height: 150 },
      gridStep = 30,
      margin = 25,
      seed,
      disabled = false,
      ariaLabel = 'Intentional slide to confirm',
      class: className = '',
      onunlock,
      onreset,
      onprogress,
      onstatechange,
      onUnlock,
      onReset,
      onProgress,
      onStateChange
    }: HeelslideProps = $props();
  </script>
  ```
- **Callback Bridging:**
  Dispatches to both lowercase (`onunlock`) and camelCase (`onUnlock`) props to guarantee seamless ergonomics across Svelte 5 and multi-framework codebases.
- **Procedural SVG Rendering:**
  - Container `<div>` with `class="heelslide-container {className}"` and CSS custom property bindings.
  - `<svg>` element with dynamic `viewBox="0 0 {bounds.width} {bounds.height}"`.
  - Background track `<path class="heelslide-track-bg" ...>` drawing the full rectilinear path through all 90-degree heel points.
  - Active progress overlay `<path class="heelslide-track-progress" ...>` highlighting traversed segments.
  - Heel turn indicators `<circle class="heelslide-heel-marker" ...>` at each direction vertex.
  - Destination target `<circle class="heelslide-end-marker" ...>` indicating success coordinate.
  - Handle `<g class="heelslide-handle" ...>` positioned at `handlePosition.x, handlePosition.y`.
- **PointerEvents & Pointer Capture:**
  - `onpointerdown` attaches to the handle element; if not disabled, triggers `setPointerCapture(event.pointerId)`.
  - `onpointermove` on handle or container calls `updateGesture(event)`.
  - `onpointerup` and `onpointercancel` release pointer capture via `releasePointerCapture(event.pointerId)`.
- **Accessibility:**
  - `role="slider"`
  - `aria-label="{ariaLabel}"`
  - `aria-valuemin="0"`
  - `aria-valuemax="100"`
  - `aria-valuenow="{Math.round(slider.progress * 100)}"`
  - `aria-disabled="{disabled}"`

---

## CSS Custom Properties Design (`src/style.css`)

Exact parity with `@heelslide/vue` and `@heelslide/react` theming architecture:

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

  position: relative;
  display: inline-block;
  user-select: none;
  touch-action: none;
}
```

---

## Build & Packaging Architecture

### Package Configuration (`packages/svelte/package.json`)
```json
{
  "name": "@heelslide/svelte",
  "version": "0.1.0",
  "description": "Svelte 5 component adapter and headless rune composable for intentional-gesture security gates.",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "svelte": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist",
    "src"
  ],
  "scripts": {
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@heelslide/core": "*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "svelte": "^5.0.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.5.0"
  },
  "license": "MIT"
}
```

### Vite Build Configuration (`packages/svelte/vite.config.ts`)
- Configured with `@sveltejs/vite-plugin-svelte` and `vite-plugin-dts`.
- Externalizes `svelte`, `svelte/internal`, `svelte/compiler`, and `@heelslide/core`.
- Emits dual format (ESM + CJS) and bundles TypeScript `.d.ts` definitions.

### Testing Strategy (`vitest.config.ts`)
- Vitest configured with DOM simulation (`happy-dom` or `jsdom`).
- Unit tests validating `createHeelslide` rune reactivity, bounds calculations, and state transitions.
- Component tests validating `<Heelslide />` DOM rendering, SVG path generation, pointer capture, and callback invocations.
- Strict enforcement of >80% statement, branch, line, and function coverage.
