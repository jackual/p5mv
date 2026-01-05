import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDom } from './utils.js'
import { readProjectInfo } from './sceneInfo.js'
import { app } from 'electron'

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
