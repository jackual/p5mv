let startYs = [];
let numLines = 30;
let linePositions = [];

function setup() {
  createCanvas(...captureInput.dims)
  pixelDensity(1)
  noLoop()
  background(220); // negative effect background

  // Store 30 random Y positions for diagonal motion
  for (let i = 0; i < 30; i++) {
    startYs.push(random(0, height));
  }

  // Initialize random positions for perimeter lines
  for (let i = 0; i < numLines; i++) {
    linePositions.push({
      t: random(0, 1),
      direction: floor(random(4)) // 0 = top, 1 = right, 2 = bottom, 3 = left
    });
  }
}

function draw() {
  blendMode(SCREEN)
  background(100); // negative effect background
  blendMode(EXCLUSION)
  stroke(255);   // white lines
  strokeWeight(1);

  // --- Diagonal oscillating lines ---
  let t = (sin(frameCount * TWO_PI / 120) + 1) / 2; // cycle

  for (let i = 0; i < startYs.length; i++) {
    let y1 = startYs[i];
    let y2 = height - y1;
    let easedY = lerp(y1, y2, t);

    line(0, easedY, width, height - easedY);
  }

  // --- Perimeter cycling lines ---
  for (let i = 0; i < numLines; i++) {
    let linePos = linePositions[i];

    // Animate
    linePos.t += 0.01;
    if (linePos.t > 1) {
      linePos.t = 0;
      linePos.direction = (linePos.direction + 1) % 4;
    }

    // Positions
    let x1, y1, x2, y2;
    switch (linePos.direction) {
      case 0: // top
        x1 = lerp(0, width, linePos.t);
        y1 = 0;
        x2 = x1;
        y2 = height;
        break;
      case 1: // right
        x1 = width;
        y1 = lerp(0, height, linePos.t);
        x2 = 0;
        y2 = y1;
        break;
      case 2: // bottom
        x1 = lerp(width, 0, linePos.t);
        y1 = height;
        x2 = x1;
        y2 = 0;
        break;
      case 3: // left
        x1 = 0;
        y1 = lerp(height, 0, linePos.t);
        x2 = width;
        y2 = y1;
        break;
    }

    line(x1, y1, x2, y2);
  }
}

window.renderFrame = (i) => {
  redraw();
};