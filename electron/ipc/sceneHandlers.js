import { ipcMain, dialog } from 'electron'
import { getAvailableScenes, copySceneInternal, deleteScene } from '../../lib/scene/pageActions.js'

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

    ipcMain.handle('show-delete-scene-dialog', async (event, { sceneId }) => {
        const result = await dialog.showMessageBox({
            type: 'warning',
            title: 'Delete Scene',
            message: `Are you sure you want to delete "${sceneId}"?`,
            detail: 'This action cannot be undone.',
            buttons: ['Cancel', 'Delete'],
            defaultId: 0,
            cancelId: 0
        })

        // Returns 0 for Cancel, 1 for Delete
        return result.response
    })

    ipcMain.handle('delete-scene', async (event, { sourceKey, sceneId }) => {
        return await deleteScene(sourceKey, sceneId)
    })
}