# Heelslide Product Guidelines

## Brand Voice & Tone
- **Tone**: Developer-centric, precision-driven, deterministic, and security-conscious.
- **Prose Style**: Concise, unambiguous, and focused on clear API contracts and ergonomics.

## User Experience (UX) Principles
- **Intentionality Over Artificial Friction**: The component acts as a high-confidence security gate. It must decisively reject unintentional 1D swipes (e.g. pocket brushing) while remaining fluid, intuitive, and responsive for deliberate user gestures.
- **Immediate Visual & Directional Feedback**: As the user drags the slider along the generated 2D path, real-time feedback (active track highlight, heel indicator cues, completion snaps) must clarify progress.
- **Fail-Safe & Deterministic Recovery**: Incomplete gestures, trajectory deviations outside tolerance thresholds, or touch cancellations must gracefully reset to the origin without leaving the component in an indeterminate state.
- **Complete Visual Customizability**: Visual appearance must be entirely driven by namespaced CSS custom properties (`--heelslide-*`), enabling seamless integration into any design system without style conflicts.
- **Accessible Alternatives**: Provide compliant accessible fallbacks (ARIA slider or multi-step confirmation dialogs) for users relying on keyboard navigation or assistive screen readers.

## Documentation & Markdown Standards
- Use GitHub Flavored Markdown.
- Ensure all internal links are valid relative paths.
- Document gesture state transitions with Mermaid diagrams.
