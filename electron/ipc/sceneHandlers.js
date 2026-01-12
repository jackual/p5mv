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
        // Send to renderer to show custom dialog
        event.sender.send('show-scene-conflict-dialog', { sceneId })
        
        // Wait for response from renderer
        return new Promise((resolve) => {
            ipcMain.once('scene-conflict-dialog-response', (event, response) => {
                resolve(response)
            })
        })
    })

    ipcMain.handle('show-delete-scene-dialog', async (event, { sceneId }) => {
        // Send to renderer to show custom dialog
        event.sender.send('show-delete-scene-dialog', { sceneId })
        
        // Wait for response from renderer
        return new Promise((resolve) => {
            ipcMain.once('delete-scene-dialog-response', (event, response) => {
                resolve(response)
            })
        })
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