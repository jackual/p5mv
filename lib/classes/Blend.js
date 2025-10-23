export default class Blend {
    constructor(mode = "source-over", opacity = 1) {
        this.mode = mode
        this.opacity = opacity
    }
    get opacityPercentage() {
        return this.opacity * 100
    }
    set opacityPercentage(value) {
        this.opacity = Math.min(100, Math.max(0, value)) / 100
    }
}