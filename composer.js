import { Canvas, Image } from 'skia-canvas';
import fs from 'fs';

async function composite() {
  // Create a canvas the size of your target frame
  const width = 1920;
  const height = 1080;
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  const img1 = new Image();
  img1.src = 'output/frames/f000000.png';
  await img1.decode();

  const img2 = new Image();
  img2.src = 'output/matrix/f000000.png';
  await img2.decode();

  // Draw first image (background)
  ctx.drawImage(img1, 0, 0, width, height);

  // Set blending mode and opacity for the second image
  ctx.globalCompositeOperation = 'difference';  // e.g. multiply, overlay, screen, etc.
  ctx.globalAlpha = 1;                      // opacity 0.0–1.0

  // Draw second image
  ctx.drawImage(img2, 0, 0, width, height);

  // Export result
  const buffer = await canvas.png;  // also supports .jpeg, .webp
  fs.writeFileSync('composite.png', buffer);
}

composite().catch(err => {
  console.error(err);
  process.exit(1);
});