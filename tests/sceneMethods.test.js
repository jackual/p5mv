import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertProject } from '../lib/scene/prepareScene.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCENE_SRC = path.join(__dirname, 'scene-convert', 'in');
const SCENE_OUT = path.join(__dirname, 'scene-convert', 'out');

describe('convertProject', () => {
    beforeAll(async () => {
        // Clean output dir
        await fs.remove(SCENE_OUT);
        await fs.ensureDir(SCENE_OUT);
        // Copy all test scenes in
        await fs.copy(SCENE_SRC, SCENE_OUT);
    });

    it('converts all scenes in test-scenes-out without error', async () => {
        const dirs = (await fs.readdir(SCENE_OUT, { withFileTypes: true }))
            .filter(d => d.isDirectory())
            .map(d => d.name);
        for (const dir of dirs) {
            const scenePath = path.join(SCENE_OUT, dir);
            await expect(convertProject(scenePath)).resolves.not.toThrow();
        }
    }, 30000); // 30 second timeout for scene conversion
});
