# Design: Mobile Responsiveness & Overflow Prevention

## Architectural Overview
The documentation application (`apps/docs`) is enhanced with a comprehensive responsive styling system and adaptive layout components. All changes operate within the existing React 19 + Vite + CSS custom property stack, eliminating horizontal page clipping and viewport expansion while maintaining high desktop density.

## Breakpoint Strategy
We define consistent responsive media queries within `apps/docs/src/styles.css`:

| Breakpoint | Target Devices | Layout Adaptations |
|---|---|---|
| **> 960px** | Desktop / Large Tablet | 2-column playground grid (`1fr 380px`), standard 2rem/1.5rem desktop paddings |
| **≤ 960px** | Tablet Landscape / Portrait | 1-column stacked playground grid (simulator above configuration panel) |
| **≤ 768px** | Medium Tablets / Large Phones | Fluid header font size, container padding reduced to `1.25rem 1rem`, stats grid adaptively reflows |
| **≤ 640px** | Standard Mobile Phones | Touch-scrollable tab bars, code snippet headers wrap, table scroll wrappers enforce min-width legibility |
| **≤ 480px** | Compact Phones | Card paddings reduced to `1rem 0.75rem`, color pickers stack single-column, stats grid switches to single-column |

## Detailed Component Specifications

### 1. Root & Viewport Protection
- `html, body`: Explicit `overflow-x: clip;` (with fallback `overflow-x: hidden;`) and `width: 100%;` to prevent inadvertent window-level horizontal scroll bars caused by any nested element.
- `.docs-container`:
  - `padding: clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem);`
  - Ensures maximum usable screen width on compact viewports.

### 2. Header & Branding
- `.header`: Responsive layout with `flex-direction: row; flex-wrap: wrap; gap: 1rem;`
- `.header-title-group h1`: `font-size: clamp(1.6rem, 5vw, 2.25rem);` with `flex-wrap: wrap;` so the version badge gracefully stays aligned without breaking line constraints.
- `.header-links`: Buttons span natural or full width on ultra-small screens without overflowing.

### 3. Live Gate Simulator & Preview Stage
- `.preview-stage`:
  - Padding adjusted from desktop `2rem` down to `1.25rem 0.5rem` on mobile.
  - Sizing container: Introduce a `.preview-stage-viewport` wrapper with `max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; display: flex; justify-content: center;`
  - Ensures that when user configures wide gates (e.g. 360px - 480px via the width slider), the gate remains completely operable and scrollable rather than being clipped by `overflow: hidden`.

### 4. Metrics & Statistics Grid (`.stats-grid`)
- Break away from rigid `repeat(3, 1fr)`:
  - Default: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;`
  - `≤ 640px`: `grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));`
  - `≤ 480px`: `grid-template-columns: 1fr;`
  - Metric values and status tags (`.status-tag`) receive adequate padding and will not clip status dots or label text.

### 5. Touch-Scrollable Navigation Tabs (`.tabs-nav`)
- `.tabs-nav`:
  - `display: flex; gap: 0.5rem; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none;`
  - `&::-webkit-scrollbar { display: none; }`
- `.tab-btn`, `.ref-tab-btn`:
  - `flex-shrink: 0; white-space: nowrap;`
  - Eliminates the ~560px minimum width blowout, allowing natural horizontal swiping on mobile.

### 6. Configuration Panel Refinements
- Dual color picker rows:
  - `≤ 480px`: `grid-template-columns: 1fr;`
- Action button clusters (regenerate path, disabled, numbered heels):
  - `flex-wrap: wrap; gap: 0.75rem;`
  - Buttons expand gracefully with `flex: 1 1 auto;`
- Audio & haptics toggles:
  - Add explicit `flex-wrap: wrap; gap: 1rem;` to prevent inline overflow.
- Audition & Preset buttons:
  - Buttons use `flex: 1 1 calc(50% - 0.5rem); min-width: 120px;` on mobile so they form tidy two-per-row or stacked grids.

### 7. Reference Tables & Code Previews
- Reference container:
  - Table wrappers maintain `overflow-x: auto; -webkit-overflow-scrolling: touch;`
  - `.ref-table` sets `min-width: 580px;` so multi-column specifications maintain column readability rather than collapsing into single-word wrapping.
- Code blocks:
  - `.code-block-header`: `flex-wrap: wrap; gap: 0.5rem;` so filename and copy button don't overlap on narrow screens.
  - `.code-pre`: `max-width: 100%; overflow-x: auto;`
