
// Easing functions from the eases npm package, browser compatible
// All functions are attached to the global Eases object

const __Eases = {
    linear: function (t) {
        return t;
    },
    quadIn: function (t) {
        return t * t;
    },
    quadOut: function (t) {
        return -t * (t - 2.0);
    },
    quadInOut: function (t) {
        t /= 0.5;
        if (t < 1) return 0.5 * t * t;
        t--;
        return -0.5 * (t * (t - 2) - 1);
    },
    cubicIn: function (t) {
        return t * t * t;
    },
    cubicOut: function (t) {
        var f = t - 1.0;
        return f * f * f + 1.0;
    },
    cubicInOut: function (t) {
        return t < 0.5
            ? 4.0 * t * t * t
            : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    },
    quartIn: function (t) {
        return Math.pow(t, 4.0);
    },
    quartOut: function (t) {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    },
    quartInOut: function (t) {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
    },
    quintIn: function (t) {
        return t * t * t * t * t;
    },
    quintOut: function (t) {
        return --t * t * t * t * t + 1;
    },
    quintInOut: function (t) {
        if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    },
    sineIn: function (t) {
        var v = Math.cos(t * Math.PI * 0.5);
        if (Math.abs(v) < 1e-14) return 1;
        else return 1 - v;
    },
    sineOut: function (t) {
        return Math.sin(t * Math.PI / 2);
    },
    sineInOut: function (t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    },
    expoIn: function (t) {
        return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    },
    expoOut: function (t) {
        return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
    },
    expoInOut: function (t) {
        return (t === 0.0 || t === 1.0)
            ? t
            : t < 0.5
                ? +0.5 * Math.pow(2.0, (20.0 * t) - 10.0)
                : -0.5 * Math.pow(2.0, 10.0 - (t * 20.0)) + 1.0;
    },
    circIn: function (t) {
        return 1.0 - Math.sqrt(1.0 - t * t);
    },
    circOut: function (t) {
        return Math.sqrt(1 - (--t * t));
    },
    circInOut: function (t) {
        if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },
    backIn: function (t) {
        var s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    backOut: function (t) {
        var s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    },
    backInOut: function (t) {
        var s = 1.70158 * 1.525;
        if ((t *= 2) < 1)
            return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },
    bounceOut: function (t) {
        var a = 4.0 / 11.0;
        var b = 8.0 / 11.0;
        var c = 9.0 / 10.0;
        var ca = 4356.0 / 361.0;
        var cb = 35442.0 / 1805.0;
        var cc = 16061.0 / 1805.0;
        var t2 = t * t;
        return t < a
            ? 7.5625 * t2
            : t < b
                ? 9.075 * t2 - 9.9 * t + 3.4
                : t < c
                    ? ca * t2 - cb * t + cc
                    : 10.8 * t * t - 20.52 * t + 10.72;
    },
    bounceIn: function (t) {
        return 1.0 - Eases.bounceOut(1.0 - t);
    },
    bounceInOut: function (t) {
        return t < 0.5
            ? 0.5 * (1.0 - Eases.bounceOut(1.0 - t * 2.0))
            : 0.5 * Eases.bounceOut(t * 2.0 - 1.0) + 0.5;
    },
    elasticIn: function (t) {
        return Math.sin(13.0 * t * Math.PI / 2) * Math.pow(2.0, 10.0 * (t - 1.0));
    },
    elasticOut: function (t) {
        return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0;
    },
    elasticInOut: function (t) {
        return t < 0.5
            ? 0.5 * Math.sin(+13.0 * Math.PI / 2 * 2.0 * t) * Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
            : 0.5 * Math.sin(-13.0 * Math.PI / 2 * ((2.0 * t - 1.0) + 1.0)) * Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;
    }
};
