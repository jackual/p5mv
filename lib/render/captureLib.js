function getInputValue(id, frameCount) {
    const input = captureInput.inputs.find(input => input.id === id);
    if (!input) return null;

    if (input.mode === "static") {
        return input.value;
    }
    else if (input.mode === "dynamic") {
        // check if exact keyframe exists at frameCount
        const sameKeyframe = input.values.find(kf => kf[0] === frameCount);
        if (sameKeyframe) {
            return sameKeyframe[1];
        }
        // else, interpolate between previous and next keyframe
        const previousKeyframes = input.values.filter(kf => kf[0] < frameCount);
        const nextKeyframes = input.values.filter(kf => kf[0] > frameCount);
        const previousKeyframe = previousKeyframes.length > 0 ? previousKeyframes.reduce((a, b) => (a[0] > b[0] ? a : b)) : null;
        const nextKeyframe = nextKeyframes.length > 0 ? nextKeyframes.reduce((a, b) => (a[0] < b[0] ? a : b)) : null;

        if (previousKeyframe && nextKeyframe) {
            const t = (frameCount - previousKeyframe[0]) / (nextKeyframe[0] - previousKeyframe[0]);
            const easeFunc = (t => t); // Linear easing for now
            const easedT = easeFunc(t);

            // Handle different types of values
            const prevVal = previousKeyframe[1];
            const nextVal = nextKeyframe[1];

            if (Array.isArray(prevVal)) {
                // Handle arrays (like RGB colors, vectors, etc.)
                return prevVal.map((val, i) => val + (nextVal[i] - val) * easedT);
            } else if (typeof prevVal === 'number') {
                // Handle numbers
                return prevVal + (nextVal - prevVal) * easedT;
            } else {
                // For non-interpolable types, return the previous value
                return prevVal;
            }
        }

        // If only one keyframe exists, return that value
        return previousKeyframe?.[1] || nextKeyframe?.[1] || null;
    }

    return null;
}

const p5mv = {};

captureInput.inputs.map(input => {
    Object.defineProperty(p5mv, input.id, {
        get() {
            return getInputValue(input.id, frameCount);
        },
        enumerable: true
    });
});