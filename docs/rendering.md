# Rendering to Video

When you start a render from the **Render** page, p5mv goes through three stages:

1. **Capture** – runs each scene in a headless browser and captures PNG frames for each region.
2. **Compose** – for multi‑track projects, composites region frames into full frames using blend modes and opacity.
3. **Encode** – uses FFmpeg to turn the frame sequence into an `output.mp4` file in your Movies folder.

p5mv then attempts to open the rendered video automatically in your default player.

## Progress indicators

The **Render** page shows progress bars for:

- **Regions** – overall region capture progress.
- **Current Region** – frame‑by‑frame progress for the active region.
- **Compositing** – progress through the composition stage (for multi‑track projects).
- **Encoding** – progress through the video encoding stage.

## Output location

- The final file is written as `output.mp4` into a `p5mv Videos` folder inside your user **Movies** directory.
- p5mv will attempt to open this file automatically in your default video player when encoding completes.
