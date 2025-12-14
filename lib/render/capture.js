import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { app } from 'electron';
import { beatsToFrameDuration } from '../timeUtils.js';
import Property from '../classes/Property.js';
import sketches from '../../data/sketches.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//region should export data into this function

export async function captureFrames(region, broadcastProgress = null) {
    // Coerce dims to numbers to avoid 0×0 canvases from string inputs
    const W = Number(region.project.meta.width ?? 800);
    const H = Number(region.project.meta.height ?? 600);
    if (!Number.isFinite(W) || !Number.isFinite(H) || W <= 0 || H <= 0) {
        throw new Error(`Invalid dims: got [${W}x${H}]. Expected positive integers.`);
    }

    const projectRoot = path.join(__dirname, '..', '..');

    // High-level: we can't use region.name in this file (no guarantee it's set),
    // but we can still broadcast coarse-grained stage messages.

    // Clean up previous outputs only when starting a fresh capture sequence
    const outputDir = path.join(projectRoot, 'output');
    const outputVideo = path.join(projectRoot, 'output.mp4');

    if (!region.progressIndex || region.progressIndex === 0) {
        broadcastProgress?.({ type: 'capture_stage', stage: 'cleanup_start', message: 'Cleaning previous outputs…' });

        await fs.remove(outputDir);
        await fs.remove(outputVideo);
    }

    // Calculate frame count using proper timeUtils function
    const frameCount = beatsToFrameDuration(region.length, region.project.meta.bpm, region.project.meta.fps);

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: `Loading scripts…` });

    // Build capture input object for the scene
    const captureInput = {
        scene: region.sceneId, // fallback to matrix if no scene
        frameCount: frameCount,
        dims: [W, H],
        region: {
            length: region.length,
            position: region.position,
            name: region.name,
            test: (i) => i * 2 // Example test input
        },
        inputs: region.inputs
    }

    const script = i => {
        let content
        if (typeof i == 'string') {
            content = i
        }
        else {
            content = fs.readFileSync(path.join(...i), 'utf8')
        }
        return `<script>${content}</script>`
    }

    let head

    if (sketches.find(s => s.id === region.sceneId).brush) {
        head = [[__dirname, 'p5.1.11.10.js'], [__dirname, 'p5.brush.js']]

    }
    else {
        head = [[projectRoot, 'node_modules', 'p5', 'lib', 'p5.min.js']]
    }

    head.push(`captureInput = ${JSON.stringify(captureInput)}`)
    head.push([__dirname, 'eases.js'])
    head.push([__dirname, 'captureLib.js'])

    head = head.map(i => script(i)).join('\n')

    const htmlString = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
    ${head}
</head>
<body>
  <main></main>
  ${script([projectRoot, 'public', 'sketches', region.sceneId || 'matrix', 'sketch.js'])}
</body>
</html>`.trim();

    // Use simple fixed temp directory
    const tempRoot = path.join(app.getPath('temp'), 'p5mv-render');
    const outDir = path.join(tempRoot, region.code);
    await fs.ensureDir(outDir);

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: 'Loading sandbox…' });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox',
            "--enable-webgl"
            // "--enable-gpu",
            // "--enable-accelerated-2d-canvas",
            // "--enable-gpu-rasterization",
            // "--use-gl=desktop"
        ]
    });

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: 'Loading page' });

    try {
        const page = await browser.newPage();
        page.on('console', msg => console.log(msg.text()));

        broadcastProgress?.({ type: 'capture_stage', stage: 'page_ready', message: 'Browser page created' });

        // Viewport matches canvas; disable HiDPI surprises in headless
        await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

        broadcastProgress?.({ type: 'capture_stage', stage: 'set_content', message: 'Loading sketch HTML…' });

        await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });

        // Wait for a real canvas with non-zero backing size
        await page.waitForFunction(() => {
            const c = document.querySelector('canvas');
            return !!(c && c.width > 0 && c.height > 0);
        });

        broadcastProgress?.({ type: 'capture_stage', stage: 'canvas_ready', message: 'Canvas initialized, starting frame capture…' });

        // Verify render entrypoint exists
        const hasRender = await page.evaluate(() => typeof window.renderFrame === 'function');
        if (!hasRender) throw new Error('renderFrame(i) not found in page');

        // Log actual canvas/backing dimensions once
        await page.evaluate(() => {
            const c = document.querySelector('canvas');
            console.log(`Canvas DOM: ${c.width}×${c.height}, CSS: ${c.style.width || '(auto)'}×${c.style.height || '(auto)'}`);
            // Helpful in WebGL cases: ensure preserveDrawingBuffer true in sketch if using WEBGL
        });

        for (let i = 0; i < frameCount; i++) {
            // 1) Render exactly one frame (no rAF; sketch should use noLoop()+redraw())
            // Also set a global frame index so captureLib can align; align p5's frameCount to the capture index
            await page.evaluate(idx => {
                // Set explicit capture index for libraries
                window.__frameIndex = idx;
                // Make sketches that rely on p5's frameCount align with the capture index (zero-based)
                try {
                    window.frameCount = idx - 1; // p5 will increment during redraw -> becomes idx inside draw()
                } catch (e) {
                    // ignore if not yet defined; redraw will still run
                }
                return window.renderFrame(idx);
            }, i);

            // 2) Pull an alpha-preserving PNG as raw bytes (serialisable)
            const bytes = await page.evaluate(async () => {
                const c = document.querySelector('canvas');
                if (!c || c.width === 0 || c.height === 0) return null;
                const blob = await new Promise(res => c.toBlob(res, 'image/png'));
                if (!blob) return null; // toBlob returns null for 0×0 or unsupported type
                const ab = await blob.arrayBuffer();
                return Array.from(new Uint8Array(ab)); // serialisable back to Node
            });

            if (!bytes || bytes.length === 0) {
                throw new Error(`Empty PNG at frame ${i}. Check canvas size and that draw() produced pixels.`);
            }

            // 3) Write to disk
            const buf = Buffer.from(bytes);
            const name = `f${String(i).padStart(6, '0')}.png`;
            await fs.writeFile(path.join(outDir, name), buf);

            // 4) Send progress update after successfully writing the frame
            if (region.onProgress) {
                region.onProgress(i + 1, frameCount);
            }
        }

    } finally {
        await browser.close();
    }

    return { success: true };
}