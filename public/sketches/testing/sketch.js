function setup() {
    createCanvas(...captureInput.dims)
    pixelDensity(1)
    noLoop()
}

function draw() {
    background(220);
    text(captureInput.region.inputs.prop1, 20, 20, 30, 30)
}

window.renderFrame = (i) => {
    redraw();
};