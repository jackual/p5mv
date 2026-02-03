let t = 0;          // time
let lineGap = 8;    // vertical distance between ripple "bands"

function setup() {
  createCanvas(600, 800);
  pixelDensity(1);
  noFill();
}

function draw() {
  background(2, 10, 25); // deep blue

  t += 0.01;

  // Draw many wavy bands from top to bottom
  for (let y = -40; y < height + 40; y += lineGap) {
    beginShape();
    // Slight variation per band so they do not all move the same
    let bandOffset = y * 0.02;

    for (let x = -40; x < width + 40; x += 6) {

      // Two noise fields to bend x and y in different ways
      let n1 = noise(x * 0.01, y * 0.02, t * 0.8);
      let n2 = noise(x * 0.015 + 100, y * 0.018 + 50, t * 0.6);

      // Amount of distortion
      let dx = map(n1, 0, 1, -20, 20);
      let dy = map(n2, 0, 1, -30, 30);

      // Slight extra wave
      let sine = sin((x * 0.015) + bandOffset + t * 1.5) * 10;

      let px = x + dx;
      let py = y + dy + sine;

      // Colour that shifts with noise so you get light streaks
      let brightness = map(n1 + n2, 0, 2, 40, 255);
      let blueTint = map(y, 0, height, 180, 255);

      stroke(180, 210, blueTint, brightness); // bluish highlights
      strokeWeight(3);

      curveVertex(px, py);
    }

    endShape();
  }
}
