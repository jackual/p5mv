import { captureFrames } from '../../../../lib/render/capture.js';
import { broadcastProgress } from '../progress/route.js';

export async function POST(request) {
    try {
        const { region, project } = await request.json();

        // Reconstruct the region object with project reference
        const regionWithProject = {
            ...region,
            project: project,
            // Add progress callback
            onProgress: (frameIndex, totalFrames) => {
                broadcastProgress({
                    type: 'region_progress',
                    currentFrame: frameIndex,
                    totalFrames: totalFrames,
                    progress: (frameIndex / totalFrames) * 100
                });
            }
        };

        // Send region start notification
        broadcastProgress({
            type: 'region_start',
            message: `Starting render of region: ${region.code}`
        });

        // Call the capture function
        await captureFrames(regionWithProject);

        // Send region complete notification
        broadcastProgress({
            type: 'region_complete',
            message: `Completed render of region: ${region.code}`
        });

        return Response.json({
            success: true,
            message: `Successfully rendered region: ${region.code}`
        });

    } catch (error) {
        console.error('Capture error:', error);

        // Send error notification with stack for more context
        broadcastProgress({
            type: 'error',
            message: `Error rendering region: ${error.message}`,
            stack: error?.stack
        });

        return Response.json(
            { success: false, error: error.message, stack: error?.stack },
            { status: 500 }
        );
    }
}