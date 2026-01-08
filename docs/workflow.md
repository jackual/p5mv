# Layout and Workflow

## Layout

- **Ribbon** (top): project actions, zoom controls, transport shortcuts, and page selection.
- **Timeline**: arrange regions on tracks against musical time.
- **Scenes**: browse preset scenes (p5 sketches) and inspect their inputs.
- **Render**: render the current project to a video file.

p5mv comes bundled with preset scenes so you can get started without writing any code.

## Core Workflow

1. Go to **Scenes** and **select the desired sketch**.
2. In the **Timeline**, add a region on a track and assign that scene.
3. Adjust region **length**, **position**, and **blend mode/opacity**.
4. Use the **Inspector** to edit that region’s inputs (sliders, colours, toggles, etc.).
5. Repeat with more tracks and regions to build your arrangement.
6. Open **Render**, queue the project, and click **Render**.
7. When encoding finishes, the video opens in your default video player.

## Timeline basics

- **Tracks**: horizontal lanes that hold regions.
- **Regions**: blocks on tracks that reference a scene and define when it is visible.
- **Playhead**: the current position in beats; used for editing and previewing.
- **Snap**: controls how the playhead and regions snap to the grid (set in the ribbon).

## Scenes and inputs

- Each scene is a p5 sketch with a unique **scene ID**.
- Scenes declare a set of **inputs** (e.g. `backgroundColour`, `strokeWeight`) that appear in the inspector.
- p5mv interpolates these inputs over time and passes them into the sketch for each frame.
