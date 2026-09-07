# Spec Delta: Documentation & Playground (`docs-playground`)

## Capability: Interactive Demonstration Playground

### Requirement: Documentation Header Version Badge
The documentation header MUST dynamically display the active version of the Heelslide package suite.

+ - **GIVEN** the documentation header loaded in the browser
+ - **WHEN** the header renders the title group badge
+ - **THEN** it MUST display `v` followed by the exported `VERSION` constant from `@heelslide/core`.
