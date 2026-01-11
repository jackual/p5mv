# p5mv

[![Tests](https://github.com/jackual/p5mv/actions/workflows/test.yml/badge.svg)](https://github.com/jackual/p5mv/actions/workflows/test.yml)

**p5mv** is a free, open-source timeline editor for creating videos using **p5.js** sketches. It provides a musical timeline interface for sequencing animated scenes and rendering them to video.

## Documentation

- [Introduction](docs/intro.md) - Getting started with p5mv
- [Installation](docs/installation.md) - Download and setup instructions
- [Layout](docs/layout.md) - Understanding the interface
- [Workflow](docs/workflow.md) - Creating projects and working with scenes
- [Keyframes](docs/keyframes.md) - Animating properties over time
- [Rendering](docs/rendering.md) - Exporting your project to video
- [Keyboard Shortcuts](docs/shortcuts.md) - Speed up your workflow
- [Custom Scenes](docs/custom-scenes.md) - Creating your own p5.js sketches

## Quick Start

### Downloads

Download macOS binaries from [releases](https://github.com/jackual/p5mv/releases).

If you are having trouble opening the app, [read this guide on running non code-signed apps](https://support.apple.com/en-gb/guide/mac-help/mh40616/mac) or consult the [installation](docs/installation.md) docs

### Building from source

```bash
git clone https://github.com/jackual/p5mv.git
cd p5mv
npm install
npm run build
npm run package
```

Artifacts will be written under `out/make/`.