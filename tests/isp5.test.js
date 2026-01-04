import fs from 'fs-extra';
import path from 'path';
import { isP5 } from '../lib/scene/prepareScene.js'

describe('isP5', () => {
    const OUT_DIR = path.join(__dirname, 'scene-convert', 'out');
    // All JS files in output and externals, with hardcoded expectations
    const expected = {
        'DBSCAN-Clustering-Simulation-master/p5.min.js': true,
        'DBSCAN-Clustering-Simulation-master/p5.dom.min.js': true,
        'DBSCAN-Clustering-Simulation-master/sketch.js': false,
        'Truth_badge_2025_12_03_01_45_59/externals/p5.js': true,
        'Truth_badge_2025_12_03_01_45_59/externals/p5.brush.js': false,
        'flurry_2025_12_28_19_47_08/externals/p5.js': true,
        'flurry_2025_12_28_19_47_08/externals/p5.sound.min.js': false,
        'vortex/externals/p5.js': true,
        '../../../lib/render/captureLib.js': false
    };

    for (const file of Object.keys(expected)) {
        it(`correctly identifies ${file} as p5: ${expected[file]}`, async () => {
            const filePath = path.join(OUT_DIR, file);
            // If file is empty, treat as empty string
            expect(await isP5(filePath)).toBe(expected[file]);
        });
    }
});
