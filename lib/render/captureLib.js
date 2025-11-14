const p5mv = {};

captureInput.inputs.map(input => {
    Object.defineProperty(p5mv, input.id, {
        get() {
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
                        // nextKeyframe[2] is either false (use next value, i.e. step), or a string for __Eases
                        let easeFunc = t => t;
                        if (nextKeyframe.length > 2 && nextKeyframe[2]) {
                            if (typeof nextKeyframe[2] === 'string' && __Eases[nextKeyframe[2]]) {
                                easeFunc = __Eases[nextKeyframe[2]];
                            }
                        } else if (nextKeyframe.length > 2 && nextKeyframe[2] === false) {
                            // Step: jump to next value at nextKeyframe
                            return frameCount < nextKeyframe[0] ? previousKeyframe[1] : nextKeyframe[1];
                        }
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

            function hslToHex(h, s, l) {
                s = s * 100;
                l = l * 100;
                l /= 100;
                const a = s * Math.min(l, 1 - l) / 100;
                const f = n => {
                    const k = (n + h / 30) % 12;
                    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
                };
                return `#${f(0)}${f(8)}${f(4)}`;
            }

            // Prefer the capture index set by the renderer; fallback to p5's frameCount if not present
            const idx = (typeof window !== 'undefined' && typeof window.__frameIndex === 'number')
                ? window.__frameIndex
                : (typeof frameCount !== 'undefined' ? frameCount : 0);
            let value = getInputValue(input.id, idx);
            if (input.type === 'colour') {
                value = hslToHex(...value);
            }
            return value;
        },
        enumerable: true
    });
});