# Introduction to p5mv

**p5mv** is a free, open-source timeline editor for creating videos using **p5.js** sketches. It provides a musical timeline interface for sequencing animated scenes and rendering them to video.

## Key Features

- **Musical timeline** – Arrange scenes on tracks using a beat-based grid synced to BPM
- **Keyframe animation** – Animate scene parameters (colors, numbers, toggles) with easing curves
- **Scene library** – Browse preset scenes, user scenes, and project-specific scenes
- **Multi-track compositing** – Layer scenes with blend modes and opacity
- **Offline rendering** – Capture frames and encode to video using FFmpeg
- **Scene management** – Import, export, and edit scenes with an intuitive UI
- **Project files** – Save and share complete projects as `.p5mvProject` files

## What p5mv is not

- Not a DAW or audio editor (no audio timeline or mixing)
- Not a general-purpose NLE (focused on p5.js sketches only)
- Not a live-coding environment (renders offline from predefined scenes)
- Not a 3D or VFX application (though p5.js supports WebGL)

## What is p5.js?

p5mv is built on **p5.js**, a JavaScript library for creative coding:

- Website: <https://p5js.org/>
- Reference: <https://p5js.org/reference/>

Each "scene" in p5mv is a p5.js sketch that draws frames based on time and custom input parameters. The app provides the capture infrastructure and timeline interface for animating and compositing these sketches.
