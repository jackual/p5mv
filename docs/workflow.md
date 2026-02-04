## Basic Workflow

### 1. Set up your project

When no regions are selected, the Inspector shows project settings where you can configure:
  - **Title** – Project name
  - **BPM** – Beats per minute for timeline grid
  - **Width × Height** – Video resolution
  - **FPS** – Frame rate for rendered video

### 2. Create or import scenes

You have several options:

**Option A: Use the integrated p5.js editor**
- Go to the **Editor** page
- Create or modify your sketch in the embedded p5.js web editor
- Use the **Metadata Wizard** (or press **⌘M**) to:
  - Define your scene name and custom inputs
  - Generate the required p5mv metadata tags
  - Copy the tags to paste into your sketch's HTML
- Download your sketch from the p5.js editor
- Import it via the Scenes page

**Option B: Browse existing scenes**
- Go to the **Scenes** page
- Browse preset scenes, user scenes, or project scenes
- Click on a scene to view its details
- Drag and drop scenes between categories to copy them

**Option C: Import a local sketch**
- Go to the **Scenes** page
- Click the **+** card in User Scenes or Project Scenes
- Select your p5.js sketch folder
- The scene is automatically converted and ready to use

### 3. Add scenes to timeline

- Go to the **Timeline** page
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