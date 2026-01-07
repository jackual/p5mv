import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDom } from '../lib/scene/utils.js';
import { readProjectInfo } from '../lib/scene/sceneInfo.js';
import { generateThumbnailForScene, convertProject } from '../lib/scene/prepareScene.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCENE_SRC = path.join(__dirname, 'scene-convert', 'in');
const SCENE_OUT = path.join(__dirname, 'test-scenes-out');

describe('generateThumbnailForScene', () => {
    beforeAll(async () => {
        await fs.ensureDir(SCENE_OUT);
    });

    it('generates thumbnail and updates project info', async () => {
        const testSceneSrc = path.join(SCENE_SRC, 'Complex_lamprey_2026_01_06_00_30_52');
        const testSceneOut = path.join(SCENE_OUT, 'thumbnail-test-1');

        expect(await fs.pathExists(testSceneSrc)).toBe(true);

        await fs.remove(testSceneOut);
        await fs.copy(testSceneSrc, testSceneOut);

        // First run convertProject to set up the scene
        await convertProject(testSceneOut);

        // Now test generateThumbnailForScene separately
        await generateThumbnailForScene(testSceneOut);

        // Check that thumb.png was created
        const thumbPath = path.join(testSceneOut, 'thumb.png');
        expect(await fs.pathExists(thumbPath)).toBe(true);

        // Check that it's a valid PNG file (starts with PNG signature)
        const thumbBuffer = await fs.readFile(thumbPath);
        const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
        expect(thumbBuffer.slice(0, 4).equals(pngSignature)).toBe(true);

        // Check that project info was updated with thumbnail reference
        const indexHtml = path.join(testSceneOut, 'index.html');
        const dom = await getDom(indexHtml);
        const info = await readProjectInfo(dom);

        expect(info).not.toBeNull();
        expect(info.thumbnail).toBe('thumb.png');
    });

    it('handles thumbnail generation for another scene', async () => {
        const testSceneSrc = path.join(SCENE_SRC, 'Thirsty_attack_2026_01_06_00_31_21');
        const testSceneOut = path.join(SCENE_OUT, 'thumbnail-test-2');

        expect(await fs.pathExists(testSceneSrc)).toBe(true);

        await fs.remove(testSceneOut);
        await fs.copy(testSceneSrc, testSceneOut);

        await convertProject(testSceneOut);
        await generateThumbnailForScene(testSceneOut);

        const thumbPath = path.join(testSceneOut, 'thumb.png');
        expect(await fs.pathExists(thumbPath)).toBe(true);

        // Verify file size is reasonable (not empty, not too large)
        const stats = await fs.stat(thumbPath);
        expect(stats.size).toBeGreaterThan(0);
        expect(stats.size).toBeLessThan(1024 * 1024 * 5); // Less than 5MB
    });

    it('preserves existing project info when adding thumbnail', async () => {
        const testSceneSrc = path.join(SCENE_SRC, 'Complex_lamprey_2026_01_06_00_30_52');
        const testSceneOut = path.join(SCENE_OUT, 'thumbnail-preserve-info');

        expect(await fs.pathExists(testSceneSrc)).toBe(true);

        await fs.remove(testSceneOut);
        await fs.copy(testSceneSrc, testSceneOut);

        await convertProject(testSceneOut);
        await generateThumbnailForScene(testSceneOut);

        const indexHtml = path.join(testSceneOut, 'index.html');
        const dom = await getDom(indexHtml);
        const info = await readProjectInfo(dom);

        // Should have both name and thumbnail
        expect(info.name).toBeDefined();
        expect(info.thumbnail).toBe('thumb.png');
        // Name is based on the output directory name
        expect(info.name).toBe('Thumbnail Preserve Info');
    });
});