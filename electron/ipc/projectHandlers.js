import { app, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import nodeZip from 'node-zip'

export function registerProjectHandlers() {
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
            const tmpDir = path.join(app.getPath('temp'), 'open-project')

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

            const zip = new nodeZip()
            zip.file('project.json', projectData)

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
