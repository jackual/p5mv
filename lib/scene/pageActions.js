import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDom } from './utils.js'
import { readProjectInfo } from './sceneInfo.js'
import { convertProject } from './prepareScene.js'
import { app } from 'electron'
import nodeZip from 'node-zip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pathTemplate = {
    defaultScenes: path.join(__dirname, '../../tests/scene-convert/out'),
    openScenes: path.join(app.getPath('temp'), 'open-project', 'sketches'),
    userDirectoryScenes: path.join(app.getPath('videos'), 'p5mv', 'Sketches')
}

async function scanDirectoryForSketches(dirname) {
    await fs.ensureDir(dirname)
    const entries = await fs.readdir(dirname, { withFileTypes: true })
    let output = []
    for (const entry of entries) {
        const indexPath = path.join(dirname, entry.name, 'index.html')
        const exists = await fs.pathExists(indexPath)
        if (!exists) continue
        try {
            const dom = await getDom(indexPath)
            let info = await readProjectInfo(dom)
            //there needs to be handling for not prepared sketches
            if (!info) {
                console.warn(`Could not read project info for ${entry.name}`)
                continue
            }
            info.id = entry.name
            info._path = path.join(dirname, entry.name)
            output.push(info)
        } catch (error) {
            console.error(`Error reading scene ${entry.name}:`, error)
            continue
        }
    }
    return output
}

export async function copySceneInternal(sourceKey, targetKey, sceneId, newSceneId, overwrite = false) {
    const sourceFolder = pathTemplate[sourceKey]
    const targetFolder = pathTemplate[targetKey]

    if (!sourceFolder || !targetFolder) {
        throw new Error(`Invalid source or target key: ${sourceKey}, ${targetKey}`)
    }

    const sourcePath = path.join(sourceFolder, sceneId)
    const targetPath = path.join(targetFolder, newSceneId || sceneId)

    await fs.ensureDir(targetFolder)
    await fs.copy(sourcePath, targetPath, { overwrite })
}

export async function deleteScene(sourceKey, sceneId) {
    const sourceFolder = pathTemplate[sourceKey]

    if (!sourceFolder) {
        throw new Error(`Invalid source key: ${sourceKey}`)
    }

    const scenePath = path.join(sourceFolder, sceneId)
    const exists = await fs.pathExists(scenePath)

    if (!exists) {
        throw new Error(`Scene not found: ${scenePath}`)
    }

    await fs.remove(scenePath)
}

export async function getAvailableScenes() {
    const paths = { ...pathTemplate }
    await Promise.all(
        Object.entries(paths).map(async ([key, dirname]) => {
            const sketches = await scanDirectoryForSketches(dirname)
            paths[key] = sketches
        })
    )
    return paths
}


export async function importScene(pathname, targetKey) {
    const tempDir = path.join(app.getPath('temp'), 'scene-import'),
        baseName = path.basename(pathname)
    await fs.ensureDir(tempDir)
    await fs.emptyDir(tempDir)
    await fs.copy(
        pathname,
        path.join(tempDir, baseName),
        { overwrite: true }
    )

    // Unzip if it's a zip file with node-zip
    if (path.extname(baseName).toLowerCase() === '.zip') {
        const zipPath = path.join(tempDir, baseName)
        const extractDir = tempDir //path.join(tempDir, path.basename(baseName, '.zip'))

        // Read the zip file as binary
        const zipData = await fs.readFile(zipPath, 'binary')

        // Load the zip archive
        const zip = new nodeZip()
        const archive = zip.load(zipData)

        // Extract all files
        await fs.ensureDir(extractDir)
        for (const name in archive.files) {
            const file = archive.files[name]
            if (!file.options.dir) {
                const filePath = path.join(extractDir, name)
                await fs.ensureDir(path.dirname(filePath))
                await fs.writeFile(filePath, file.asNodeBuffer())
            }
        }

        // Remove the zip file and use the extracted directory
        await fs.remove(zipPath)
    }

    await convertProject(path.join(tempDir, baseName.replace('.zip', ''))).catch(async err => {
        console.error('Error converting project:', err)
        //await fs.emptyDir(tempDir)
        throw err
        return err
    })

    const targetPath = pathTemplate[targetKey || 'userDirectoryScenes']

    await fs.move(
        path.join(tempDir, baseName.replace('.zip', '')),
        path.join(targetPath, baseName.replace('.zip', '')),
        { overwrite: true }
    )
}