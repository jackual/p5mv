function setup() {
    p5mv.setup()
}

function draw() {
    background(p5mv.colour_test);
    try {
        // Debug what's in inputs
        text(`Inputs: ${p5mv.colour_test} ${Math.floor(p5mv.percentElapsed)}%`, 20, 20, 300, 100)
    } catch (e) {
        text(`Error: ${e.message}`, 20, 20, 200, 30)
    }
}