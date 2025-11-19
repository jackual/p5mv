import { Canvas, Image } from 'skia-canvas';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compositeFrames(array, frameNumber, width, height) {

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  const projectRoot = path.join(__dirname, '..', '..');

  const frameFileName = i => `f${String(i).padStart(6, '0')}.png`

  const data = array.map(region => {
    return {
      code: region[0],
      start: region[1],
      opacity: region[3],
      blendMode: region[4]
    }
  })
  const images = await Promise.all(
    data.map(async region => {
      const img = new Image();
      img.src = path.join(projectRoot, 'output', region.code, frameFileName(frameNumber - region.start));
      await img.decode();
      return img;
    })
  )

  data.forEach((region, index) => {
    ctx.globalAlpha = region.opacity
    ctx.globalCompositeOperation = region.blendMode
    ctx.drawImage(images[index], 0, 0, width, height)
  })

  const buffer = await canvas.png;  // also supports .jpeg, .webp
  const outputPath = path.join(projectRoot, 'output', 'frames', frameFileName(frameNumber));
  await fs.ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, buffer);
}

const compositeFromData = async (data, width, height, frames) => {
  const getFrameFromExport = (data, frame) => {
    return data.flat().filter(region => {
      return frame >= region[1] && frame < region[1] + region[2]
    }).reverse()
  }
  for (let frameNumber = 0; frameNumber < frames; frameNumber++) {
    await compositeFrames(getFrameFromExport(data, frameNumber), frameNumber, width, height);
  }
  return true
}

export { compositeFromData, compositeFrames }