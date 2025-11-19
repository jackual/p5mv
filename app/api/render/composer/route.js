import { compositeFromData, compositeFrames } from '../../../../lib/composer/composer.js';
import { broadcastProgress } from '../progress/route.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function POST(request) {
    try {
        const {
            data,
            width = 800,
            height = 600,
            totalFrames
        } = await request.json();

        if (!data || !Array.isArray(data)) {
            return Response.json(
                { success: false, error: 'Invalid data format. Expected array.' },
                { status: 400 }
            );
        }

        if (!totalFrames || totalFrames <= 0) {
            return Response.json(
                { success: false, error: 'Invalid totalFrames. Must be a positive number.' },
                { status: 400 }
            );
        }

        // Send composition start notification
        broadcastProgress({
            type: 'composition_start',
            message: 'Starting frame composition...',
            totalFrames
        });

        // Create a progress-tracked version of composition
        let processedFrames = 0;

        const getFrameFromExport = (data, frame) => {
            return data.flat().filter(region => {
                return frame >= region[1] && frame < region[1] + region[2]
            }).reverse()
        }

        for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
            await compositeFrames(
                getFrameFromExport(data, frameNumber),
                frameNumber,
                width,
                height
            );

            processedFrames++;

            // Send progress update every 10 frames or on the last frame
            if (processedFrames % 10 === 0 || processedFrames === totalFrames) {
                broadcastProgress({
                    type: 'composition_progress',
                    currentFrame: processedFrames,
                    totalFrames: totalFrames,
                    progress: (processedFrames / totalFrames) * 100,
                    message: `Compositing frame ${processedFrames}/${totalFrames}`
                });
            }
        }

        // Send composition complete notification
        broadcastProgress({
            type: 'composition_complete',
            message: `Frame composition complete: ${totalFrames} frames processed`,
            processedFrames: totalFrames
        });

        return Response.json({
            success: true,
            message: `Successfully composited ${totalFrames} frames`,
            processedFrames: totalFrames,
            width,
            height
        });

    } catch (error) {
        console.error('Composition error:', error);

        // Send error notification
        broadcastProgress({
            type: 'error',
            message: `Error compositing frames: ${error.message}`,
            stack: error?.stack
        });

        return Response.json(
            { success: false, error: error.message, stack: error?.stack },
            { status: 500 }
        );
    }
}