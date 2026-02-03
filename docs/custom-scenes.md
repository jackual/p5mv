# Creating Custom Scenes

p5mv allows you to create and import your own p5.js scenes. Scenes are standard p5.js sketches that p5mv automatically converts and enhances for use in the timeline.

## Quick Start

The fastest way to create a custom scene:

1. Create a p5.js sketch using the [p5.js web editor](https://editor.p5js.org/) (or use the integrated **Editor** page)
2. Use the **Metadata Wizard** to define your scene's inputs and generate p5mv tags
3. Copy the generated tags into your sketch's HTML
4. Download your sketch as a folder (File > Download in the p5.js editor)
5. Import it into p5mv via the Scenes page

## Using the Metadata Wizard

The metadata wizard (magic wand icon in the ribbon) helps you create p5mv-compatible scenes:

1. Open the **Editor** page and create your sketch
2. Click the **magic wand icon** in the ribbon to open the metadata wizard
3. Define your scene:
   - **Scene name** – Auto-filled from your sketch title
   - **Custom inputs** – Add parameters that can be animated on the timeline
4. For each input, specify:
   - **ID** – Variable name (e.g., `bgColor`)
   - **Label** – Display name in Inspector (e.g., "Background Color")
   - **Type** – colour, number, int, float, percent, or text
   - **Default** – Initial value
5. Click **Copy to Clipboard** to get the complete metadata tags
6. In the p5.js editor, paste the tags into your HTML's `<head>` section
7. Download and import your sketch

The wizard generates two essential tags:
- `<script id="p5mv-json">` – Scene metadata and input definitions
- `<script src="...p5mv.js">` – p5mv capture library

## Using p5mv Inputs

The `p5mv` object is injected by p5mv's capture library and provides:
- **p5mv.width** – Canvas width from project settings
- **p5mv.height** – Canvas height from project settings
- **p5mv.i** – Current frame index
- **p5mv.percentElapsed** – Percentage through the region (0-100)
- **p5mv.[inputId]** – Any custom inputs you define

## Defining Inputs

Inputs are defined in the `<script id="p5mv-json">` tag.

### Example Schema

When using the metadata wizard, it generates tags like this:

```html
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.0/p5.js"></script>
  <script id="p5mv-json" type="application/json">
{
  "name": "My Custom Scene",
  "thumb": "thumb.jpg",
  "inputs": [
    {
      "id": "bgColor",
      "label": "Background Color",
      "type": "colour",
      "default": "#000000"
    },
    {
      "id": "circleSize",
      "label": "Circle Size",
      "type": "number",
      "default": 50
    },
    {
      "id": "circleCount",
      "label": "Circle Count",
      "type": "int",
      "default": 5
    }
  ]
}
  </script>
  <script src="https://cdn.jsdelivr.net/gh/jackual/music-tl/p5mv.js"></script>
</head>
<body>
  <script src="sketch.js"></script>
</body>
</html>
```

To use your customised inputs with animated parameters, use the `p5mv` object:

**sketch.js:**
```javascript
function setup() {
  createCanvas(600, 600)
}

function draw() {
  // Access p5mv inputs with fallback defaults
  const bgColor = p5mv.bgColor || '#000000'
  const circleSize = p5mv.circleSize || 50
  const circleCount = p5mv.circleCount || 5
  
  background(bgColor)
  fill(255)
  noStroke()
  
  for (let i = 0 i < circleCount i++) {
    const x = map(i, 0, circleCount - 1, 50, width - 50)
    circle(x, height/2, circleSize)
  }
}
```

### Always Use Fallbacks

Since your sketch might run standalone (outside p5mv), always provide fallback values:

```javascript
const myValue = p5mv.myInput || defaultValue
```

To edit inputs:
1. Select your scene from User Scenes or Project Scenes in the **Scenes** page
2. In the scene details sidebar, click on any input to edit its properties
3. Changes are automatically saved to the scene's metadata

Alternatively, you can edit manually:
1. Click **Show in Finder** to open the scene folder
2. Edit `index.html` and modify the JSON inside the `p5mv-json` script tag
3. Save and reload the app to see changes

Or use the **Metadata Wizard** to regenerate the entire metadata block.

### Input Types

p5mv supports six input types:

```js
| Type    | Description             | Example         |
|---------|-------------------------|-----------------|
| colour  | Hex color picker        | "#ff0000"       |
| number  | Numeric value (any)     | 1.5             |
| int     | Integer value           | 5               |
| float   | Floating-point value    | 3.14            |
| percent | Value between 0 and 1   | 0.5             |
| text    | Text string             | "hello"         |
```

Each input must have:
- **id** – Unique identifier used as `p5mv.[id]` in your sketch
- **label** – Display name in the Inspector
- **type** – One of the types above
- **default** – Initial value

## Importing Scenes

### From a Folder

1. Go to the **Scenes** page
2. Click the **+** card in User Scenes or Project Scenes
3. Select a folder containing `index.html`
4. Wait for conversion and thumbnail generation
5. The scene appears in your library

### From a Zip File

1. Create a `.zip` archive of your scene folder
2. Go to the **Scenes** page
3. Click the **+** card and select the zip file
4. The scene is extracted, converted, and imported automatically

## Scene Galleries

Scenes are organised into three galleries:

- **Default Scenes** – Built-in scenes that come with p5mv (read-only)
- **Project Scenes** – Saved with the current project (included in `.p5mvProject` files)
- **User Scenes** – Your personal library (`~/Videos/p5mv/Sketches/`)

Drag scenes between galleries to copy them, or use the action buttons in the sidebar.

## Advanced: Using p5mv.setup()

For quicker setup, use `p5mv.setup()`:

```javascript
function setup() {
  p5mv.setup() // Creates canvas with project dimensions
  // Your setup code here
}

function draw() {
  // Use p5mv inputs
  const color = p5mv.myColor || '#ff0000'
  background(color)
}
```

`p5mv.setup()` automatically:
- Creates a canvas matching project dimensions
- Sets pixel density to 1 (for consistent rendering)
- Configures the sketch for frame-by-frame capture

Pass `true` for WebGL mode: `p5mv.setup(true)`

## Tips

- **Use descriptive input IDs** – `strokeWidth` not `sw`
- **Provide sensible defaults** – Your scene should look good with default values
- **Test standalone first** – Verify your sketch works in the p5.js editor before importing
- **Use keyframe-friendly inputs** – Numeric and color inputs animate smoothly
- **Keep it simple** – Complex sketches with many particles may render slowly
- **Use noLoop() in p5mv** – p5mv handles frame rendering, so `noLoop()` is automatically called

## Editing Imported Scenes

Once imported, you can edit scenes:

1. **Show in Finder** – Open the scene folder to edit files directly
2. **Edit properties** – Modify input definitions in the UI (changes are saved to the `p5mv-json` script tag)
3. **Regenerate thumbnail** – Delete `thumb.png` and reimport

Changes to scene files are reflected immediately when you reload or render.