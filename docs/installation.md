# Installation

p5mv is available as a prebuilt Electron app or can be run from source for development.

## Download Prebuilt App (Recommended)

Prebuilt app bundles are published on the GitHub Releases page:

**Releases:** <https://github.com/jackual/music-tl/releases>

Download the latest release for your platform

## macOS: Opening Unsigned Apps ("p5mv" Is Damaged And Can't Be Opened)

Since p5mv is not code-signed, macOS will show a security warning. To open the app:

### With System Settings

1. Open the app which will show a warning dialog

2. Open to System Settings.

3. Click Privacy & Security, scroll down and click the Open Anyway button

4. Select **Open** from the menu

5. Click **Open** in the dialog that appears

For more information, see Apple's guide: <https://support.apple.com/HT202491>

### With Terminal

Alternatively type the following with a space after into your Terminal and drag the p5mv app into the terminal to add the path

```bash
xattr -cr 

```


## Build from Source

For development or contributing, you can run p5mv directly from the repository.

### Prerequisites

- **Node.js** 16+ (LTS recommended)
- **npm** or compatible package manager

### Steps

```bash
# Clone the repository
git clone --depth 1 https://github.com/jackual/music-tl.git
cd music-tl

# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Package as Electron app
npm run package
```

### Development Commands

- `npm run dev` – Start Vite dev server + Electron with hot reload
- `npm run build` – Build production bundle
- `npm run package` – Create packaged Electron app
- `npm test` – Run test suite