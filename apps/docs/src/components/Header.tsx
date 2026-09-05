export function Header() {
  return (
    <header className="header">
      <div className="header-title-group">
        <h1>
          <span>Heelslide</span>
          <span className="header-badge">v0.1.0</span>
        </h1>
        <p className="header-tagline">
          Intentional-gesture security gate component preventing in-pocket and accidental activations
          via procedurally generated 90-degree rectilinear heel tracks.
        </p>
      </div>
      <div className="header-links">
        <a
          href="https://github.com/twoBoots/heelslide"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          GitHub Repository
        </a>
      </div>
    </header>
  );
}
