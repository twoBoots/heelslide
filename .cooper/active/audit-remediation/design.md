# Design: Whole-Project Audit Remediation

## 1. Engine Correctness (`packages/core`)

### 1.1 Unlock gate (H1)

`end()` currently unlocks on `progress >= 0.95` alone, which is satisfiable at the end of any
segment when the remaining segments are short. Reproduced on a `[100, 100, 5]` track: released
at the end of segment 1 with `progress = 0.9756`, yielding `state = unlocked` while
`currentSegmentIndex = 1` — the final segment was never entered.

The condition becomes conjunctive: the pointer must be on the last segment **and** at
`>= 0.95` of total length. The two-clause form (with its separate `0.9` threshold) is removed;
a single threshold on the last segment expresses the requirement directly.

### 1.2 Generator self-overlap (H2)

`tryGeneratePath` filters candidates with `segmentsIntersect(..., { excludeEndpoints: true })`.
That mode returns `false` for collinear overlap by construction, so a candidate that retraces
an earlier segment along the same row or column is accepted. Measured over 400 seeds: 0 strict
crossings, 99 collinear overlaps, 227 non-adjacent touches, 136/400 seeds affected.

The fix splits the test by adjacency, because the two cases need different rules:

- **Adjacent segments** legitimately share exactly one endpoint (the heel vertex). They must be
  checked with `excludeEndpoints: true` so that the shared vertex is not itself a rejection.
- **Non-adjacent segments** must share no point at all, so they are checked in default mode,
  which reports collinear overlap and touching.

`tryGeneratePath` builds the path incrementally and only ever compares the new candidate
against already-committed segments, so "adjacent" means "the immediately preceding segment".

### 1.3 Reset semantics (H4, H5)

`resetState()` assigns `state` directly and then calls `setState(state)`, which compares the
value against itself and no-ops — so no `onStateChange` ever fires for a reset. It also
restores `options.initialState`, meaning a tolerance breach on an engine constructed with
`initialState: 'unlocked'` lands back in `unlocked` with `progress = 1.0` while firing
`onReset`: a rejected gesture reporting success.

Reset is redefined as an unconditional transition to a known-safe state:

1. `resetState()` routes through `setState()` rather than assigning `state`, so subscribers
   are notified.
2. The target is always `'idle'`, never `options.initialState`. `initialState` keeps its
   meaning as *construction-time* seeding only.
3. `triggerReset()` passes through the `'reset'` state before settling on `'idle'`, making the
   `'reset'` member of `GestureState` reachable as the spec requires. Programmatic `reset()`
   goes straight to `'idle'`, since it is not a rejection.

### 1.4 Corner-cutting (M6)

The advancement branch checks `hasPassedHeel && nextProj.distance <= tolerance && nextProj.t > 0`
but never consults the distance to the *current* segment, so a pointer 50px off a
tolerance-24 segment advances cleanly. A `projection.distance <= tolerance` conjunct is added:
the pointer must be within tolerance of the segment it is leaving as well as the one it is
joining. This is what makes the corner a corner rather than a teleport.

### 1.5 Lifecycle (M4, M5)

- `regeneratePath()` reassigns `this.machine` without destroying the previous one, leaving its
  checkpoint timer armed; the orphan fires `onReset` against a discarded machine. The old
  machine is destroyed before replacement.
- `resumeAudio()` calls `getOrCreateAudioContext()` with no enablement check, constructing an
  `AudioContext` on first pointer-down even with sound disabled (the default). It returns early
  unless sound is enabled. `isSoundEnabled()` is promoted from private to a public predicate so
  the engine layer can ask without reaching into internals.

## 2. Adapter Parity (`packages/react`, `vue`, `svelte`)

### 2.1 React render loop (H3)

