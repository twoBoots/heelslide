# Proposal: Docs Demo Full Configuration & CSS Variable Parity

## Motivation & Problem Statement
Currently, the GitHub Pages documentation and demo application (`apps/docs`) acts as an interactive playground but exhibits notable parity gaps:
1. **Missing On-Page Documentation:** The demo does not render an on-page configuration and CSS variable reference table. Users visiting GitHub Pages must navigate away to the repository `README.md` to see the complete list of engine options, component props, and CSS custom properties.
2. **Incomplete Controls:** Only a subset of configuration options and CSS variables are adjustable in the UI. Options such as `gridStep`, `margin`, custom seed input, advanced border widths, track cap styles, and interaction state colors (`--heelslide-success-color`, `--heelslide-error-color`, active/checkpoint handle states) cannot be tested in the playground.
3. **CSS Variable Parity in Snippets:** The code snippet generator formats some theme properties into CSS styles for React, Vue, and Svelte, but omits dimensions (`--heelslide-width`, `--heelslide-height`), relying solely on component props, and does not reflect missing CSS variable tokens when customized.

## Proposed Solution
1. **Interactive Configuration Expansion:**
   - Add configurator inputs for procedural generator settings (`gridStep`, `margin`, and seed input/randomizer).
   - Add expanded controls for missing CSS variables: border widths (`handleBorderWidth`, `heelBorderWidth`, `targetHeelBorderWidth`, `goalBorderWidth`), track cap, and interaction state colors (`successColor`, `errorColor`).
2. **Live-Updated CSS Variable Snippets:**
   - Ensure all matching CSS variables (including `--heelslide-width`, `--heelslide-height`, and interaction tokens) are live-updated in real-time in React (`style`), Vue (`<style scoped>`), and Svelte (`<style>`) code blocks whenever controls or presets are adjusted.
3. **Comprehensive Documentation Section in Demo:**
   - Add an interactive, expandable "Configuration & CSS Variables Reference" tab/section directly in the demo below the code snippets, detailing every prop, callback, and `--heelslide-*` variable with types, defaults, and descriptions.

## User Benefit
Developers exploring Heelslide on GitHub Pages can immediately see all available options documented on-page, tweak any visual or procedural property with instant preview, and copy complete, idiomatic code snippets reflecting every configured CSS variable.
