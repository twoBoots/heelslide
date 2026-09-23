# Design: Custom Handle Border Radius & Geometric Shapes (`handle-border-radius`)

## Architectural Approach

### 1. Unified CSS Custom Property Contract
We introduce `--heelslide-handle-border-radius` with a default of `8px` (subtle rounded square):
```css
:where([data-heelslide-container]),
.heelslide-container {
  --heelslide-handle-border-radius: 8px;
  --heelslide-handle-size: 32px;
}
```
Consumers can customize the shape:
- Sharp Square: `--heelslide-handle-border-radius: 0px;`
- Subtle Rounded Square (Default): `--heelslide-handle-border-radius: 8px;`
- Squircle / Pill: `--heelslide-handle-border-radius: 14px;`
- Full Circle: `--heelslide-handle-border-radius: 50%;`

### 2. Adapter Implementations

#### A. React (`@heelslide/react`)
In `packages/react/src/Heelslide.tsx`:
Replace the hardcoded `borderRadius: '50%'` on `[data-heelslide-handle]` with:
```tsx
borderRadius: 'var(--heelslide-handle-border-radius, 8px)',
```
In `packages/react/src/style.css`:
```css
--heelslide-handle-border-radius: 8px;
```

#### B. Vue 3 (`@heelslide/vue`)
In `packages/vue/src/Heelslide.vue`:
The handle is rendered inside `<svg><g class="heelslide-handle">`. SVG `<circle>` does not support `border-radius` or `rx`/`ry`. We replace or enhance the handle element using an SVG `<rect>`:
```vue
<rect
  class="heelslide-handle-shape heelslide-handle-circle"
  :x="handlePosition.x - (handleSize / 2)"
  :y="handlePosition.y - (handleSize / 2)"
  :width="handleSize"
  :height="handleSize"
  :rx="handleRx"
  :ry="handleRy"
/>
```
Where:
- `handleSize`: computed from `props.handleSize` or defaults to `32px` (matching `2 * handleRadius`).
- `handleRx` / `handleRy`: attributes set to `var(--heelslide-handle-border-radius, 8px)` or fallback to 8.
- Retains both classes `.heelslide-handle-shape` and `.heelslide-handle-circle` for 100% backward CSS selector compatibility.
In `packages/vue/src/style.css`:
```css
.heelslide-handle-shape,
.heelslide-handle-circle {
  rx: var(--heelslide-handle-border-radius, 8px);
  ry: var(--heelslide-handle-border-radius, 8px);
  fill: var(--heelslide-handle-bg);
  stroke: var(--heelslide-handle-border-color);
  stroke-width: var(--heelslide-handle-border-width);
  transition: fill 0.15s ease, stroke 0.15s ease, transform 0.15s ease;
}
```

#### C. Svelte 5 (`@heelslide/svelte`)
In `packages/svelte/src/Heelslide.svelte`:
```svelte
<rect
  class="heelslide-handle-shape heelslide-handle-circle"
  x={slider.handlePosition.x - (handleSize / 2)}
  y={slider.handlePosition.y - (handleSize / 2)}
  width={handleSize}
  height={handleSize}
  rx={handleRx}
  ry={handleRy}
/>
```
With matching CSS in `packages/svelte/src/style.css`.

### 3. Documentation Playground & Snippet Generator (`apps/docs`)
1. **Configurator Panel (`ConfigPanel.tsx` / `ThemeControls.tsx`)**:
   - Add a slider or input for "Handle Border Radius" (range 0 to 20px, plus a "50% (Circle)" toggle or preset).
2. **Code Snippet Generator (`snippets.ts`)**:
   - Emit `'--heelslide-handle-border-radius': '${theme.handleBorderRadius}'` when customized.
3. **Reference Tables (`DocsReference.tsx`)**:
   - Document `--heelslide-handle-border-radius: 8px` under "Handle Tokens".
4. **README.md**:
   - Add `--heelslide-handle-border-radius` to the CSS custom properties reference table.
