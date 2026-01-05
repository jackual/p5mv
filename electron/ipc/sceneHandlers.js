import { ipcMain, dialog } from 'electron'
import { getAvailableScenes, copySceneInternal } from '../../lib/scene/pageActions.js'

export function registerSceneHandlers() {
    ipcMain.handle('scan-scenes', async () => {
        return await getAvailableScenes()
    })

    ipcMain.handle('copy-scene-internal', async (event, { sourceKey, targetKey, sceneId, newSceneId, overwrite = false }) => {
        return await copySceneInternal(sourceKey, targetKey, sceneId, newSceneId, overwrite)
    })

    ipcMain.handle('show-scene-conflict-dialog', async (event, { sceneId }) => {
        const result = await dialog.showMessageBox({
            type: 'question',
            title: 'Scene Already Exists',
            message: `A scene with the ID "${sceneId}" already exists in this location.`,
            detail: 'What would you like to do?',
            buttons: ['Cancel', 'Replace', 'Keep Both'],
            defaultId: 0,
            cancelId: 0
        })

        // Returns 0 for Cancel, 1 for Replace, 2 for Keep Both
        return result.response
    })
}