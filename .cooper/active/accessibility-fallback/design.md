# Technical Design: Accessibility & Keyboard Navigation Fallback

## Architectural Overview

The Accessibility & Keyboard Navigation Fallback track bridges the gap between touch/pointer gesture tracing and universal accessibility standards (WCAG 2.2 AA). It operates on three coordinated layers:

1. **Core Semantic Engine (`@heelslide/core`)**: Implements discrete step progression along rectilinear segments, directional validation, and announcement generation.
2. **Framework Adapters (`@heelslide/react` & `@heelslide/vue`)**: Implements keyboard event handling on the slider handle, ARIA live regions, and fallback modal dialogs.
3. **Accessibility Experience Modes**:
   - **Stepped Keyboard Mode (`'stepped'`)**: Keyboard users navigate the track segment-by-segment using arrow keys or step keys without requiring continuous mouse/touch dragging.
   - **Accessible Confirmation Dialog Mode (`'dialog'`)**: A modal dialog or double-action confirmation button that provides a single-action, non-gesture intent confirmation for switch-access or assistive devices (WCAG 2.5.1 pointer gesture exemption).
   - **Custom Fallback Mode (`'custom'`)**: Headless hook/composable primitives allowing host applications to render custom accessible confirmation flows.

---

## 1. ARIA Roles & Semantic Tree

### Container & Handle Semantics
- **Container / Slider (`data-heelslide-container`)**:
  - `role="slider"`
  - `tabindex="0"` (allows standard keyboard focus on the slider component)
  - `aria-label`: Configurable, defaults to `"Intentional gesture security gate"`
  - `aria-valuemin="0"`
  - `aria-valuemax="100"`
  - `aria-valuenow`: Integer progress percentage (`0` to `100`)
  - `aria-valuetext`: Dynamic descriptive text (e.g., `"0% complete. Slide right to begin."` or `"50% complete. Heel 1 reached. Slide down to continue."`)
  - `aria-orientation="horizontal"` (or `"mixed"`/`"vertical"` based on primary initial vector)
  - `aria-keyshortcuts="ArrowRight ArrowLeft ArrowUp ArrowDown Enter Space Escape"`
  - `aria-disabled="false|true"`

### Live Region Semantics
- **Announcer Region (`data-heelslide-live-region`)**:
  - Hidden visually (`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0);`)
  - `role="status"`
  - `aria-live="polite"`
  - `aria-atomic="true"`
  - Emits contextual announcements on state change, heel arrival, unlock, and reset.

### Accessible Confirmation Dialog (`data-heelslide-dialog`)
- Rendered when `accessibleFallback="dialog"` is triggered:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby="heelslide-dialog-title"`
  - `aria-describedby="heelslide-dialog-desc"`
  - Focus trap holding keyboard focus within the dialog until confirmed or dismissed via `Escape`.

---

## 2. Keyboard Navigation Sequences

### Stepped Mode Interaction
| Key | Action | Engine State & Progress |
| :--- | :--- | :--- |
| `Tab` | Focuses the slider handle | `idle` |
| `ArrowRight` / `ArrowDown` | Advance along current segment towards the next heel | Increments progress towards segment end. If heel vertex reached, announces next direction. |
| `ArrowLeft` / `ArrowUp` | Step backward along segment or cancel | Decrements progress or resets if moving in reverse beyond tolerance. |
| `Home` | Reset gesture immediately to start | State returns to `idle`, progress `0`. |
| `End` | No-op (forbidden to bypass intent validation) | No change (prevents accidental single-key bypass). |
| `Space` / `Enter` | Engage / Confirm or open accessible confirmation dialog | If at destination: unlocks gate. If idle and `accessibleFallback="dialog"`: opens confirmation modal. |
| `Escape` | Reset and dismiss active gesture / close modal | Reverts state to `idle`. |

---

## 3. Data Models & API Contracts

### `@heelslide/core` API Additions

```typescript
export interface AccessibleStep {
  segmentIndex: number;
  direction: Direction;
  startPoint: Point2D;
  endPoint: Point2D;
  instruction: string; // e.g. "Step 1 of 3: Move right to first heel"
  progressAtEnd: number;
}

export type AccessibleAnnouncementType =
  | 'start'
  | 'step'
  | 'heel_reached'
  | 'progress'
  | 'unlock'
  | 'reset';

export interface AccessibleAnnouncement {
  type: AccessibleAnnouncementType;
  message: string;
  progress: number;
  timestamp: number;
}

export interface AccessibleOptions {
  enabled?: boolean; // default: true
  stepIncrement?: number; // default: 0.1 (10% step per keypress)
  announceMessages?: Partial<Record<AccessibleAnnouncementType, (context: any) => string>>;
}

export interface EngineOptions {
  // ... existing options ...
  accessible?: AccessibleOptions;
  onAnnouncement?: (announcement: AccessibleAnnouncement) => void;
}
```

#### New Engine Methods
```typescript
class HeelslideEngine {
  // ... existing methods ...
  public getAccessibleSteps(): AccessibleStep[];
  public getAccessibleDescription(): string;
  public stepForward(amount?: number): number;
  public stepBackward(amount?: number): number;
  public stepToNextHeel(): number;
}
```

---

## 4. Framework Adapter Component Specifications

### `@heelslide/react`

```typescript
export type AccessibleFallbackMode = 'stepped' | 'dialog' | 'custom';

export interface HeelslideProps {
  // ... existing props ...
  accessibleFallback?: AccessibleFallbackMode; // default: 'stepped'
  ariaLabel?: string; // default: 'Intentional gesture security gate'
  ariaDescribedBy?: string;
  accessibleButtonText?: string; // default: 'Confirm with Accessible Alternative'
  renderAccessibleFallback?: (props: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) => React.ReactNode;
}
```

#### Hook Additions (`useHeelslide`)
- Exposes `getHandleProps().onKeyDown` handling arrow keys and shortcuts.
- Exposes `announcement: string | null` for custom live regions.
- Exposes `stepForward()`, `stepBackward()`, `stepToNextHeel()`.
- Exposes `isFallbackOpen`, `openFallback()`, `closeFallback()`.

### `@heelslide/vue`

```typescript
export interface HeelslideProps {
  // ... existing props ...
  accessibleFallback?: AccessibleFallbackMode; // default: 'stepped'
  ariaLabel?: string;
  ariaDescribedBy?: string;
  accessibleButtonText?: string;
}

export interface HeelslideEmits {
  // ... existing emits ...
  (e: 'announcement', announcement: AccessibleAnnouncement): void;
  (e: 'fallbackOpen'): void;
  (e: 'fallbackClose'): void;
}
```

#### Vue Slots
- `#fallback="{ isOpen, confirm, cancel }"` for custom accessible confirmation views.
- `#announcer="{ message }"` for custom live region placement.

---

## 5. Security & Intent Parity Verification

To preserve the fundamental security intent of Heelslide (preventing accidental pocket presses and errant activations):
1. **No Single-Key Accidental Unlock**: A single keypress (such as `Space` or `Enter`) in stepped mode MUST NOT immediately trigger `onUnlock`. The user must either step through each segment sequentially or deliberately confirm through a secondary confirmation prompt.
2. **Clear VoiceOver/TalkBack Instructions**: Screen reader announcements must explicitly communicate the current segment, direction, and heel milestones.
3. **Esc Key Reset**: Hitting `Escape` at any point during stepped progression immediately aborts the sequence and returns progress to 0, ensuring quick escape from an unintended activation sequence.
