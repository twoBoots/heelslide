# Vue Style Guide (@heelslide/vue)

## Component Architecture
- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Separate headless interaction logic into composables (`useHeelslide`) and visual rendering into single-file components (`<Heelslide />`).

## Props & Emits Typing
- Define component props and emits using typed macros mirroring `@heelslide/react`:
  ```typescript
  export interface HeelslideProps {
    heels?: number | { min: number; max: number };
    tolerance?: number;
    disabled?: boolean;
    class?: string;
    style?: Record<string, any>;
  }

  export interface HeelslideEmits {
    (e: 'unlock'): void;
    (e: 'reset'): void;
    (e: 'progress', value: number): void;
  }
  ```

## Event Handling & Lifecycle
- Manage PointerEvents with full cleanup in `onUnmounted()`.
- Use template refs (`const containerRef = ref<HTMLDivElement | null>(null)`) for DOM element binding.

## Styling & CSS Variables
- Consume namespaced CSS variables (`--heelslide-*`) inside component styles or root element style bindings.
- Avoid scoped style leakage by prefixing all internal class selectors with `heelslide-`.
