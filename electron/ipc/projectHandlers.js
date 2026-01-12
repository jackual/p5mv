import { app, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import nodeZip from 'node-zip'

const getProjectTempDir = () => path.join(app.getPath('temp'), 'open-project')

const addDirectoryToZip = async (zipInstance, directory, basePath = '') => {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
        const sourcePath = path.join(directory, entry.name)
        const zipPath = (basePath ? path.join(basePath, entry.name) : entry.name).replace(/\\/g, '/')

        if (entry.isDirectory()) {
            await addDirectoryToZip(zipInstance, sourcePath, zipPath)
        } else {
            const fileBuffer = await fs.readFile(sourcePath)
            zipInstance.file(zipPath, fileBuffer)
        }
    }
}

export function registerProjectHandlers(getMainWindow) {
    ipcMain.handle('project-init-temp', async () => {
        try {
            const tmpDir = getProjectTempDir()
            await fs.ensureDir(tmpDir)
            await fs.emptyDir(tmpDir)
            return { success: true }
        } catch (error) {
            console.error('Project temp init error:', error)
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('project-mark-saved', async () => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.hasUnsavedChanges = false;
        }
        return { success: true };
    })

    ipcMain.handle('project-mark-unsaved', async (event, { title }) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.hasUnsavedChanges = true;
            mainWindow.projectTitle = title || 'Untitled Project';
        }
        return { success: true };
    })

    ipcMain.handle('project-open', async () => {
        try {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                filters: [{ name: 'p5mv Project', extensions: ['p5mvProject'] }],
                properties: ['openFile']
            })

            if (canceled || !filePaths?.length) {
                return { success: false, canceled: true }
            }

            const filePath = filePaths[0]
            const fileBuffer = await fs.readFile(filePath)
            const tmpDir = getProjectTempDir()

            await fs.ensureDir(tmpDir)
            await fs.emptyDir(tmpDir)

            const zip = new nodeZip(fileBuffer, { binary: true, base64: false })
            const entries = zip.files

            for (const filename of Object.keys(entries)) {
                const entry = entries[filename]
                const outputPath = path.join(tmpDir, filename)

                if (entry.dir || filename.endsWith('/')) {
                    await fs.ensureDir(outputPath)
                } else {
                    await fs.ensureDir(path.dirname(outputPath))
                    await fs.writeFile(outputPath, entry.asNodeBuffer())
                }
            }

            const projectJsonPath = path.join(tmpDir, 'project.json')
            if (!(await fs.pathExists(projectJsonPath))) {
                throw new Error('Invalid project bundle: missing project.json')
            }

            const projectJson = await fs.readFile(projectJsonPath, 'utf8')
            return { success: true, projectJson }
        } catch (error) {
            console.error('Project open error:', error)
            return { success: false, error: error.message }
        }
    })

    ipcMain.handle('project-save', async (event, { projectData }) => {
        try {
            if (!projectData) {
                throw new Error('No project data provided')
            }

            const defaultName = `${projectData?.meta?.title || 'Untitled Project'}.p5mvProject`
            const { canceled, filePath } = await dialog.showSaveDialog({
                defaultPath: path.join(app.getPath('documents'), defaultName),
                filters: [{ name: 'p5mv Project', extensions: ['p5mvProject'] }]
            })

            if (canceled || !filePath) {
                return { success: false, canceled: true }
            }

            const tmpDir = getProjectTempDir()
            await fs.ensureDir(tmpDir)

            const projectJsonPath = path.join(tmpDir, 'project.json')
            await fs.writeFile(projectJsonPath, projectData)

            const zip = new nodeZip()
            await addDirectoryToZip(zip, tmpDir)

            const zipBuffer = zip.generate({
                base64: false,
                compression: 'DEFLATE',
                type: 'nodebuffer'
            })
            await fs.outputFile(filePath, zipBuffer)
            return { success: true, filePath }
        } catch (error) {
            console.error('Project save error:', error)
            return { success: false, error: error.message }
        }
    })
}
