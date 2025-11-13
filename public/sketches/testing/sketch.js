function setup() {
    createCanvas(...captureInput.dims)
    pixelDensity(1)
    noLoop()
}

function draw() {
    background(220);
    try {
        // Debug what's in inputs
        text(`Inputs: ${p5mv.number_test}`, 20, 20, 300, 100)
        text(`Frame: ${frameCount}`, 20, 140, 100, 30)
        text(`Test: ${Object.keys(p5mv).join(",")}`, 20, 180, 100, 30)
    } catch (e) {
        text(`Error: ${e.message}`, 20, 20, 200, 30)
    }
}

window.renderFrame = (i) => {
    redraw();
};