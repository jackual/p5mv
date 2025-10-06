rm -rf output
node capture.js
node frameToVideo.js
open output/output.mp4
