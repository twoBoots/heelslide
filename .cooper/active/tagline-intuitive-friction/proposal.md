# Proposal: Brand Tagline Integration (`tagline-intuitive-friction`)

## Opportunity & Intent

Heelslide currently introduces itself with purely functional descriptors ("Intentional-gesture security gate UI component..."). While mechanically descriptive, it misses immediate philosophical and emotional positioning for high-stakes operational environments.

Integrating the brand tagline—`Intuitive friction, for interfaces with consequence.`—anchors the component's value proposition directly in intentional friction and high-gravity operations across developer entry points: the repository `README.md` and the live GitHub Pages documentation playground header.

---

## Ambition (How Might We...?)

> **How might we** present a cohesive, authoritative brand tagline across primary documentation touchpoints without losing functional clarity?

---

## User & Developer Experience

- **Visitor Context:** Developers and product engineers evaluating security gating components on GitHub or visiting the GitHub Pages demo.
- **Lead Framing:** Instantly conveys the core philosophy: friction is deliberate, ergonomic, and intended for destructive or irreversible actions.
- **Secondary Context:** Retains full technical clarity by presenting the existing functional description directly beneath the tagline.

---

## Scope Guardrails

### ✅ In-Scope (MVP Intent)

- **Repository README (`README.md`):** Update the lead blockquote under the `# Heelslide` heading to showcase `Intuitive friction, for interfaces with consequence.` as the primary lead line, followed by the functional component descriptor.
- **GitHub Pages Header (`apps/docs/src/components/Header.tsx`):** Add the tagline prominently to the header title group, structured cleanly alongside the dynamic version badge and functional description.
- **Automated Verification:** Update `apps/docs/src/readme.test.ts` and `apps/docs/src/App.test.tsx` (or header component tests) to enforce the presence of the tagline across both surfaces.

### ❌ Out-of-Scope

- Redesigning the GitHub Pages layout or CSS styling beyond typographic alignment for the new tagline.
- Modifying package descriptions in published `package.json` manifests or adapter library exports.
