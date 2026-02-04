# Layout and Workflow

## Application Layout

The app consists of five main pages accessible via the ribbon or **View** menu:

### 1. Timeline Page
The main workspace for arranging and animating scenes:
- **Tracks** – Horizontal lanes that hold regions
- **Regions** – Blocks that reference a scene and define when/where it appears
- **Playhead** – Current position in beats for previewing and editing
- **Inspector** – Right sidebar showing details of selected regions

### 2. Scenes Page
Scene library browser with three categories:
- **Default Scenes** – Built-in scenes that come with p5mv
- **Project Scenes** – Scenes included with the current project
- **User Scenes** – Your personal scene library (`~/Videos/p5mv/Sketches/`)

### 3. Editor Page
Integrated p5.js web editor for creating and testing sketches:
- **Embedded p5.js editor** – Full-featured p5.js web editor
- **Metadata wizard** – Generate p5mv metadata tags for your sketches (Cmd+M)
- **URL persistence** – Automatically remembers your last viewed sketch

### 4. Render Page
Video rendering interface showing:
- Queue status
- Progress indicators (regions, composition, encoding)
- Render controls
- Output location

### 5. Help Page
Built-in documentation (what you're reading now!)

## Menu Bar

All functionality is now accessible via the native menu bar:

### File Menu
- **New Project** (Cmd+N) – Create a new project
- **Open Project** (Cmd+O) – Open an existing project file
- **Save Project** (Cmd+S) – Save the current project

### Edit Menu
Context-aware editing:
- Cut, Copy, Paste, Delete work on text when editing inputs
- Cut, Copy, Paste, Delete work on regions when on the timeline
- Delete works on selected scene when on the Scenes page
- **Select All** (Cmd+A) – Select all regions or all text depending on context

### View Menu
- **Switch pages** (Cmd+1-5) – Quickly navigate between Timeline, Scenes, Editor, Render, and Help
- **Zoom UI** (Cmd+Shift+/-, Cmd+0) – Adjust interface zoom level

### Timeline Menu (Timeline page only)
- **Zoom In/Out** (Cmd+/-, Cmd+-) – Adjust timeline zoom
- **Snap** submenu – Set grid snap value with musical note names
- **Playhead navigation** (Home, Left/Right arrows, Esc)

### Editor Menu (Editor page only)
- **Metadata Wizard** (Cmd+M) – Open the metadata wizard to generate p5mv tags

## Ribbon Controls

The streamlined ribbon provides:
- **Page selector** – Switch between Timeline, Scenes, Editor, Render, Help
- **Metadata Wizard button** – Opens the metadata wizard (Editor page only)

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
- If a scene with the same ID exists, you'll see an option to:
  - **Cancel** – Don't copy
  - **Replace** – Overwrite the existing scene

## Project Files

- **Save** projects as `.p5mvProject` files (File > Save or Cmd+S)
- These are zip archives containing:
  - Project data (tracks, regions, keyframes)
  - Scene folders for all project scenes
- **Open** projects to restore the complete state (File > Open or Cmd+O)
- Share project files with others to collaborate
