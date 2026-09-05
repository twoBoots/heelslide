# Technical Design: Interactive Documentation & Demo Playground (`apps/docs`)

## 1. Architecture Overview
`apps/docs` is integrated into the npm workspaces monorepo:
```
apps/docs/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles.css
    ├── components/
    │   ├── Header.tsx
    │   ├── Playground.tsx
    │   ├── ConfigPanel.tsx
    │   ├── CodeSnippet.tsx
    │   ├── SimulationCard.tsx
    │   └── FrameworkTabs.tsx
    └── tests/
        └── App.test.tsx
```

## 2. Dependencies & Workspace Integration
- Workspace dependencies:
  - `@heelslide/core`: `*`
  - `@heelslide/react`: `*`
- Dev / runtime dependencies:
  - `react`: `^19.0.0`
  - `react-dom`: `^19.0.0`
  - `@types/react`: `^19.0.0`
  - `@types/react-dom`: `^19.0.0`
  - `vite`: `^6.0.0`
  - `@vitejs/plugin-react`: `^4.3.0`

## 3. Interactive Configurator State & Model
The playground manages a centralized configuration state:
- `heels`: number (`1 | 2 | 3 | 4`)
- `tolerance`: number (`12` to `48`)
- `width`: number (`260` to `480`)
- `height`: number (`120` to `240`)
- `seed`: optional number for deterministic regeneration
- `theme`:
  - `--heelslide-track-bg`: string
  - `--heelslide-track-active`: string
  - `--heelslide-handle-color`: string
  - `--heelslide-heel-color`: string
- `stats`:
  - `unlockCount`: number
  - `resetCount`: number
  - `lastState`: `idle` | `active` | `unlocked` | `reset`

## 4. Code Generation
Dynamic snippet generator for:
- Vanilla TypeScript (`@heelslide/core`)
- React (`@heelslide/react`)
- Vue 3 (`@heelslide/vue`)

Reflecting exact configuration parameters chosen by the user in the control panel.

## 5. Deployment Base Path
GitHub Pages deploys repository sites to `https://twoBoots.github.io/heelslide/`.
`vite.config.ts` will configure:
```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/heelslide/' : '/'
```
Ensuring assets load correctly both in local preview and on GitHub Pages.
