import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { app } from 'electron';
import { beatsToFrameDuration } from '../timeUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generic frame renderer - can be used for thumbnails, previews, or full renders
 * @param {Object} options - Render options
 * @param {string} options.sceneId - Scene identifier
 * @param {string} options.scenePath - Path to the scene directory containing index.html
 * @param {string} options.outDir - Output directory for rendered frames
 * @param {number} options.frameCount - Number of frames to render
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @param {Object} options.captureInput - Data to inject into the page as window.captureInput
 * @param {Function} [options.onProgress] - Progress callback (frameIndex, totalFrames)
 * @param {Function} [options.broadcastProgress] - Stage progress broadcaster
 * @param {boolean} [options.cleanOutputs=false] - Whether to clean previous outputs
 * @returns {Promise<{success: boolean}>}
 */
export async function renderFrames(options) {
    const {
        sceneId,
        scenePath,
        outDir,
        frameCount,
        width,
        height,
        captureInput,
        onProgress = null,
        broadcastProgress = null,
        cleanOutputs = false
    } = options;

    // Coerce dims to numbers to avoid 0×0 canvases from string inputs
    const W = Number(width ?? 800);
    const H = Number(height ?? 600);
    if (!Number.isFinite(W) || !Number.isFinite(H) || W <= 0 || H <= 0) {
        throw new Error(`Invalid dims: got [${W}x${H}]. Expected positive integers.`);
    }

    const projectRoot = path.join(__dirname, '..', '..');

    // Clean up previous outputs only when starting a fresh capture sequence
    if (cleanOutputs) {
        const outputDir = path.join(projectRoot, 'output');
        const outputVideo = path.join(projectRoot, 'output.mp4');

        broadcastProgress?.({ type: 'capture_stage', stage: 'cleanup_start', message: 'Cleaning previous outputs…' });

        await fs.remove(outputDir);
        await fs.remove(outputVideo);
    }

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: `Loading scripts…` });

    // Verify scene path exists
    if (!await fs.pathExists(scenePath)) {
        throw new Error(`Scene path not found for ${sceneId}. Path: ${scenePath}`);
    }

    const indexHtmlPath = path.join(scenePath, 'index.html');
    if (!await fs.pathExists(indexHtmlPath)) {
        throw new Error(`index.html not found in scene directory: ${scenePath}`);
    }

    // Ensure output directory exists
    await fs.ensureDir(outDir);

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: 'Loading sandbox…' });

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--allow-file-access-from-files',
            '--disable-web-security'
        ]
    });

    broadcastProgress?.({ type: 'capture_stage', stage: 'prepare_browser', message: 'Loading page' });

    try {
        const page = await browser.newPage();
        page.on('console', msg => console.log('Browser console:', msg.text()));
        page.on('pageerror', error => console.error('Page error:', error.message));
        page.on('requestfailed', request => console.error('Request failed:', request.url(), request.failure().errorText));

        broadcastProgress?.({ type: 'capture_stage', stage: 'page_ready', message: 'Browser page created' });

        // Viewport matches canvas; disable HiDPI surprises in headless
        await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

        // Inject captureInput before loading the page
        await page.evaluateOnNewDocument((captureInputData) => {
            window.captureInput = captureInputData;
        }, captureInput);

        broadcastProgress?.({ type: 'capture_stage', stage: 'set_content', message: 'Loading sketch HTML…' });

        // Navigate to the scene's index.html using file:// protocol
        try {
            await page.goto(`file://${indexHtmlPath}`, {
                timeout: 30000
            });
        } catch (error) {
            console.error('Failed to load sketch HTML:', error.message);
            console.error('Index path:', indexHtmlPath);
            throw new Error(`Failed to load sketch: ${error.message}`);
        }

        // Wait for a real canvas with non-zero backing size
        await page.waitForFunction(() => {
            const c = document.querySelector('canvas');
            return !!(c && c.width > 0 && c.height > 0);
        });

        broadcastProgress?.({ type: 'capture_stage', stage: 'canvas_ready', message: 'Canvas initialized, starting frame capture…' });

        // Log actual canvas/backing dimensions once
        await page.evaluate(() => {
            const c = document.querySelector('canvas');
            console.log(`Canvas DOM: ${c.width}×${c.height}, CSS: ${c.style.width || '(auto)'}×${c.style.height || '(auto)'}`);
        });

        for (let i = 0; i < frameCount; i++) {
            // 1) Render exactly one frame (no rAF; sketch should use noLoop()+redraw())
            await page.evaluate(idx => {
                window.__frameIndex = idx;
                try {
                    window.frameCount = idx - 1;
                } catch (e) {
                    // ignore if not yet defined
                }
                return window.renderFrame(idx);
            }, i);

            // 2) Pull an alpha-preserving PNG as raw bytes (serialisable)
            const bytes = await page.evaluate(async () => {
                const c = document.querySelector('canvas');
                if (!c || c.width === 0 || c.height === 0) return null;
                const blob = await new Promise(res => c.toBlob(res, 'image/png'));
                if (!blob) return null;
                const ab = await blob.arrayBuffer();
                return Array.from(new Uint8Array(ab));
            });

            if (!bytes || bytes.length === 0) {
                throw new Error(`Empty PNG at frame ${i}. Check canvas size and that draw() produced pixels.`);
            }

            // 3) Write to disk
            const buf = Buffer.from(bytes);
            const name = `f${String(i).padStart(6, '0')}.png`;
            await fs.writeFile(path.join(outDir, name), buf);

            // 4) Send progress update after successfully writing the frame
            if (onProgress) {
                onProgress(i + 1, frameCount);
            }
        }

    } finally {
        await browser.close();
    }

    return { success: true };
}

/**
 * Capture frames for a region - wrapper around renderFrames for region-based rendering
 * @param {Object} region - Region object with project metadata and scene info
 * @param {Function} [broadcastProgress] - Stage progress broadcaster
 * @returns {Promise<{success: boolean}>}
 */
export async function captureFrames(region, broadcastProgress = null) {
    const W = Number(region.project.meta.width ?? 800);
    const H = Number(region.project.meta.height ?? 600);

    // Calculate frame count using proper timeUtils function
    const frameCount = beatsToFrameDuration(region.length, region.project.meta.bpm, region.project.meta.fps);

    // Build capture input object for the scene
    const captureInput = {
        scene: region.sceneId,
        frameCount: frameCount,
        dims: [W, H],
        region: {
            length: region.length,
            position: region.position,
            name: region.name,
            test: (i) => i * 2
        },
        inputs: region.inputs
    };

    // Get the scene directory path from open-project temp directory
    const scenePath = path.join(app.getPath('temp'), 'open-project', 'sketches', region.sceneId);

    // Use simple fixed temp directory for output
    const tempRoot = path.join(app.getPath('temp'), 'p5mv-render');
    const outDir = path.join(tempRoot, region.code);

    return renderFrames({
        sceneId: region.sceneId,
        scenePath,
        outDir,
        frameCount,
        width: W,
        height: H,
        captureInput,
        onProgress: region.onProgress,
        broadcastProgress,
        cleanOutputs: !region.progressIndex || region.progressIndex === 0
    });
}