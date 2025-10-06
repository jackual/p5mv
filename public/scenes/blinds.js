let w = 600
let sw = 4
window.frameNumber = 0

function setup() {
  createCanvas(w, 300)
}

let randRgb = (x) => ([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])

function draw() {
  background(220)
  let x
  for (let i = 0; i < w / sw; i++) {
    x = (i / (w / sw)) * 100
    line(i * sw, 0, i * sw, 300), strokeWeight(sw), stroke(...randRgb(x))
  }
  if (window.frameNumber < 10) {
    console.log("Capturing frame:", window.frameNumber)
    saveCanvas('f' + window.frameNumber.toString().padStart(4, '0'), 'png')
    console.log("Captured:", window.frameNumber)
    window.frameNumber++
  } else {
    noLoop()
    // Signal completion to Puppeteer
    window.captureComplete = true
  }
}