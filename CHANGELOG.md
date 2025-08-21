# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-08-13
### Added
- Stable starter baseline with Astro 5.x, SCSS token system, and content collections.
- Accessibility patterns (skip link, focus styles, keyboardable menus).
- SEO utilities, default OG image, and RSS (optional).
- Netlify headers with sensible security defaults (CSP in Report-Only).
- Robots.txt that respects INDEXING and uses PUBLIC_SITE_URL for absolute sitemap.
- Style Guide page for visual QA.
- README with clone & go-live checklists; .env.example.

### Changed
- Consistent field names across content schema and pages (`publishDate`, `heroImage`).
- Site manifest icons and theme colour alignment.

### Fixed
- Build breakages from missing dependencies and truncated files.


## [1.1.0] – 2025-08-21
### Added
- Semantic theme tokens: `--bg-colour`, `--heading-colour`, `--text-colour`, `--link-colour`, `--border-colour`, etc.
- Header scheme controls + “pin only when solid”; `--nav-*` hooks.
### Changed
- Palette: `--colour--*` → `--palette--*`; expanded neutral scale.
### Fixed
- Styleguide grid overflow on small screens; cookie banner scheme theming.
### Docs
- README updates: maintenance/backport guidance, styleguide notes.