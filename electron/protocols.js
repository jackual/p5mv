import { app, protocol } from 'electron';
import path from 'path';

export function registerProtocols() {
    protocol.registerFileProtocol('p5mv', (request, callback) => {
        const url = request.url.substr(7); // Remove 'p5mv://'
        const videosDir = app.getPath('videos');
        const filePath = path.join(videosDir, 'p5mv', 'Renders', url);
        callback({ path: filePath });
    });

    protocol.registerFileProtocol('scene', (request, callback) => {
        const url = request.url.substr(8); // Remove 'scene://'
        callback({ path: decodeURIComponent(url) });
    });
}
