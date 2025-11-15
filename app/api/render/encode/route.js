import { encodeFramesToVideo } from '../../../../lib/render/encoder.js';
import { broadcastProgress } from '../progress/route.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function POST(request) {
    try {
        const { fps = 30, outputFilename = 'output.mp4' } = await request.json();

        const projectRoot = path.join(__dirname, '..', '..', '..', '..');
        const frameDir = path.join(projectRoot, 'output', 'frames');
        const outputVideoPath = path.join(projectRoot, 'public', outputFilename);

        // Send encoding start notification
        broadcastProgress({
            type: 'encoding_start',
            message: 'Starting video encoding...'
        });

        // Call the encoder function with progress callback
        const videoPath = await encodeFramesToVideo({
            frameDir,
            outputVideoPath,
            fps: Number(fps),
            onProgress: (currentFrame, totalFrames, message) => {
                broadcastProgress({
                    type: 'encoding_progress',
                    currentFrame,
                    totalFrames,
                    progress: (currentFrame / totalFrames) * 100,
                    message
                });
            }
        });

        // Send encoding complete notification
        broadcastProgress({
            type: 'encoding_complete',
            message: `Video encoding complete: ${outputFilename}`,
            videoPath
        });

        return Response.json({
            success: true,
            message: `Successfully encoded video: ${outputFilename}`,
            videoPath,
            fps
        });

    } catch (error) {
        console.error('Encoding error:', error);

        // Send error notification with stack
        broadcastProgress({
            type: 'error',
            message: `Error encoding video: ${error.message}`,
            stack: error?.stack
        });

        return Response.json(
            { success: false, error: error.message, stack: error?.stack },
            { status: 500 }
        );
    }
}