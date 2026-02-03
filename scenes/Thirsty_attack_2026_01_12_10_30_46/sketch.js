let particles = [];
let num = 2500;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  for (let i = 0; i < num; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      angle: random(TWO_PI),
      speed: random(0.5, 1.5),
      size: random(1, 3),
    });
  }
}

function draw() {
  // translucent background to create trails
  fill(0, 20);
  rect(0, 0, width, height);

  noStroke();
  fill(255, 255, 255, 80);

  for (let p of particles) {
    // move based on noise field
    let n = noise(p.x * 0.002, p.y * 0.002, frameCount * 0.005);
    let a = TAU * n * 2.0;

    p.x += cos(a) * p.speed;
    p.y += sin(a) * p.speed;

    // wrap edges
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    // draw particle with glow
    let alpha = map(n, 0, 1, 50, 150);
    fill(255, alpha);
    circle(p.x, p.y, p.size);
  }

  // optional glow overlay
  blendMode(ADD);
  for (let p of particles) {
    let n = noise(p.x * 0.002, p.y * 0.002, frameCount * 0.005);
    let alpha = map(n, 0, 1, 5, 25);
    fill(255, alpha);
    circle(p.x, p.y, p.size * 3);
  }
  blendMode(BLEND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
