let w = captureInput.dims[0]
let h = captureInput.dims[1]
let sw = 4

function setup() {
  createCanvas(...captureInput.dims)
  pixelDensity(1)
  noLoop()
}

let randRgb = (x) => ([
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256),
  Math.floor(Math.random() * 256)
]);

function draw() {
  for (let i = 0; i < w / sw; i++) {
    const x = (i / (w / sw)) * 100;
    strokeWeight(sw);
    stroke(...randRgb(x), 255);
    line(i * sw, 0, i * sw, h);
  }
}

window.renderFrame = (i) => {
  redraw();
};