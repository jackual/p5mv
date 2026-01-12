import { ipcMain, dialog, app, shell } from 'electron'
import { getAvailableScenes, copySceneInternal, deleteScene, importScene } from '../../lib/scene/pageActions.js'
import fs from 'fs-extra'
import path from 'path'

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

    ipcMain.handle('show-open-scene-dialog', async (event, { source }) => {
        const result = await dialog.showOpenDialog({
            title: 'Open Scene',
            properties: ['openDirectory', 'openFile'],
            filters: [
                { name: 'Zip Files', extensions: ['zip'] }
            ]
        })

        if (result.canceled || result.filePaths.length === 0) {
            return null
        }

        try {
            // Notify renderer that import is starting
            event.sender.send('scene-import-progress', { status: 'importing', path: result.filePaths[0] })


            await importScene(result.filePaths[0], source)


            // Notify renderer that import is complete
            event.sender.send('scene-import-progress', { status: 'complete' })


            return true
        } catch (error) {
            console.error('Error importing scene:', error)


            // Notify renderer that import failed
            event.sender.send('scene-import-progress', { status: 'error', error: error.message })


            await dialog.showMessageBox({
                type: 'error',
                title: 'Failed to Import Scene',
                message: 'An error occurred while importing the scene.',
                detail: error.message || 'Unknown error',
                buttons: ['OK']
            })


            return false
        }
    })

    ipcMain.handle('show-item-in-folder', async (event, folderPath) => {
        shell.showItemInFolder(folderPath)
    })

    ipcMain.handle('import-downloaded-scene', async (event, { filePath }) => {
        try {
            if (!filePath) {
                throw new Error('No file path provided for scene import')
            }

            console.log('Importing downloaded scene from:', filePath)

            // Notify renderer that import is starting
            event.sender.send('scene-import-progress', { status: 'importing', path: filePath })

            // Import the scene to the open project
            await importScene(filePath, 'openScenes')

            // Notify renderer that import is complete
            event.sender.send('scene-import-progress', { status: 'complete' })

            console.log('Scene import completed successfully')
            return { success: true }
        } catch (error) {
            console.error('Error importing downloaded scene:', error)

            // Notify renderer that import failed
            event.sender.send('scene-import-progress', { status: 'error', error: error.message })

            return { success: false, error: error.message }
        }
    })
}