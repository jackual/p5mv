function setup() {
  p5mv.setup()
  noFill();
}

function draw() {

  stroke('blue');

  // Draw multiple lines
  for (let i = 0; i < 40; i++) {
    const edge = floor(random(4));
    let x1, y1;

    // Choose a random point on one of the four edges
    if (edge === 0) { // Top
      x1 = random(w);
      y1 = 0;
    } else if (edge === 1) { // Right
      x1 = w;
      y1 = random(h);
    } else if (edge === 2) { // Bottom
      x1 = random(w);
      y1 = h;
    } else { // Left
      x1 = 0;
      y1 = random(h);
    }

    // Adjust stroke weight for the middle line (for visual variety)
    if (i === 20) {
      strokeWeight(2);
    } else {
      strokeWeight(1);
    }

    // Add a bit of vertical offset and noise for variation
    const offsetY = (Math.random() * 4) + ((i - 20) * 5);

    // Draw line from perimeter to center
    line(x1, y1, width / 2, height / 2 + offsetY);
  }
}
