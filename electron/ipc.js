import { app, ipcMain, shell } from 'electron';
import path from 'path';
import { captureFrames } from '../lib/render/capture.js';
import { compositeFromData, cleanupTempDirectory } from '../lib/composer/composer.js';
import { encodeFramesToVideo } from '../lib/render/encoder.js';

export function registerIpcHandlers(broadcastProgress) {
    // Capture frames for a single region
    ipcMain.handle('render-capture', async (event, { region, project }) => {
        try {
            const regionWithProject = {
                ...region,
                project: project,
                onProgress: (currentFrame, totalFrames) => {
                    broadcastProgress({
                        type: 'region_progress',
                        currentFrame: currentFrame,
                        totalFrames: totalFrames,
                        progress: (currentFrame / totalFrames) * 100,
                    });
                },
            };
            const result = await captureFrames(regionWithProject, broadcastProgress);
            return { success: true, result };
        } catch (error) {
            console.error('Capture error:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    });

    // Composite captured frames into a sequence
    ipcMain.handle('render-composer', async (event, { regions, project }) => {
        try {
            console.log('Composer called with:', {
                regionsCount: regions?.length,
                width: project.meta.width,
                height: project.meta.height,
                totalFrames: project.meta.totalFrames,
                regionsData: regions,
            });

            const result = await compositeFromData(
                regions,
                project.meta.width,
                project.meta.height,
                project.meta.totalFrames,
            );
            return { success: true, ...result };
        } catch (error) {
            console.error('Composer error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                regionsCount: regions?.length,
                totalFrames: project.meta.totalFrames,
            });
            return { success: false, error: error.message, stack: error.stack };
        }
    });

    // Encode frames into a video file
    ipcMain.handle('render-encoder', async (event, { project, hasComposite, singleRegionCode }) => {
        try {
            const videosDir = app.getPath('videos');
            const tempRoot = path.join(app.getPath('temp'), 'p5mv-render');

            let compositePath;
            if (hasComposite) {
                compositePath = path.join(tempRoot, 'composite');
            } else {
                compositePath = path.join(tempRoot, singleRegionCode);
            }

            const result = await encodeFramesToVideo({
                compositePath: compositePath,
                outputVideoPath: path.join(tempRoot, 'output.mp4'),
                videosDir: videosDir,
                fps: project.meta.fps,
                onProgress: (current, total, message) => {
                    broadcastProgress({
                        type: 'encoding_progress',
                        currentFrame: current,
                        totalFrames: total,
                        progress: (current / total) * 100,
                        message,
                    });
                },
            });

            // Automatically open the rendered video in the default OS player
            try {
                const openResult = await shell.openPath(result);
                if (openResult) {
                    console.warn('shell.openPath reported an issue:', openResult);
                    broadcastProgress({
                        type: 'error',
                        message: `Failed to auto-open rendered video: ${openResult}`,
                    });
                } else {
                    broadcastProgress({
                        type: 'encoding_complete',
                        message: 'Rendered video opened in default player',
                        videoPath: result,
                    });
                }
            } catch (openError) {
                console.warn('Failed to open rendered video automatically:', openError);
                broadcastProgress({
                    type: 'error',
                    message: 'Failed to auto-open rendered video',
                    stack: openError?.stack || String(openError),
                });
            }

            await cleanupTempDirectory();

            return { success: true, videoPath: result };
        } catch (error) {
            console.error('Encoder error:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    });

    // Manually open the last rendered video
    ipcMain.handle('open-latest-video', async () => {
        try {
            const videosDir = app.getPath('videos');
            const filePath = path.join(videosDir, 'p5mv Videos', 'output.mp4');
            const openResult = await shell.openPath(filePath);
            if (openResult) {
                console.warn('shell.openPath reported an issue (manual open):', openResult);
                return { success: false, error: openResult };
            }
            return { success: true, videoPath: filePath };
        } catch (error) {
            console.error('Error opening latest video manually:', error);
            return { success: false, error: error.message };
        }
    });

    // Connection status from renderer
    ipcMain.on('progress-connect', (event) => {
        broadcastProgress({ type: 'connected' });
    });

    // Get video file path (custom protocol URL)
    ipcMain.handle('get-video-path', async () => {
        return 'p5mv://output.mp4';
    });
}
