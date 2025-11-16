let cols = 180;
let rows = 140;
let t = 0;

function setup() {
    p5mv.setup(true)
    colorMode(HSB, 360, 100, 100, 100);
    noFill();
    strokeWeight(p5mv.strokeWeight);
}

function draw() {
    background(0);
    rotateX(PI / 2.8);
    rotateZ(t * 0.02);

    for (let y = 0; y < rows; y++) {
        beginShape();
        for (let x = 0; x < cols; x++) {
            let u = map(x, 0, cols, -1.6, 1.6);
            let v = map(y, 0, rows, -1.2, 1.2);

            // twisty tunnel coordinates
            let wave = sin(u * 4 + t * 0.04) * 0.25 + cos(v * 2 - t * 0.05) * 0.25;
            let z = wave * 180 + sin(t * 0.03 + v * 3) * 90;

            // perspective projection
            let px = u * 400;
            let py = v * 400 + cos(u * 2 + t * 0.05) * 50;

            // colour gradient (purple → yellow)
            let hue = map(z, 0, 100, 280, 60);
            let sat = 90;
            let bri = 90;
            stroke(hue, sat, bri, 100);

            vertex(px, py, z);
        }
        endShape();
    }

    t += 1.2;
}
