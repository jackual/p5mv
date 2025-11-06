rm -rf output
node lib/render/capture.js
node frameToVideo.js
open output/output.mp4
