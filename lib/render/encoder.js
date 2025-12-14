import { exec, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkFFmpegInstalled() {
    return new Promise((resolve, reject) => {
        exec('ffmpeg -version', (error, stdout, stderr) => {
            if (error) {
                reject(new Error('FFmpeg is not installed or not in PATH'));
            } else {
                console.log('FFmpeg is installed');
                resolve(true);
            }
        });
    });
}

export async function encodeFramesToVideo(options) {
    const projectRoot = path.join(__dirname, '..', '..');
    const {
        frameDir = path.join(projectRoot, 'output', 'frames'),
        outputVideoPath = path.join(projectRoot, 'public', 'output.mp4'),
        videosDir,
        fps = 30,
        onProgress = null
    } = options;

    // Create p5mv Videos folder in user's videos directory
    const p5mvVideosDir = path.join(videosDir, 'p5mv Videos');
    const tempOutputVideoPath = path.join(p5mvVideosDir, 'output.mp4');

    const newFrameDir = path.join(projectRoot, 'output', 'frames')

    try {
        // Check if FFmpeg is installed
        await checkFFmpegInstalled();

        // Ensure the p5mv Videos directory exists
        await fs.ensureDir(p5mvVideosDir);

        // Ensure the output directory exists
        const outputDir = path.dirname(tempOutputVideoPath);
        // Maybe add back in later?
        //  await fs.ensureDir(outputDir);

        // Check if frames directory exists and has files
        if (!await fs.pathExists(newFrameDir)) {
            throw new Error(`Frames directory does not exist: ${newFrameDir}`);
        }

        const frameFiles = (await fs.readdir(newFrameDir))
            .filter(file => file.endsWith('.png'))
            .sort(); // Ensure proper ordering

        console.log(`Encoding video to ${tempOutputVideoPath} from frames in ${newFrameDir}`);
        if (frameFiles.length === 0) {
            throw new Error('No PNG files found in frames directory');
        }

        console.log(`Found ${frameFiles.length} frame files`);

        // Send initial progress if callback provided
        if (onProgress) {
            onProgress(0, frameFiles.length, 'Starting video encoding...');
        }

        // FFmpeg command to create video from image sequence
        const args = [
            '-y', // Overwrite output file
            '-framerate', fps.toString(),
            '-pattern_type', 'glob',
            '-i', `${newFrameDir}/*.png`,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-progress', 'pipe:1', // Enable progress output
            tempOutputVideoPath
        ];

        console.log('Running FFmpeg command:', 'ffmpeg', args.join(' '));

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', args);

            let stderr = '';
            let progressData = '';

            // Parse FFmpeg progress output
            ffmpeg.stdout.on('data', (data) => {
                progressData += data.toString();

                // Look for frame progress in the output
                const lines = progressData.split('\n');
                for (const line of lines) {
                    if (line.startsWith('frame=')) {
                        const frameMatch = line.match(/frame=\s*(\d+)/);
                        if (frameMatch && onProgress) {
                            const currentFrame = parseInt(frameMatch[1]);
                            const progress = Math.min((currentFrame / frameFiles.length) * 100, 100);
                            onProgress(currentFrame, frameFiles.length, `Encoding frame ${currentFrame}/${frameFiles.length}`);
                        }
                    }
                }

                // Clear processed lines but keep incomplete ones
                const lastNewlineIndex = progressData.lastIndexOf('\n');
                if (lastNewlineIndex !== -1) {
                    progressData = progressData.substring(lastNewlineIndex + 1);
                }
            });

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
                // FFmpeg sometimes outputs progress info to stderr as well
                console.log('FFmpeg:', data.toString().trim());
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log('Video created successfully:', tempOutputVideoPath);
                    if (onProgress) {
                        onProgress(frameFiles.length, frameFiles.length, 'Video encoding complete');
                    }
                    resolve(tempOutputVideoPath);
                } else {
                    const error = new Error(`FFmpeg process exited with code ${code}`);
                    error.stderr = stderr;
                    console.error('FFmpeg error:', error.message);
                    reject(error);
                }
            });

            ffmpeg.on('error', (error) => {
                console.error('FFmpeg spawn error:', error.message);
                reject(error);
            });
        });

    } catch (error) {
        console.error('Error in encodeFramesToVideo function:', error.message);
        throw error;
    }
}