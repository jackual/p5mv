import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDom } from './utils.js'
import { readProjectInfo } from './sceneInfo.js'
import { app } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const paths = {
    defaultScenes: path.join(__dirname, '../../tests/scene-convert/out'),
    openScenes: path.join(app.getPath('temp'), 'open-project', 'sketches')
}

async function scanDirectoryForSketches(dirname) {
    const entries = await fs.readdir(dirname, { withFileTypes: true })
    let output = []
    for (const entry of entries) {
        const indexPath = path.join(dirname, entry.name, 'index.html')
        const exists = await fs.pathExists(indexPath)
        if (!exists) continue
        const dom = await getDom(indexPath)
        let info = await readProjectInfo(dom)
        info.id = entry.name
        output.push(info)
    }
    return output
}

export async function getAvailableScenes() {
    await Promise.all(
        Object.entries(paths).map(async ([key, dirname]) => {
            const sketches = await scanDirectoryForSketches(dirname)
            paths[key] = sketches
        })
    )
    return paths
}
