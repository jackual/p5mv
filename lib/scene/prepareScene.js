import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { readProjectInfo, setProjectInfo } from './sceneInfo.js'
import { getDom } from './utils.js'
import { isUrlExternal } from 'is-url-external'
import { code, config } from 'common-js-file-extensions'
import { generateThumbnail } from '../render/capture.js'

function ensureJsExt(filename) {
    const ext = path.extname(filename).toLowerCase().replace('.', '')
    const hasExt = code.concat(config).includes(ext)
    return hasExt ? filename : filename + '.js'
}

function prettifyName(name) {
    return name
        .replace(/_\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())

}

async function getExternalScripts(dom, outputPath) {
    const externalPath = path.join(outputPath, 'externals')
    // add naming conflict handling here
    const scripts = dom.window.document.querySelectorAll('script');
    for (const script of scripts) {
        if (script.src) {
            if (isUrlExternal(script.src)) {
                await fs.ensureDir(externalPath);
                const filename = path.basename(script.src);
                const rootCheck = await fs.readFile(path.join(outputPath, filename), 'utf8')
                    .catch(() => null)

                let moveRootToExternal = false, body

                const res = await fetch(script.src, { cache: "no-store" })
                if (!res.ok) {
                    if (rootCheck !== null) moveRootToExternal = true
                    else {
                        const errorMessage = `Failed to fetch external script: ${script.src} - ${res.status} ${res.statusText}`
                        console.warn(errorMessage)
                        script.src = ''
                        script.innerHTML = `console.error(${errorMessage});`
                        continue
                    }
                }
                else {
                    body = await res.text()
                    if (rootCheck === body) moveRootToExternal = true
                }
                const jsFilename = ensureJsExt(filename)
                if (moveRootToExternal) {
                    fs.move(path.join(outputPath, filename), path.join(externalPath, jsFilename))
                }
                else {
                    await fs.writeFile(path.join(externalPath, jsFilename), body)
                }
                // could write in file conflict handling here
                script.src = path.join('externals', jsFilename);
            }
        }
    }
    const links = dom.window.document.querySelectorAll('link')
    for (const link of links) {
        if (link.rel === 'stylesheet' && isUrlExternal(link.href)) {
            await fs.ensureDir(externalPath);
            const filename = path.basename(link.href);
            const res = await fetch(link.href, { cache: "no-store" })
            if (!res.ok) {
                const errorMessage = `Failed to fetch external stylesheet: ${link.href} - ${res.status} ${res.statusText}`
                console.warn(errorMessage)
                link.href = ''
                continue
            }
            const body = await res.text()
            const cssFilename = filename.endsWith('.css') ? filename : filename + '.css'
            await fs.writeFile(path.join(externalPath, cssFilename), body)
            link.href = path.join('externals', cssFilename);
        }
    }
    return dom
}

async function isP5(filePath) {
    const source = await fs.readFile(filePath, 'utf8')
    return /p5\.js/i.test(source.slice(0, 2000)) ||          // banner mentions p5.js
        /The p5\.js library/i.test(source) ||            // licence banner
        /global\s+mode\s+is\s+a\s+special/i.test(source) // p5 specific comment in core
}

async function isCaptureLib(filePath) {
    const source = await fs.readFile(filePath, 'utf8')
    return source.startsWith('/* p5mv Library ')       // captureInput usage
}

async function convertProject(pathname) {
    const indexHtml = path.join(pathname, 'index.html')
    let dom = await getDom(indexHtml)
    dom = await getExternalScripts(dom, pathname)
    dom = await ensureP5mvScripts(dom, pathname)

    await fs.writeFile(indexHtml, dom.window.document.documentElement.outerHTML)

    await generateThumbnailForScene(pathname)
}

async function ensureP5mvScripts(dom, pathname) {
    const scripts = dom.window.document.querySelectorAll('script')
    for (const script of scripts) {
        if (script.src) {
            const scriptPath = path.join(pathname, script.src)
            if (await isP5(scriptPath)) {
                script.setAttribute('data-p5mv-type', 'p5-core')
            } else if (await isCaptureLib(scriptPath)) {
                script.setAttribute('data-p5mv-type', 'p5mv-capture-lib')
            }
        }
    }
    const p5Array = [...dom.window.document.querySelectorAll('script[data-p5mv-type="p5-core"]')]
    if (p5Array.length === 0) {
        throw new Error(`No p5.js core script found in ${pathname}`)
    }
    const p5Tag = p5Array[p5Array.length - 1]

    if (!dom.window.document.querySelector('script[data-p5mv-type="p5mv-capture-lib"]')) {
        const captureScript = dom.window.document.createElement('script')
        captureScript.setAttribute('data-p5mv-type', 'p5mv-capture-lib')
        captureScript.src = path.join('externals', 'captureLib.js')
        //copy captureLib.js to externals
        await fs.copy(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'render', 'captureLib.js'),
            path.join(pathname, 'externals', 'captureLib.js'))
        p5Tag.after(captureScript)
    }

    if (readProjectInfo(dom) !== null) {
        const infoScript = dom.window.document.createElement('script')
        infoScript.id = 'p5mv-json'
        infoScript.type = 'application/json'
        infoScript.textContent = JSON.stringify({ name: prettifyName(path.basename(pathname)) })
        p5Tag.after(infoScript)
    }

    return dom
}

async function generateThumbnailForScene(pathname) {
    const sceneId = path.basename(pathname)
    const indexHtml = path.join(pathname, 'index.html')

    try {
        // Use OS temp directory for thumbnail generation
        const tmpDir = path.join(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '..', '..', '.tmp', 'thumbnails', sceneId)

        // Generate thumbnail
        const result = await generateThumbnail({
            sceneId,
            scenePath: pathname,
            outPath: tmpDir,
            width: 400,
            height: 300
        })

        // Move thumbnail into the sketch directory as thumb.png
        const thumbPath = path.join(pathname, 'thumb.png')
        await fs.move(result.path, thumbPath, { overwrite: true })

        // Update project info to point to thumbnail
        let dom = await getDom(indexHtml)
        const currentInfo = await readProjectInfo(dom) || {}
        dom = await setProjectInfo(dom, {
            ...currentInfo,
            thumb: 'thumb.png'
        })

        // Save updated HTML
        await fs.writeFile(indexHtml, dom.window.document.documentElement.outerHTML)
    } catch (error) {
        console.warn(`Failed to generate thumbnail for ${sceneId}:`, error.message)
    }
}

export { ensureJsExt, convertProject, isP5, generateThumbnailForScene }