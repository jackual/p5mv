# Introduction to p5mv

**p5mv** is an free open-source timeline editor for creating videos using **p5.js** sketches.
## Features

- **Visual timeline** for arranging p5.js scenes over musical time, allowing you to create music visuals set to a BPM
- A way to **set parameters** that feed into your sketch (colour, numbers, toggles, etc.) and have them interpolate smoothly.
- A **renderer** that captures frames and encodes them into a video file.
- A tool that comes bundled with a set of **preset scenes** (p5 sketches) you can use immediately.

## What p5mv is not

- Not a replacement for a full DAW or NLE (no audio editing, no complex compositing UI).
- Not a general‑purpose 3D or VFX suite.
- Not a live‑coding environment (it focuses on offline rendering from defined scenes).

## What is p5.js?

p5mv builds on top of **p5.js**, a JavaScript library for creative coding:

- Website: <https://p5js.org/>
- Reference: <https://p5js.org/reference/>

Each “scene” in p5mv is a p5 sketch that knows how to draw a frame for a given time and a set of inputs.
