const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

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

async function framesToVideo({
    frameDir = path.join(__dirname, 'output', 'frames'),
    outputVideoPath = path.join(__dirname, 'output', 'output.mp4')
} = {}) {
    try {
        // Check if FFmpeg is installed
        await checkFFmpegInstalled();

        // Ensure the output directory exists
        const outputDir = path.dirname(outputVideoPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Check if frames directory exists and has files
        if (!fs.existsSync(frameDir)) {
            throw new Error(`Frames directory does not exist: ${frameDir}`);
        }

        const frameFiles = fs.readdirSync(frameDir).filter(file => file.endsWith('.png'));
        if (frameFiles.length === 0) {
            throw new Error('No PNG files found in frames directory');
        }

        console.log(`Found ${frameFiles.length} frame files`);

        const FPS = 24

        // FFmpeg command to create video from image sequence
        // First, let's use a glob pattern approach
        const command = `ffmpeg -y -framerate ${FPS} -pattern_type glob -i "${frameDir}/*.png" -c:v libx264 -pix_fmt yuv420p "${outputVideoPath}"`;

        console.log('Running FFmpeg command:', command);

        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('FFmpeg error:', error.message);
                    reject(error);
                } else {
                    console.log('Video created successfully:', outputVideoPath);
                    if (stderr) console.log('FFmpeg output:', stderr);
                    resolve(outputVideoPath);
                }
            });
        });

    } catch (error) {
        console.error('Error in framesToVideo function:', error.message);
        throw error;
    }
}

module.exports = { framesToVideo };

if (require.main === module) {
    framesToVideo().catch(console.error);
}
