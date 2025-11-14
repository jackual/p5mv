function setup() {
    createCanvas(...captureInput.dims)
    pixelDensity(1)
    noLoop()
}

function draw() {
    background(p5mv.colour_test);
    try {
        // Debug what's in inputs
        // text(`Inputs: ${p5mv.number_test} ${__frameIndex}`, 20, 20, 300, 100)

        circle(p5mv.number_test, height / 4, 50);
        circle(p5mv.float_test, height / 5, 50);
    } catch (e) {
        text(`Error: ${e.message}`, 20, 20, 200, 30)
    }
}

window.renderFrame = (i) => {
    redraw();
};