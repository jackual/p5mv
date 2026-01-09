# Rendering to Video

## Rendering Workflow

1. Go to the **Render** page
2. Click **Set queue to project** to add all regions to the render queue
3. Click **Render** to start the process
4. Monitor progress bars for each stage
5. When complete, the video opens automatically in your default player

## How rendering works

When you render a project, p5mv captures frames from your p5.js sketches and encodes them into a video file. The rendering process consists of three stages that run sequentially.

### 1. Capture
- Runs each scene in a headless Chromium browser instance
- Captures PNG frames for every region on the timeline
- Evaluates keyframes to provide animated input values
- Saves frames to a temporary directory

### 2. Compose
- Combines frames from multiple tracks into composite frames
- Applies blend modes (normal, multiply, screen, overlay, etc.)
- Respects opacity settings for each region
- Only runs if you have multiple tracks (single-track projects skip this stage)

### 3. Encode
- Uses FFmpeg to convert the frame sequence to video
- Encodes to H.264 MP4 format
- Matches your project's FPS setting
- Outputs to `~/Movies/p5mv/Renders/output.mp4`

## Progress Indicators

The Render page shows real-time progress:

- **Regions** – Overall progress through all regions being captured
- **Current Region** – Frame-by-frame progress for the active region
- **Compositing** – Progress through the composition stage (multi-track only)
- **Encoding** – FFmpeg encoding progress

## Output Location

Rendered videos are saved to:
```
~/Movies/p5mv/Renders/output.mp4
```

The file opens automatically when rendering completes. You can also navigate to this folder manually to access previous renders.

## Performance Considerations

- **Resolution** – Higher resolutions (e.g., 1920×1080) take longer to render
- **Region count** – More regions means more frames to capture
- **Scene complexity** – Complex p5.js sketches render slower per frame
- **Multi-track** – Projects with multiple tracks require an additional compositing pass
- **FPS** – Higher frame rates increase the number of frames to render

## Troubleshooting

**Render fails or stalls:**
- Check the Console for error messages
- Ensure your scene sketches don't have runtime errors

**Output file location:**
- Always check `~/Movies/p5mv/Renders/` for the output
- The filename is currently fixed as `output.mp4` (overwrites previous renders)

**Video doesn't look as expected**

- Check the video in `~/Movies/p5mv/Renders/`