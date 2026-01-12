import { registerProjectHandlers } from './ipc/projectHandlers.js';
import { registerRenderHandlers } from './ipc/renderHandlers.js';
import { registerSceneHandlers } from './ipc/sceneHandlers.js'

export function registerIpcHandlers(broadcastProgress, getMainWindow) {
    registerProjectHandlers(getMainWindow);
    registerRenderHandlers(broadcastProgress);
    registerSceneHandlers()
}
