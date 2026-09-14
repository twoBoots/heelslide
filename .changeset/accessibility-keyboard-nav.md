---
'@heelslide/core': minor
'@heelslide/react': minor
'@heelslide/vue': minor
'@heelslide/svelte': minor
---

Add keyboard operation and complete ARIA semantics across every adapter.

All adapters declared `role="slider"` while binding no keyboard handlers, so the accessibility
tree advertised an operable range widget that could not be operated without a pointer. That is now
closed.

**Core** gains discrete stepping (`stepForward`, `stepBackward`, `stepToNextHeel`), semantic path
description (`getAccessibleSteps`, `getAccessibleDescription`), a structured announcement lifecycle
(`onAnnouncement`), and a shared key map (`resolveKeyAction`) so the adapters cannot drift apart.

**React, Vue and Svelte** gain the full key map, `tabindex`, `aria-valuetext`, `aria-orientation`,
`aria-keyshortcuts`, `aria-describedby`, a polite live region, a themeable focus indicator, and an
`accessibleFallback` prop (`stepped` | `custom`). The slider contract now sits on the container in
all three; the handle is presentational. Vue additionally gains the `aria-disabled` it was missing.

Stepping advances progress only — unlock still requires an explicit confirm through the same code
path pointer release uses, so both input modes share one unlock condition.

In segmented mode the checkpoint inactivity timer is suspended while the keyboard is driving, so
pausing to hear an announcement never costs progress.

Additive and backwards compatible: pointer behaviour and rendered output are unchanged.

Targets WCAG 2.2 SC 2.1.1, 2.1.2, 2.2.1, 2.4.7, 2.5.1 and 4.1.2.
