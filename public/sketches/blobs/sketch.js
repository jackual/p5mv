function preload() {
    brush.preload();
}

function setup() {
    p5mv.setup(true)
    angleMode(DEGREES);
    background("#fffceb");

    // Scale brushes to adapt to canvas size
    brush.scaleBrushes(1.5);

    // Activate the flowfield we're going to use
    brush.field("seabed");
}

function draw() {
    background("#ffffffff");

    let palette = [
        "#FF1744", // vivid red
        "#2979FF", // bold blue
        "#00E676", // bright green
        "#FFD600", // strong yellow
        "#AA00FF", // vibrant purple
        "#FF9100"  // orange
    ];
    //noLoop()
    translate(-width / 2, -height / 2)

    let available_brushes = brush.box();
    let t = millis() * 0.001;
    for (let j = 0; j < 15; j++) {
        // All brushes follow the same wave, offset by their row
        let baseY = 60 + j * 28;
        let wave = sin(t * 2 + baseY * 0.03) * 80;
        let waveX = 60 + wave;
        let endX = 600 + wave;
        let endY = baseY + cos(t * 2.2) * 40;
        // Use a thick, translucent, saturated color for CD pen effect
        let penColor = color(palette[j % palette.length]);
        penColor.setAlpha(180); // semi-translucent
        brush.set(available_brushes[10], penColor.toString(), 8); // thicker stroke
        brush.flowLine(waveX, baseY, endX, endY, 32); // even thicker line
        // Optional: add a subtle glow/bleed effect
        brush.set(available_brushes[10], penColor.toString(), 20);
        brush.flowLine(waveX, baseY, endX, endY, 40);
    }
}