`useHeelslide` places `generator` and `track` — object references — in a `useMemo` dependency
array. With an inline literal every render produces a new engine; the `[engine]` effect then
calls `setTrack(engine.getPath())` with a fresh object, scheduling another render. Dormant on
mount (the first effect's `setTrack` bails out on `Object.is`), it becomes self-sustaining on
the first ordinary re-render and does not terminate — an unguarded probe exhausted the Node
heap.

The memo is keyed on a **structural signature** instead of object identity: the generator is
serialised to a stable string of its primitive fields, and an explicitly supplied `track` is
keyed by identity only when one is passed. Consumers may then pass inline literals, which is
how the hook is documented and the natural way to call it.

`<Heelslide />` already memoises `generatorOptions` internally, so it is unaffected either way;
this fixes the headless API that consumers actually touch directly.

### 2.2 Prop parity (M7)

The styleguides mandate that prop names and event semantics stay 100% consistent across
adapters. They currently diverge four ways. React is aligned to Vue/Svelte, which are already
consistent with each other and match the styleguide's documented `HeelslideProps`:

| Concern | React (before) | Unified |
|---|---|---|
| Sizing | `width`, `height` | `bounds?: Bounds`, with `width`/`height` retained as deprecated aliases |
| Class | `className` | `className` kept (React idiom; `class` is reserved) |
| Track override | absent | `track?: TrackPath` added |
| Initial state | React-only | `initialState` / `initialProgress` added to Vue and Svelte |

`width`/`height` are kept as accepted aliases rather than removed, so existing React consumers
do not break; `bounds` wins when both are supplied. Vue's internal inconsistency — the
`onCheckpoint` prop taking `(heelIndex, progress)` while the `checkpoint` emit takes an object
— is left alone deliberately: emits and callback props are distinct channels in Vue, and
changing the emit payload would be a gratuitous break.

### 2.3 React progress overlay and stylesheet (M8)

React renders no progress path (0 references, against 3 each in Vue and Svelte) and ships no
stylesheet, so the "active track highlight" the product guidelines require is simply absent.
A progress overlay path is added, computed from the same traversed-length arithmetic the other
adapters use, and `packages/react/src/style.css` is added mirroring the shared stylesheet with
a `./style.css` export. React's existing inline `var()` theming is retained — it was verified
working — so the stylesheet supplies defaults and the overlay, not a rewrite of the theming
strategy. The missing *Visual Progress Highlighting* requirement is added to the
`react-adapter` living spec, which had the same gap as the code.

## 3. Release & Versioning

- **M2:** `VERSION` is hardcoded in four `index.ts` files and asserted against the same literal
  in four tests, so the assertions cannot fail and drift is invisible. Each package's test is
  changed to compare its exported `VERSION` against its own `package.json` `version`, making
  the manifest the single source of truth and the assertion capable of failing.
- **M3:** `"@heelslide/core": "*"` publishes an unbounded range and defeats the `fixed`
  versioning policy. It becomes an exact `"0.2.0"`, which `changeset version` maintains on
  every bump.

## 4. Tooling & Gates

- **L1:** The `if npm run | grep -q '<script>'` guards turn a mandatory gate into a passing
  skip when a script is renamed; the scripts are invoked directly so a missing one fails.
  `npm run format:check || true` can never fail and is made to fail.
- **L3:** `typescript/no-explicit-any` is enabled to enforce the styleguide's own "Avoid `any`"
  rule, and the react plugin is enabled so hook-dependency mistakes like H3 are caught by lint
  rather than by a heap exhaustion. The two live `any`s are typed properly.
- **L4:** Per-file coverage thresholds are added beneath the global ones so a 6.7%-branch file
  cannot hide behind a 96.6% aggregate.
- **L2:** `tech-stack.md` is reconciled with reality (Node engine range, TypeScript version,
  the Svelte package, and the test libraries actually installed).
- **L6:** The workflow output is passed through `env:` rather than interpolated into `run:`.

## 5. Cooper Hygiene (L5)

Merged tracks are archived, their stale worktrees torn down, `tracks.md` reconciled, the
unregistered `accessibility-fallback` track registered as active, and the `release-pipeline`
living spec created from the delta that merged with PR #11 but was never promoted.
