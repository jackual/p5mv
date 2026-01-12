import { getDom } from './utils.js'
import fs from 'fs-extra'
import path from 'path'

async function readProjectInfo(dom) {
    const info = dom.window.document.getElementById('p5mv-json')
    if (info) {
        try {
            return JSON.parse(info.textContent)
        } catch (e) {
            throw new Error(`Failed to parse p5mv-json in ${indexHtml}: ${e.message}`)
        }
    }
    return null
}

async function setProjectInfo(dom, info) {
    let infoScript = dom.window.document.getElementById('p5mv-json')
    infoScript.innerHTML = JSON.stringify(info, null, 2)
    return dom
}

// Read scene info from its index.html file
async function readSceneInfo(scenePath) {
    const indexPath = path.join(scenePath, 'index.html')
    const dom = await getDom(indexPath)
    return await readProjectInfo(dom)
}

// Update scene info in its index.html file
async function updateSceneInfo(scenePath, updates) {
    const indexPath = path.join(scenePath, 'index.html')
    const dom = await getDom(indexPath)
    let info = await readProjectInfo(dom)
    
    if (!info) {
        throw new Error('No project info found in scene')
    }
    
    // Merge updates into info
    info = { ...info, ...updates }
    
    // Update DOM
    await setProjectInfo(dom, info)
    
    // Write back to file
    await fs.writeFile(indexPath, dom.serialize(), 'utf8')
    
    return info
}

export { readProjectInfo, setProjectInfo, readSceneInfo, updateSceneInfo }