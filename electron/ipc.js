import { registerProjectHandlers } from './ipc/projectHandlers.js';
import { registerRenderHandlers } from './ipc/renderHandlers.js';
import { registerSceneHandlers } from './ipc/sceneHandlers.js';
import { registerMenuHandlers } from './ipc/menuHandlers.js';

export function registerIpcHandlers(broadcastProgress, getMainWindow) {
    registerProjectHandlers(getMainWindow);
    registerRenderHandlers(broadcastProgress);
    registerSceneHandlers();
    registerMenuHandlers();
}
