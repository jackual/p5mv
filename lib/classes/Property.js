export default class Property {
    constructor(setup, settings = {}) {
        console.log('Initializing Property with setup:', setup)
        this.id = setup.id
        this.type = setup.type
        this.label = setup.label
        this.default = setup.default
        this.settings = settings || { mode: 'unset', value: null }
    }


    makeUnset() {
        this.settings = { mode: 'unset', value: null }
    }

    convertValueSet(value) {
        switch (this.type) {
            case 'number':
                return parseFloat(value)
        }
    }

    convertValueGet(value) {
        switch (this.type) {
            default:
                return value
        }
    }

    makeDynamic() {
        this.settings = { mode: 'dynamic', value: [] }
    }

    setValue(newValue, delta) {
        const convertedValue = this.convertValueSet(newValue)
        if (this.settings.mode != 'dynamic') {
            this.settings.value = convertedValue
            this.settings.mode = 'static'
        }
        else {
            this.setKeyframeValue(delta, newValue)
        }
    }

    removeValue(delta) {
        if (this.settings.mode != 'dynamic') this.makeUnset()
        else {
            // Remove keyframe at delta
            this.settings.value = this.settings.value.filter(item => item.position !== delta)
            // If no keyframes left, make unset
            if (this.settings.value.length === 0) {
                this.makeUnset()
            }
        }
    }

    setKeyframeValue(delta, newValue) {
        newValue = this.convertValueSet(newValue)
        if (this.settings.mode != 'dynamic') this.makeDynamic()
        if (!this.hasKeyframeAtDelta(delta)) {
            this.settings.value.push({ position: delta, value: newValue })
        }
        else {
            this.settings.value = this.settings.value.forEach(item => {
                if (item.position === delta) {
                    item.value = newValue
                }
            })
        }
    }

    getType(type) {
        switch (type) {
            case 'number':
            case 'int':
            case 'float':
            case 'percent':
                return 'number'
            case 'colour':
            case 'color':
                return 'color'
            case 'text':
            default:
                return 'text'
        }
    }

    hasKeyframeAtDelta(delta) {
        if (this.settings.mode != 'dynamic') return null
        return this.settings.value.some(item => item.position === delta)
    }

    getForm(delta) {
        let value = '',
            placeholder = '',
            activeKeyframe = false,
            type = this.getType(this.type)
        switch (this.settings.mode) {
            case 'static':
                value = this.settings.value
                break
            case 'dynamic':
                if (this.hasKeyframeAtDelta(delta)) {
                    activeKeyframe = true
                    value = this.settings.value.find(item => item.position === delta).value
                }
                else {
                    placeholder = 'tweened here'
                }
                break
            case 'unset':
                placeholder = this.default
                break
        }
        return { value, placeholder, activeKeyframe, type }
    }

    export() {

    }
}
