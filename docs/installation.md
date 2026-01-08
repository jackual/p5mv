# Installation

> These instructions are intended for GitHub as well as the in‑app Help page. Some details may change as releases are added.

## Download a prebuilt binary (recommended)

Prebuilt app bundles will be published on the GitHub Releases page:

- Releases: `https://github.com/jackual/music-tl/releases`

Download the latest release for your platform (for example, a `.dmg` or `.zip` for macOS) and open the app.

### macOS: opening a non‑codesigned app

If you see a warning that the app is from an unidentified developer, follow Apple’s guidance on opening apps from unidentified developers:

- Apple support article: <https://support.apple.com/HT202491>

Typically you will need to:

1. Right‑click the app in Finder and choose **Open**.
2. Confirm that you want to open it despite the warning.

## Build from source

You can also run p5mv directly from this repository.

### Prerequisites

- Node.js (LTS is recommended).
- npm or a compatible package manager.

### Steps

```bash
git clone https://github.com/jackual/music-tl.git
cd music-tl
npm install

# During development
npm run dev

# For a packaged app (Electron in production)
npm run build
npm start
```

`npm run dev` starts Vite and Electron together, giving you a live‑reload development environment.
