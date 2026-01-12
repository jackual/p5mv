/* p5mv Library */

const __p5mv = {
    height: null,
    width: null
}

let p5mv = {
    get dims() {
        return [__p5mv.height, __p5mv.width]
    },
    get i() {
        return frameCount
    },
    get height() {
        return __p5mv.height
    },
    get width() {
        return __p5mv.width
    }
}

const _createCanvas = p5.prototype.createCanvas
p5.prototype.createCanvas = function (...args) {
    __p5mv.width = args[0]
    __p5mv.height = args[1]
    return _createCanvas.apply(this, args)
}

const inputs = JSON.parse(document.querySelector('#p5mv-json').innerHTML).inputs
for (let i of inputs) {
    if (i.type == 'colour')
        p5mv[i.id] = i.default
}

Object.freeze(p5mv)