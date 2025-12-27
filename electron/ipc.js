import { registerProjectHandlers } from './ipc/projectHandlers.js';
import { registerRenderHandlers } from './ipc/renderHandlers.js';

export function registerIpcHandlers(broadcastProgress) {
    registerProjectHandlers();
    registerRenderHandlers(broadcastProgress);
}
