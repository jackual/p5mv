const captureLib = {
    send: () => {
        if (window.frameNumber < captureInput.frameCount) {
            // console.log("Capturing frame:", window.frameNumber)
            saveCanvas('f' + window.frameNumber.toString().padStart(4, '0'), 'png')
            // console.log("Captured:", window.frameNumber)
            window.frameNumber++
        } else {
            noLoop()
            // Signal completion to Puppeteer
            window.captureComplete = true
        }
    }
}