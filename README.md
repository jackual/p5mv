# p5mv

p5mv is a desktop tool for creating videos using p5.js sketches. It gives you a timeline, scenes, and an inspector UI so you can arrange sketches, tweak parameters, and render out video on macOS. The timeline is synced to a musical grid based on a set BPM so you can create visuals set to music.

## Features

- Scene/timeline editor for sequencing p5.js sketches
- Inspector panels for per-scene and global project settings
- Offline rendering pipeline (capture, composite, encode)

## Installation

### Prerequisites

- FFMpeg must be installed

### Downloads

Download macOS binaries from releases.

Consult this guide on running non code-signed apps: https://support.apple.com/en-gb/guide/mac-help/mh40616/mac

### Building from source

```bash
git clone https://github.com/jackual/p5mv.git
cd p5mv
npm install
npm run build
npm run package
```

Artifacts will be written under `out/make/`.