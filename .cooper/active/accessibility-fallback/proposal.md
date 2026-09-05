# Proposal: Accessibility & Keyboard Navigation Fallback

## Problem Statement & Rationale

Heelslide is designed as an intentional-gesture security gate that prevents accidental touchscreen triggers (e.g. pocket presses, errant swipes) through dynamic 2D multi-segment path tracing with 90-degree directional turns ("heels").

However, path-based and multipoint gesture interfaces pose severe accessibility barriers for several user groups:
1. **Users with Motor Disabilities:** Individuals with tremors, limited dexterity, spasms, or motor control impairments cannot trace a narrow, multi-segment 2D path within tight pixel tolerance limits.
2. **Users Navigating via Keyboard / Switch Devices:** Standard 2D drag-and-drop pointer gestures cannot be operated via standard keyboard controls or single-switch access devices without discrete stepping or discrete activation fallbacks.
3. **Screen Reader Users (Visual Impairments):** Users who rely on screen readers (TalkBack, VoiceOver, NVDA, JAWS) cannot see the procedurally generated SVG path or visual heel markers to guide gestures.

Under **WCAG 2.2 Success Criterion 2.5.1 (Pointer Gestures - Level A)**, any functionality operable via multipoint or path-based gestures MUST also be operable through a single-pointer alternative without a path-based gesture, unless the path-based gesture is essential. Furthermore, **WCAG 2.2 Success Criterion 2.1.1 (Keyboard - Level A)** mandates full keyboard operability, and **WCAG 2.2 Success Criterion 4.1.2 (Name, Role, Value - Level A)** requires proper semantic roles, states, and real-time live region announcements.

Without an accessible fallback mechanism, Heelslide would render any critical action (such as approving transactions, deleting environments, or confirming medical actions) unusable for people with disabilities, preventing compliant enterprise adoption.

---

## User Benefits

- **Universal Access & Inclusion:** Enables full keyboard, switch-access, and screen reader participation in mission-critical web applications without compromising safety against accidental execution.
- **Regulatory Compliance:** Satisfies WCAG 2.2 AA (SC 2.1.1, SC 2.1.2, SC 2.5.1, SC 4.1.2) and Section 508 / European EN 301 549 requirements.
- **Intent Verification Parity:** Retains high-intent confirmation guarantees for accessibility modes (e.g., discrete step-by-step progression through each heel or an explicit accessible confirmation dialog with double verification), ensuring protection against unintentional triggers remains intact.
- **Seamless Framework Integration:** Provides zero-config, out-of-the-box accessible keyboard controls and ARIA live feedback across `@heelslide/core`, `@heelslide/react`, and `@heelslide/vue`.

---

## Scope Boundaries

### In Scope
1. **Core Engine Stepping & Accessibility API (`@heelslide/core`)**:
   - Discrete navigation stepping mechanism (`stepNext()`, `stepPrevious()`, `getAccessibleSteps()`, `getAccessibleDescription()`).
   - Directional step transition validation aligning with the rectilinear track segments.
   - Status announcement event emitter / hook (`onAnnouncement`) for screen reader live regions.
2. **React Adapter Accessibility (`@heelslide/react`)**:
   - Standard keyboard listeners (`ArrowRight`, `ArrowLeft`, `ArrowUp`, `ArrowDown`, `Home`, `End`, `Space`, `Enter`, `Escape`).
   - Embedded ARIA attributes (`role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, `aria-orientation`, `aria-keyshortcuts`).
   - Integrated visually-hidden ARIA live region (`aria-live="polite"`, `aria-atomic="true"`) announcing path instructions, heel reached milestones, resets, and unlock confirmations.
   - Accessible fallback mode selection prop (`accessibleFallback: 'stepped' | 'dialog' | 'custom'`).
   - Accessible confirmation fallback modal/dialog for direct intentional confirmation.
3. **Vue Adapter Accessibility (`@heelslide/vue`)**:
   - Keyboard interaction support in `useHeelslide` and `<Heelslide />`.
   - ARIA semantics, live region announcer, and accessible fallback props/slots matching the React API.
4. **Interactive Documentation & Playground**:
   - Keyboard navigation showcase, accessible fallback modal demo, and screen reader testing guidelines in `apps/docs`.

### Out of Scope
- External biometric authentication (WebAuthn/Passkeys), which belongs in application-level security layers.
- CAPTCHA or bot-detection mechanisms (Heelslide targets accidental human touch, not adversarial bot traffic).
- Third-party UI modal dependencies (all accessible dialog elements will remain lightweight and self-contained).
