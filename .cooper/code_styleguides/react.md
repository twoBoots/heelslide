# React Style Guide (@heelslide/react)

## Component Architecture
- Support React 18 and React 19 functional components.
- Separate headless interaction logic into custom hooks (`useHeelslide`) and visual rendering into UI components (`<Heelslide />`).
- Forward DOM refs using `React.forwardRef<HTMLDivElement, HeelslideProps>`.

## Props & Typing
- Define component props using clear TypeScript interfaces:
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
  }
  ```
- Ensure prop names and event semantics remain 100% consistent with `@heelslide/vue`.

## Event Handling & Pointer Lifecycle
- Use native PointerEvents (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) attached with `setPointerCapture` where applicable to ensure smooth tracking across touchscreen viewports.
- Always clean up event listeners and animation frames inside `useEffect` return functions to prevent memory leaks.

## Styling & CSS Variables
- Expose styling knobs through `--heelslide-*` CSS custom properties.
- Allow users to pass custom styles via `style` prop or external CSS stylesheets targeting `--heelslide-*`.
