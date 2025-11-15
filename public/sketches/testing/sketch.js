function setup() {
    p5mv.setup();
}

function draw() {
    background(p5mv.colour_test);
    try {
        // Debug what's in inputs
        circle(p5mv.number_test, p5mv.height / 4, 50, 50)
        circle(p5mv.float_test, p5mv.height / 2, 50, 50)
    } catch (e) {
        text(`Error: ${e.message}`, 20, 20, 200, 30)
    }
}