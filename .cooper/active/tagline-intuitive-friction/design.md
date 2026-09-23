# Technical Design: Brand Tagline Integration (`tagline-intuitive-friction`)

## 1. Overview & Architecture

This track introduces the brand tagline across the two primary developer documentation surfaces:
1. `README.md` (root repository showcase)
2. `apps/docs/src/components/Header.tsx` (GitHub Pages interactive playground header)

The changes are purely presentational and documentation-focused, requiring no core engine or adapter logic modifications.

---

## 2. Touchpoint Details

### 2.1 Repository `README.md`

Under the top-level `# Heelslide` heading, the existing blockquote is updated from:

```markdown
# Heelslide

> Intentional-gesture security gate UI component for touchscreen web applications.
```

To:

```markdown
# Heelslide

> Intuitive friction, for interfaces with consequence.
>
> Intentional-gesture security gate UI component for touchscreen web applications.
```

### 2.2 GitHub Pages Header (`apps/docs/src/components/Header.tsx`)

In the documentation application's header title group, the tagline is introduced directly below the `<h1>` heading as a distinct tagline element, while retaining the functional description paragraph below it:

```tsx
<div className="header-title-group">
  <h1>
    <span>Heelslide</span>
    <span className="header-badge">v{VERSION}</span>
  </h1>
  <p className="header-tagline">
    Intuitive friction, for interfaces with consequence.
  </p>
  <p className="header-description">
    Intentional-gesture security gate component preventing in-pocket and accidental activations
    via procedurally generated 90-degree rectilinear heel tracks.
  </p>
</div>
```

### 2.3 CSS Adjustments (`apps/docs/src/styles.css`)

Ensure typography for `.header-tagline` and `.header-description` has clear hierarchy (e.g. font weight, color, margin) so the tagline reads as a crisp punchy subhead while the functional text provides muted supporting detail.

---

## 3. Test Strategy (TDD)

1. **README Harness (`apps/docs/src/readme.test.ts`):**
   - Add unit test assertion verifying that `README.md` contains `"Intuitive friction, for interfaces with consequence."` in the hero section immediately following `# Heelslide`.
2. **Docs App Harness (`apps/docs/src/App.test.tsx`):**
   - Add assertion verifying that the rendered header contains `"Intuitive friction, for interfaces with consequence."`.
