## Basic Workflow

### 1. Set up your project

- Set project metadata in the Inspector when no regions are selected:
  - Title
  - BPM (beats per minute)
  - Width × Height (resolution)
  - FPS (frame rate)

### 2. Browse and select scenes

- Go to the **Scenes** page
- Browse preset scenes or import your own
- Click on a scene to view its details in the right sidebar
- **Drag and drop into Project Scenes to use in project**

### 3. Add scenes to timeline

- Go back to **Timeline**
- Click and drag on a track to create a region
- With the region selected, choose a scene from the Inspector dropdown
- Resize the region by dragging its edges
- Move it by dragging the center

### 4. Customise scene parameters

- Select a region on the timeline
- In the Inspector, you'll see all inputs for that scene
- Set values using the form controls
- Click the **+** icon to create a keyframe at the current playhead position
- Move the playhead and set different values to create animation

### 5. Layer and composite

- Add regions to multiple tracks
- Regions on higher tracks appear on top
- Use the **Blend Mode** dropdown to change how layers composite
- Adjust **Opacity** to make layers semi-transparent

### 6. Render to video

- Go to the **Render** page
- Click **Set queue to project** to queue all regions
- Click **Render** to start the capture/encode process
- When complete, the video opens automatically in your default player
- Find the output at: `~/Movies/p5mv/Renders/output.mp4`