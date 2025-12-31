import path from 'path'
import fs from 'fs-extra'
import fetch from 'node-fetch'
import { isUrlExternal } from 'is-url-external'
import { JSDOM } from 'jsdom'
import { code, config } from 'common-js-file-extensions'

function ensureJsExt(filename) {
    const ext = path.extname(filename).toLowerCase().replace('.', '')
    const hasExt = code.concat(config).includes(ext)
    return hasExt ? filename : filename + '.js'
}

async function getDom(indexHtml) {
    const content = await fs.readFile(indexHtml, 'utf8')
    return new JSDOM(content, 'text/html')
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

async function convertProject(pathname) {
    const indexHtml = path.join(pathname, 'index.html')
    let dom = await getDom(indexHtml)
    dom = await getExternalScripts(dom, pathname)
    await fs.writeFile(indexHtml, dom.window.document.documentElement.outerHTML)
}

async function readProjectInfo(pathname) {
    const indexHtml = path.join(pathname, 'index.html')
    const dom = await getDom(indexHtml)
    dom.getElementById('p5mv-json')
}

export { ensureJsExt, convertProject, isP5 }

/*

- scan scenes
 - for each directory in directory
 - scan index.html for infojson
 -
- add scene to project
- convert folder to scene
    - check script tags
    - rip externals


*/