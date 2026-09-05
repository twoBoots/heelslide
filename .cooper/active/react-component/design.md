# Technical Design: React Component Adapter & Headless Hook

## Architecture Overview

`@heelslide/react` bridges `@heelslide/core` with the React ecosystem, offering both headless flexibility via `useHeelslide` and a ready-to-use `<Heelslide />` SVG presentation component.

```text
packages/react/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts              # Public exports (hook, component, types)
│   ├── types.ts              # React-specific prop and hook type definitions
│   ├── useHeelslide.ts       # Headless hook wrapping HeelslideEngine
│   └── Heelslide.tsx         # Presentation component with procedural SVG rendering
└── tests/
    ├── useHeelslide.test.ts  # Hook lifecycle and state machine tests
    └── Heelslide.test.ts     # Component rendering, events, and CSS vars tests
```

---

## Data Models & API Contracts

### 1. Hook Options & Return (`useHeelslide`)

```typescript
import type {
  EngineOptions,
  GeneratorOptions,
  GestureState,
  Point2D,
  TrackPath
} from '@heelslide/core';

export interface UseHeelslideOptions extends EngineOptions {
  disabled?: boolean;
}

export interface UseHeelslideReturn {
  state: GestureState;
  progress: number;
  track: TrackPath;
  handlePosition: Point2D;
  isDragging: boolean;
  regenerate: (options?: Partial<GeneratorOptions>) => void;
  reset: () => void;
  getContainerProps: () => {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
  getHandleProps: () => {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
}
```

### 2. Component Props (`<Heelslide />`)

```typescript
export interface HeelslideProps {
  heels?: number | { min: number; max: number };
  tolerance?: number;
  disabled?: boolean;
  onUnlock?: () => void;
  onReset?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  gridStep?: number;
  seed?: number;
}
```

---

## Component Logic & Gesture Tracking

### 1. Pointer Coordinates & Bounding Box Normalization
Pointer coordinates in the browser are reported relative to the viewport (`clientX`, `clientY`). The component transforms these to container-relative coordinates:
```typescript
const rect = containerRef.current.getBoundingClientRect();
const point: Point2D = {
  x: clientX - rect.left,
  y: clientY - rect.top
};
```

### 2. Pointer Capture Lifecycle
- On `pointerdown` at handle or start position:
  - If `disabled`, ignore.
  - Call `event.currentTarget.setPointerCapture(event.pointerId)`.
  - Invoke `engine.startGesture(point)`.
- On `pointermove`:
  - If active, invoke `engine.updateGesture(point)`.
- On `pointerup`:
  - Release capture via `event.currentTarget.releasePointerCapture(event.pointerId)`.
  - Invoke `engine.endGesture()`.
- On `pointercancel`:
  - Release capture.
  - Invoke `engine.cancelGesture()`.
- On unmount (`useEffect` return):
  - Ensure any active state is reset.

### 3. Procedural SVG Path Rendering
- The SVG renders:
  - Background track path `<path d="..." />` connecting `track.points`.
  - Traversed/active progress path or heel indicator dots.
  - Turn vertex dots ("heels") highlighting direction changes.
  - Draggable handle `<circle>` or `<g>` positioned at `handlePosition`.
- SVG path string generator transforms `track.points` into rectilinear `M x y L x y ...` SVG paths.

### 4. CSS Custom Properties
Visual properties are defined through `--heelslide-*` variables with CSS fallbacks:
- `--heelslide-bg`: Background of container (default: `transparent`)
- `--heelslide-border-radius`: Container radius (default: `12px`)
- `--heelslide-track-bg`: Track stroke color (default: `#e2e8f0`)
- `--heelslide-track-active`: Active traversed track stroke (default: `#3b82f6`)
- `--heelslide-track-width`: Track stroke width (default: `8px`)
- `--heelslide-handle-bg`: Draggable handle color (default: `#2563eb`)
- `--heelslide-handle-size`: Handle diameter (default: `32px`)
- `--heelslide-handle-border`: Handle border (default: `2px solid #ffffff`)
- `--heelslide-handle-shadow`: Handle shadow (default: `0 2px 8px rgba(0,0,0,0.15)`)
