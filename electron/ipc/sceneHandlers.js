import { ipcMain } from 'electron'
import { getAvailableScenes } from '../../lib/scene/pageActions.js'

export function registerSceneHandlers() {
    ipcMain.handle('scan-scenes', async () => {
        return await getAvailableScenes()
    })
}