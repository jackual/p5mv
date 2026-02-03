//////////////////////////////////////////////////
// Object for creation and real-time resize of canvas
const C = {
    loaded: false,
    prop() {return this.height/this.width},
    isLandscape() {return window.innerHeight <= window.innerWidth * this.prop()},
    resize () {
        if (this.isLandscape()) {
            document.getElementById(this.css).style.height = "100%";
            document.getElementById(this.css).style.removeProperty('width');
        } else {
            document.getElementById(this.css).style.removeProperty('height');
            document.getElementById(this.css).style.width = "100%";
        }
    },
    setSize(w,h,p,css) {
        this.width = w; this.height = h; this.pD = p; this.css = css;
    },
    createCanvas() {
        frameRate(5)
        this.main = createCanvas(this.width,this.height,WEBGL);
        pixelDensity(this.pD);
        this.main.id(this.css);
        this.resize();
    }
};
C.setSize(1500,1500,1,'mainCanvas');

function windowResized () { C.resize(); }

//////////////////////////////////////////////////
// Animated spirals — safe redraw-each-frame approach
let palette = ["#002185", "#003c32", "#AA9008", "#258C9B"];
let spirals = [];
let NUM_SPIRALS = 3;

function setup () {
  frameRate(5)
    C.createCanvas();
    angleMode(DEGREES);
    background("#cebfff");

    // brush initial config
    brush.scaleBrushes(1.5);
    brush.field("seabed"); // baseline field (we'll switch per-draw as needed)

    // create spiral data
    for (let j = 0; j < NUM_SPIRALS; j++) {
        const total = Math.floor(random(40, 120)); // number of "i" loops (each loop = 4 segments)
        const pressures = [];
        for (let i = 0; i < total; i++) {
            // precompute 4 pressures for the 4 mini-arcs so rendering is stable across frames
            pressures.push({
                p0: random(0.6, 1.6),
                p1: random(0.6, 1.6),
                p2: random(0.6, 1.6),
                p3: random(0.6, 1.6)
            });
        }

        spirals.push({
            col: random(palette),
            x: width * random(0.1, 0.9),
            y: height * random(0.1, 0.9),
            init_angle: random(0, 360),
            totalSegments: total,
            current: 0,
            step: Math.floor(random(1, 4)), // how many 'i' steps to add per frame
            pressures
        });
    }
}

function draw () {
    // clear and set up top-left coordinate system (same as original)
    background("#fffceb");
    push();
    translate(-width/2, -height/2);

    // draw each spiral by reconstructing it up to s.current
    for (let s of spirals) {
        // increment progress (clamp to totalSegments)
        if (s.current < s.totalSegments) {
            s.current = Math.min(s.totalSegments, s.current + s.step);
        }

        // we only draw when we have at least 1 segment to show
        if (s.current > 0) {
            brush.pick("marker2");
            brush.field("curved");      // the flowing field for drawing this spiral
            brush.stroke(s.col);

            // IMPORTANT: call beginStroke(), then all segment() calls for this stroke,
            // then endStroke() — all inside the same frame to avoid internal errors.
            brush.beginStroke("curve", s.x, s.y);

            // draw i-loops up to current
            for (let i = 0; i < s.current; i++) {
                const a = s.init_angle;
                const lenBase = i * 25;

                // use precomputed pressures so the look doesn't jitter each frame
                const ps = s.pressures[i];
                brush.segment(0 + a,   0 + lenBase,   ps.p0);
                brush.segment(90 + a,  8 + lenBase,   ps.p1);
                brush.segment(180 + a, 13 + lenBase,  ps.p2);
                brush.segment(270 + a, 18 + lenBase,  ps.p3);
            }

            // end stroke every frame (safe). The library sees a full stroke created in this frame.
            brush.endStroke(0 + s.init_angle, 1);
        }
    }

    pop();

    // OPTIONAL: if you want the spirals to loop forever, uncomment below:
    // for (let s of spirals) {
    //     if (s.current >= s.totalSegments) {
    //         // reset and randomize a bit
    //         s.current = 0;
    //         s.init_angle += random(-30, 30);
    //         // (you could also rebuild s.pressures here for variety)
    //     }
    // }
}