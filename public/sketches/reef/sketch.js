//seperate old commit that one was nice too. make into different versions system

function preload() {
    brush.preload();
}

let palette = ["#ff1fb1ff", "#d52b2bff", "#00a2ffff", "#211c20ff", "#f6684f", "#0d00ffff"];
let brushStrokes = [];
let time = 0;

function setup() {
    p5mv.setup(true)
    angleMode(DEGREES);
    background("#fffceb");

    // Scale brushes to adapt to canvas size
    brush.scaleBrushes(1.5);

    // Activate the flowfield we're going to use
    brush.field("seabed");

    // Initialize animated brush strokes with movement patterns
    let available_brushes = brush.box();
    for (let i = 0; i < 15; i++) {
        brushStrokes.push({
            brushType: available_brushes[10],
            color: random(palette),
            startX: random(width),
            startY: random(height),
            targetX: random(width),
            targetY: random(height),
            offset: random(TWO_PI),
            speed: random(0.3, 1.5),
            rotationSpeed: random(0.01, 0.05),
            amplitude: random(15, 40),
            length: random(60, 120),
            angle: random(360),
            orbitRadius: random(100, 300),
            pathType: random(['circular', 'figure8', 'spiral', 'linear'])
        });
    }
}

function draw() {
    background("#f1c8a3ff");
    translate(-width / 2, -height / 2);

    time += 0.02;

    // Draw animated brush strokes moving around the canvas
    brushStrokes.forEach((stroke, index) => {
        let centerX, centerY;

        // Different movement patterns based on pathType
        switch (stroke.pathType) {
            case 'circular':
                // Circular orbiting motion - use multiple orbit centers
                let orbitCenterX = (index % 3) * width / 3 + width / 6;
                let orbitCenterY = Math.floor(index / 3) * height / 3 + height / 6;
                centerX = orbitCenterX + cos(time * stroke.speed + stroke.offset) * stroke.orbitRadius * 0.8;
                centerY = orbitCenterY + sin(time * stroke.speed + stroke.offset) * stroke.orbitRadius * 0.6;
                break;

            case 'figure8':
                // Figure-8 pattern - spread across screen
                centerX = width * 0.3 + sin(time * stroke.speed + stroke.offset) * width * 0.4;
                centerY = height * 0.3 + sin(time * stroke.speed * 2 + stroke.offset) * height * 0.4;
                break;

            case 'spiral':
                // Expanding/contracting spiral - larger range
                let spiralRadius = stroke.orbitRadius + sin(time * stroke.speed * 0.5 + stroke.offset) * 100;
                let spiralCenterX = width * (0.2 + (index % 4) * 0.2);
                let spiralCenterY = height * (0.2 + Math.floor(index / 4) * 0.2);
                centerX = spiralCenterX + cos(time * stroke.speed + stroke.offset) * spiralRadius * 0.6;
                centerY = spiralCenterY + sin(time * stroke.speed + stroke.offset) * spiralRadius * 0.8;
                break;

            case 'linear':
                // Linear back and forth motion - full screen sweep
                centerX = 20 + (cos(time * stroke.speed + stroke.offset) + 1) * (width - 40) / 2;
                centerY = 20 + (sin(time * stroke.speed * 0.7 + stroke.offset) + 1) * (height - 40) / 2;
                break;
        }

        // Add multiple layers of organic oscillation for very curvy movement
        let wobble1X = sin(time * 2 + stroke.offset) * stroke.amplitude * 0.6;
        let wobble1Y = cos(time * 1.5 + stroke.offset) * stroke.amplitude * 0.6;

        let wobble2X = sin(time * 3.7 + stroke.offset * 1.3) * stroke.amplitude * 0.4;
        let wobble2Y = cos(time * 2.8 + stroke.offset * 1.7) * stroke.amplitude * 0.4;

        let wobble3X = sin(time * 1.2 + stroke.offset * 2.1) * stroke.amplitude * 0.3;
        let wobble3Y = cos(time * 4.1 + stroke.offset * 0.8) * stroke.amplitude * 0.3;

        centerX += wobble1X + wobble2X + wobble3X;
        centerY += wobble1Y + wobble2Y + wobble3Y;

        // Update rotation
        stroke.angle += stroke.rotationSpeed * 60; // Convert to degrees per frame

        // Calculate curved brush stroke with multiple segments for smooth curves
        let segments = 8; // Number of curve segments
        let curveAmplitude = stroke.amplitude * 2; // How curvy the strokes are
        let curveFrequency = 0.05; // Frequency of the curves

        // Set brush properties with slight transparency for overlapping effect
        brush.set(stroke.brushType, stroke.color, 3);

        // Create a flowing curved path instead of straight line
        let points = [];
        for (let i = 0; i <= segments; i++) {
            let t = i / segments;
            let baseX = centerX + (t - 0.5) * stroke.length * cos(stroke.angle);
            let baseY = centerY + (t - 0.5) * stroke.length * sin(stroke.angle);

            // Add multiple layers of curves for organic feel
            let curve1 = sin(t * PI * 3 + time * 2 + stroke.offset) * curveAmplitude * 0.6;
            let curve2 = cos(t * PI * 2 + time * 1.5 + stroke.offset * 2) * curveAmplitude * 0.4;
            let curve3 = sin(t * PI * 4 + time * 3 + stroke.offset * 0.5) * curveAmplitude * 0.2;

            let totalCurve = curve1 + curve2 + curve3;

            // Apply curve perpendicular to the main direction
            let perpX = -sin(stroke.angle) * totalCurve;
            let perpY = cos(stroke.angle) * totalCurve;

            points.push({
                x: baseX + perpX,
                y: baseY + perpY
            });
        }

        // Draw the curved brush stroke using multiple connected flowLines
        for (let i = 0; i < points.length - 1; i++) {
            brush.flowLine(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 12);
        }

        // Add extra curvy details with smaller brush strokes
        if (index % 3 === 0) {
            brush.set(stroke.brushType, stroke.color, 2);
            let detailX = centerX + sin(time * 4 + stroke.offset) * curveAmplitude;
            let detailY = centerY + cos(time * 3 + stroke.offset) * curveAmplitude;
            let detailEndX = detailX + cos(stroke.angle + 30) * stroke.length * 0.3;
            let detailEndY = detailY + sin(stroke.angle + 30) * stroke.length * 0.3;
            brush.flowLine(detailX, detailY, detailEndX, detailEndY, 8);
        }

        // Add curvy trailing effects that follow the brush in S-curves
        if (true) {
            brush.set(stroke.brushType, stroke.color, 0.2);

            // Create curvy trail effects
            for (let t = 0; t < 3; t++) {
                let trailOffset = t * 0.3 + 0.2;
                let curvyTrailX = centerX - cos(stroke.angle + sin(time * 4 + t) * 60) * stroke.length * trailOffset;
                let curvyTrailY = centerY - sin(stroke.angle + cos(time * 3 + t) * 45) * stroke.length * trailOffset;

                // Add spiral curve to the trail
                curvyTrailX += sin(time * 5 + t + stroke.offset) * 15;
                curvyTrailY += cos(time * 4.2 + t + stroke.offset) * 12;

                brush.circle(curvyTrailX, curvyTrailY, random(2, 6));
            }
        }

        // Occasionally change direction for more dynamic movement
        if (frameCount % (300 + index * 20) === 0) {
            stroke.targetX = random(width);
            stroke.targetY = random(height);
            stroke.pathType = random(['circular', 'figure8', 'spiral', 'linear']);
        }
    });

    // Add floating particles with curvy, snake-like movement patterns
    for (let i = 0; i < 12; i++) {
        brush.set("marker", palette[i % palette.length], 1);

        // Create snake-like curvy movement for particles
        let baseParticleX = 30 + cos(time * 0.8 + i * 30) * (width - 60) * 0.5 + (width - 60) * 0.5;
        let baseParticleY = 30 + sin(time * 0.6 + i * 45) * (height - 60) * 0.5 + (height - 60) * 0.5;

        // Add multiple sine waves for very curvy motion
        let curveX1 = sin(time * 2 + i * 0.5) * 50;
        let curveY1 = cos(time * 1.8 + i * 0.7) * 45;
        let curveX2 = sin(time * 3.2 + i * 1.1) * 25;
        let curveY2 = cos(time * 2.5 + i * 0.9) * 30;

        let particleX = baseParticleX + curveX1 + curveX2;
        let particleY = baseParticleY + curveY1 + curveY2;

        // Create curvy particle trails that loop and swirl
        brush.circle(particleX, particleY, random(2, 6));

        // Add curvy trailing dots that follow in S-patterns
        for (let trail = 1; trail <= 3; trail++) {
            let trailDelay = trail * 0.8;
            let trailX = baseParticleX + sin(time * 2 + i * 0.5 - trailDelay) * 50 * (1 - trail * 0.2) +
                sin(time * 3.2 + i * 1.1 - trailDelay) * 25 * (1 - trail * 0.3);
            let trailY = baseParticleY + cos(time * 1.8 + i * 0.7 - trailDelay) * 45 * (1 - trail * 0.2) +
                cos(time * 2.5 + i * 0.9 - trailDelay) * 30 * (1 - trail * 0.3);

            brush.circle(trailX, trailY, random(1, 3));
        }

        // Add swirling particles for corners and edges with figure-8 patterns
        if (i < 4) {
            let edgeBaseX = (i % 2) * width;
            let edgeBaseY = Math.floor(i / 2) * height;
            let edgeX = edgeBaseX + sin(time * 1.5 + i * 90) * cos(time + i * 90) * 80;
            let edgeY = edgeBaseY + cos(time * 1.2 + i * 90) * sin(time * 2 + i * 90) * 60;
            brush.circle(edgeX, edgeY, random(1, 4));
        }
    }
}