# Design: Repository README & GitHub Pages Synchronization

## Architecture & Layout Plan

The updated `README.md` will be structured to provide immediate access to the live demo, fast installation instructions, core capability highlights, and in-depth configuration reference without overwhelming the reader.

```text
README.md Architecture:
┌────────────────────────────────────────────────────────┐
│ Title & Tagline                                        │
│ Badges (CI, Live Demo, License, SDD, Troop)            │
│ Hero Banner Callout (Tip box with live playground URL) │
├────────────────────────────────────────────────────────┤
│ Overview (1D vs 2D Intentional Gesture Security)       │
├────────────────────────────────────────────────────────┤
│ Quick Start & Installation                             │
│ - Package manager commands (npm, pnpm, yarn)           │
│ - Multi-framework starter snippets (React, Vue, Svelte)│
├────────────────────────────────────────────────────────┤
│ Core Capabilities (Heels, Gestures, Slots, Mobile...)  │
├────────────────────────────────────────────────────────┤
│ Custom Handle Icons & Content                          │
│ - React children / Vue #handle / Svelte children       │
├────────────────────────────────────────────────────────┤
│ Segmented Multi-Gesture Checkpoints                    │
│ - mode="segmented" & checkpointTimeoutMs               │
├────────────────────────────────────────────────────────┤
│ Accessibility (WCAG 2.2 AA, Keybindings, Live Region)  │
├────────────────────────────────────────────────────────┤
│ Styling & CSS Custom Properties Reference              │
│ - Track, Handle, Heel markers, Target indicators       │
├────────────────────────────────────────────────────────┤
│ Repository Structure, Development, License             │
└────────────────────────────────────────────────────────┘
```

## Section Details

### 1. Hero Callout & Badges
Directly under the project title and tagline, add a dedicated Live Demo badge:
```markdown
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2ea44f?logo=github&style=flat-square)](https://twoboots.github.io/heelslide/)
```
Followed by a GitHub-style alert callout:
```markdown
> [!TIP]
> **[🚀 Explore the Live Interactive Playground & Configurator →](https://twoboots.github.io/heelslide/)**
> Test procedural 2D paths, tweak CSS custom properties, inspect live gesture telemetry, test keyboard accessibility, and generate copy-paste code across React, Vue, and Svelte.
```

### 2. Quick Start & Installation
Provide copyable installation commands and minimal working examples for each supported framework:
- **React**:
  ```bash
  npm install @heelslide/react @heelslide/core
  ```
  ```tsx
  import { Heelslide } from '@heelslide/react';

  function SecurityGate() {
    return (
      <Heelslide
        heelCount={3}
        onUnlock={() => console.log('Action confirmed!')}
      />
    );
  }
  ```
- **Vue**:
  ```bash
  npm install @heelslide/vue @heelslide/core
  ```
  ```vue
  <script setup lang="ts">
  import { Heelslide } from '@heelslide/vue';
  </script>

  <template>
    <Heelslide :heel-count="3" @unlock="() => console.log('Action confirmed!')" />
  </template>
  ```
- **Svelte**:
  ```bash
  npm install @heelslide/svelte @heelslide/core
  ```
  ```svelte
  <script lang="ts">
    import { Heelslide } from '@heelslide/svelte';
  </script>

  <Heelslide heelCount={3} onunlock={() => console.log('Action confirmed!')} />
  ```

### 3. Handle Customization & Slots
Document the ability to embed custom icons inside the draggable handle:
- React: `<Heelslide><LockIcon /></Heelslide>`
- Vue: `<Heelslide><template #handle="{ state }"><LockIcon /></template></Heelslide>`
- Svelte: `<Heelslide><LockIcon /></Heelslide>`

### 4. Segmented Multi-Gesture Checkpoints
Document the checkpoint mode:
```tsx
<Heelslide
  mode="segmented"
  checkpointTimeoutMs={4000}
  onCheckpointReach={(checkpoint) => console.log('Heel reached:', checkpoint)}
  onUnlock={() => console.log('Unlocked!')}
/>
```
Explain the user interaction: users can drag to a heel turn, lift their thumb/pointer to reposition comfortably, and re-engage within the timeout window without resetting progress.

### 5. CSS Custom Properties Update
Ensure the reference table includes recently added tokens:
- `--heelslide-handle-size`
- `--heelslide-handle-shadow`
- `--heelslide-handle-checkpoint-shadow`
- `--heelslide-handle-checkpoint-border-color`

## Verification Strategy
- Create an automated test in `apps/docs/src/__tests__/readme.test.ts` reading `README.md` and asserting:
  1. Contains exact live demo link: `https://twoboots.github.io/heelslide/`
  2. Contains installation instructions for `@heelslide/react`, `@heelslide/vue`, and `@heelslide/svelte`
  3. Documents handle customization slot syntax (`children` and `#handle`)
  4. Documents segmented mode (`mode="segmented"`)
  5. Documents all handle CSS custom properties
