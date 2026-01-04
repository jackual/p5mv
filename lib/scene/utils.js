import { JSDOM } from 'jsdom'
import fs from 'fs-extra'

async function getDom(indexHtml) {
    const content = await fs.readFile(indexHtml, 'utf8')
    return new JSDOM(content, 'text/html')
}

export { getDom }