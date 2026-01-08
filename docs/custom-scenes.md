# Adding Your Own Sketches (Scenes)

p5mv is designed so you can add your own p5 scenes using the existing file‑based system.

> A simpler CDN‑based system is planned, but this describes the current local‑file workflow.

## 1. Create a scene folder

Scenes live under `public/sketches/`:

```text
public/
  sketches/
    your-scene-id/
      info.js
      sketch.js
```

- `your-scene-id` should be a short identifier, e.g. `myScene`, `laser-grid`.

## 2. Define scene metadata (`info.js`)

`info.js` exports metadata about the scene, such as title, thumbnail, and inputs. For example:

```js
export default {
  id: 'myScene',
  title: 'My Custom Scene',
  thumb: 'thumb.png',
  color: '#f97316',
  inputs: [
    { id: 'backgroundColour', label: 'Background Colour', type: 'colour' },
    { id: 'strokeWeight', label: 'Stroke Weight', type: 'number', min: 0, max: 20 },
  ],
};
```

The exact structure should follow the existing scenes in `public/sketches/*/info.js` and the central `data/sketches.js` index.

## 3. Implement the p5 sketch (`sketch.js`)

`sketch.js` should export a p5 sketch that uses the p5mv runtime helpers. A typical pattern:

```js
import { createSketch } from 'p5mv-runtime'; // conceptual helper

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(p5mv.width, p5mv.height);
  };

  p.draw = () => {
    const bg = p5mv.inputs.backgroundColour; // hex colour
    const w = p5mv.inputs.strokeWeight;      // number

    p.background(bg);
    p.strokeWeight(w);
    // ...draw frame...
  };
};
```

In practice, follow the structure of an existing scene such as `public/sketches/matrix/sketch.js` to ensure you’re using the provided `p5mv` helpers correctly.

## 4. Register the scene

Scenes are indexed in the `data/sketches.js` file and/or via the `scripts/generate-sketches.js` script.

- Either add your scene manually to `data/sketches.js`, or
- Run the generator script (if configured) to pick up new `info.js` files:

```bash
npm run generate-sketches
```

Once registered, your custom scene appears in the **Scenes** page, and you can **select the desired sketch** when creating regions.

## 5. Sharing scenes and projects

- Use the **Save** button in the ribbon to download a `.pvm5Project` file containing your project data.
- Share both the `.pvm5Project` file and your `public/sketches/your-scene-id` folder with collaborators so they see the same visuals.
