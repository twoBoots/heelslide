# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Repository Showcase & Live Demo Gateway
+ The repository README and project landing documentation MUST feature a prominent gateway linking directly to the live GitHub Pages playground deployment.
+ 
+ - **GIVEN** a developer visiting the repository README on GitHub
+ - **WHEN** viewing the top hero section
+ - **THEN** a prominent live demo link and badge MUST point directly to `https://twoboots.github.io/heelslide/`.
+ - **WHEN** consulting the README for integration instructions
+ - **THEN** quick-start installation commands and minimal starter code examples MUST be provided for React, Vue, and Svelte.
+ - **WHEN** reviewing advanced configuration features in the README
+ - **THEN** handle customization (nested icons and scoped slots), segmented multi-gesture checkpoints, and mobile responsiveness MUST be documented with code examples.
+ - **WHEN** inspecting CSS customization tokens in the README
+ - **THEN** the tokens table MUST include `--heelslide-handle-size`, `--heelslide-handle-shadow`, `--heelslide-handle-checkpoint-shadow`, and `--heelslide-handle-checkpoint-border-color`.
