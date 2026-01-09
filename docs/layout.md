# Layout and Workflow

## Application Layout

The app consists of four main pages accessible via the ribbon:

### 1. Timeline Page
The main workspace for arranging and animating scenes:
- **Tracks** – Horizontal lanes that hold regions
- **Regions** – Blocks that reference a scene and define when/where it appears
- **Playhead** – Current position in beats for previewing and editing
- **Inspector** – Right sidebar showing details of selected regions

### 2. Scenes Page
Scene library browser with three categories:
- **Project Scenes** – Scenes included with the current project (stored in temp directory)
- **User Scenes** – Your personal scene library (`~/Videos/p5mv/Sketches/`)
- **Preset Scenes** – Built-in scenes that come with p5mv


### 3. Render Page
Video rendering interface showing:
- Queue status
- Progress indicators (regions, composition, encoding)
- Render controls
- Output location

### 4. Help Page
Built-in documentation (what you're reading now!)

## Ribbon Controls

The top ribbon provides:
- **File operations** – New, Open, Save project
- **Zoom controls** – Zoom in/out timeline
- **Transport** – Move playhead, go to start
- **Snap control** – Grid snap value (4, 1, 1/2, 1/3, 1/4, 1/8 beats)
- **Edit tools** – Copy, paste regions
- **Page selector** – Switch between Timeline, Scenes, Render, Help

## Scene Management

### Importing Scenes

From the **Scenes** page:
1. Click the **+** card in User Scenes or Project Scenes
2. Select a folder containing with your p5 sketch
3. The scene is automatically converted and added to the library
4. A thumbnail is generated automatically

### Managing Scene Properties

When viewing a scene in the right sidebar:
- **Edit scene name** – Click the pencil icon next to the title
- **Edit property names** – Click property labels to rename them
- **Add to project** – Copy a user/preset scene to your project
- **Show in Finder** – Open the scene folder in Finder (user/project scenes only)
- **Delete** – Remove a scene (user/project scenes only, presets cannot be deleted)

### Drag and Drop

- Drag scenes between categories to copy them
- If a scene with the same ID exists, you'll see options:
  - **Cancel** – Don't copy
  - **Replace** – Overwrite the existing scene
  - **Keep Both** – Copy with a unique name

## Project Files

- **Save** projects as `.p5mvProject` files (File > Save)
- These are zip archives containing:
  - Project data (tracks, regions, keyframes)
  - Scene folders for all project scenes
- **Open** projects to restore the complete state
- Share project files with others to collaborate
