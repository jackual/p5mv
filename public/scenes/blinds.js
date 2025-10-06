let w = captureInput.dims[0]
let h = captureInput.dims[1]
let sw = 4
window.frameNumber = 0

function setup() {
  createCanvas(...captureInput.dims)
}

let randRgb = (x) => ([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])

function draw() {
  background(220)
  let x
  for (let i = 0; i < w / sw; i++) {
    x = (i / (w / sw)) * 100
    line(i * sw, 0, i * sw, h), strokeWeight(sw), stroke(...randRgb(x))
  }
  captureLib.send()
}