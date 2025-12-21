import { app, protocol } from 'electron';
import path from 'path';

export function registerProtocols() {
    protocol.registerFileProtocol('p5mv', (request, callback) => {
        const url = request.url.substr(7); // Remove 'p5mv://'
        const videosDir = app.getPath('videos');
        const filePath = path.join(videosDir, 'p5mv Videos', url);
        callback({ path: filePath });
    });
}
