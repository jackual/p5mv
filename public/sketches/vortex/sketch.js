let circles = [];
let cols, rows;
let size = 10;
let r = size / 2;
let k = 5.3;
let newK = 1;

function setup() {
  p5mv.setup();
  cols = Math.floor(width / size);
  rows = Math.floor(height / size);
  circles = [];
  for (let i = 0; i < cols; i++) {
    circles[i] = [];
    for (let j = 0; j < rows; j++) {
      let x = size / 2 + i * size;
      let y = size / 2 + j * size;
      let d = dist(x, y, width / 2, height / 2);
      let angle = d / k;
      circles[i][j] = new Circle(x, y, angle);
    }
  }
}

function draw() {
  const t = constrain(100 + (p5mv.step * -1), 0, 100) / 100;
  const value = 15 + t * (60 - 15); // 15..60
  newK = (value / 2) - 7;
  const bg = 255 - (value - 15) * (255 / 45);
  background(bg, bg, bg);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      circles[i][j].display();
      circles[i][j].move(0.04);
    }
  }
}

class Circle {
  constructor(cx, cy, angle) {
    this._angle = angle;
    this.cx = cx;
    this.cy = cy;
  }

  get angle() {
    return this._angle * newK;
  }

  display() {
    push();
    translate(this.cx, this.cy);
    noFill();
    let c = map(abs(this.angle % TWO_PI), 0, TWO_PI, 0, 255);
    noStroke();
    fill(c);
    let x = r * cos(this.angle);
    let y = r * sin(this.angle);
    rect(x, y, 5, 5);
    pop();
  }

  move(speed) {
    this._angle -= speed;
  }
}