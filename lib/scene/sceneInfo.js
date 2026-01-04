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

export { readProjectInfo }