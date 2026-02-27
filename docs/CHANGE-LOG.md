# Changelog
All notable changes to **Checkers4Pi** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Planned Features
- **Tactic of the Day:** Daily strategy snapshots (e.g., "Forced Jump" traps) to increase Pioneer engagement and Pi Browser utility.
- **Pioneer-vs-Pioneer:** Asynchronous multiplayer mode utilizing the Pi SDK for secure matchmaking.

## [1.1.0] - 2026-02-26
### Fixed
- **Pi Payment Flow:** Resolved `onReadyForServerApproval` callback never firing
  - Root cause 1: `PI_API_KEY` in Vercel was truncated (portal UI doesn't scroll) — regenerated full 64-char key
  - Root cause 2: `sandbox: true` in `Pi.init` must be `sandbox: false` when app is hosted outside the Pi Network sandbox tool (GitHub Pages / Vercel)
  - Root cause 3: Pi Developer Portal "Production URL" must be set to the Vercel backend URL (`checkers4-pi.vercel.app`), not the GitHub Pages frontend URL
- **GitHub Pages Deployment:** Replaced broken Jekyll default builder with proper GitHub Actions Vite build workflow
- **Single Repo:** Consolidated from two repos (`Games4Pi` + `b-r-s.github.io`) into one (`b-r-s/b-r-s.github.io`) — Vercel and GitHub Pages both deploy from the same source
- **Auth Hang:** Fixed double `Pi.authenticate()` call by storing auth promise in a ref on mount and reusing it in `createPayment`

### Changed
- `Pi.init({ version: '2.0', sandbox: false })` — correct setting for production-hosted apps
- `Pi.authenticate` now called on app mount (not lazily on first payment tap)
- Vercel reconnected to `b-r-s/b-r-s.github.io` repo for auto-deployment

## [1.0.0] - 2026-01-20
### Added
- **Core Engine:** Custom Minimax AI with Alpha-Beta pruning for high-performance play.
- **Pi Integration:** Authentication via Pi SDK and Sandbox compatibility.
- **Customization:** Built-in selector for 6 checker variations and 4 board color themes.
- **Mobile UI:** Responsive board design optimized for the Pi Browser environment.
- **Compliance Docs:** Added Privacy Policy and AI Strategy documentation.
- **Security:** Implemented Data Minimization standards for Pioneer safety.

### Changed
- Refactored AI logic to use Web Workers to ensure smooth UI performance on mobile devices.
- Updated branding and color palettes to comply with Pi Network 2026 Trademark Guidelines.

### Fixed
- Resolved "ghost piece" bug during rapid capture moves.
- Fixed UI scaling issues on ultra-small smartphone screens.