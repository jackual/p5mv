# Creating Custom Scenes

p5mv allows you to create and import your own p5.js scenes. Scenes are standard p5.js sketches that p5mv automatically converts and enhances for use in the timeline.

## Quick Start

The simplest way to create a custom scene:

1. Create a p5.js sketch using the [p5.js web editor](https://editor.p5js.org/)
2. Download your sketch as a folder (File > Download)
3. Import it into p5mv via the Scenes page

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

```html
<html>
<head>
  <script src="externals/p5.js" data-p5mv-type="p5-core"></script>
  <script id="p5mv-json" type="application/json">
{
  "name": "My Custom Scene",
  "thumb": "thumb.png",
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
  <script src="externals/captureLib.js"></script>
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
1. Select your scene from User Scenes or Project Scenes
2. Click **Show in Finder** to open the scene folder
3. Edit `index.html` and modify the JSON inside the `p5mv-json` script tag
4. Save and reload the app to see changes

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

- **Project Scenes** – Saved with the current project (in temp directory, included in `.p5mvProject` files)
- **User Scenes** – Your personal library (`~/Videos/p5mv/Sketches/`)
- **Preset Scenes** – Built-in scenes (read-only, use `info.js` format instead of `p5mv-json`)

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