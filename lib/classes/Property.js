import Eases from 'eases'
import PropertyTypes from '@/data/PropertyTypes.js'

export default class Property {
    constructor(setup, settings = null) {
        console.log('Initializing Property with setup:', setup)
        this.id = setup.id
        this.type = setup.type
        this.label = setup.label
        this.default = setup.default
        this.settings = settings || { mode: 'unset', value: null }
    }

    get propertyType() {
        return PropertyTypes[this.type] || PropertyTypes['text']
    }


    makeUnset() {
        this.settings = { mode: 'unset', value: null }
    }

    convertValueSet(value) {
        return this.propertyType.set(value)
    }

    convertValueGet(value) {
        return this.propertyType.get(value)
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
            // Find the correct position to insert the keyframe to keep them sorted by position
            const newKeyframe = { position: delta, value: newValue }
            const insertIndex = this.settings.value.findIndex(item => item.position > delta)

            if (insertIndex === -1) {
                // If no keyframe has a position greater than delta, add to the end
                this.settings.value.push(newKeyframe)
            } else {
                // Insert at the correct position to maintain order
                this.settings.value.splice(insertIndex, 0, newKeyframe)
            }
        }
        else {
            this.settings.value.forEach(item => {
                if (item.position === delta) {
                    item.value = newValue
                }
            })
        }
    }

    hasKeyframeAtDelta(delta) {
        if (this.settings.mode != 'dynamic') return null
        if (!Array.isArray(this.settings.value)) return false
        return this.settings.value.some(item => item.position === delta)
    }

    previousKeyframe(delta) {
        if (this.settings.mode != 'dynamic') return null
        const keyframes = this.settings.value.filter(item => item.position < delta)
        if (keyframes.length === 0) return null
        return keyframes.reduce((prev, current) => (prev.position > current.position) ? prev : current)
    }

    nextKeyframe(delta) {
        if (this.settings.mode != 'dynamic') return null
        const keyframes = this.settings.value.filter(item => item.position > delta)
        if (keyframes.length === 0) return null
        return keyframes.reduce((prev, current) => (prev.position < current.position) ? prev : current)
    }

    ease(a, b, t, easeFunc) {
        if (typeof a === 'object')
            return a.map((val, index) => this.ease(val, b[index], t, easeFunc))
        return a + (b - a) * easeFunc(t)
    }

    getTweenFromDelta(delta) {
        const prev = this.previousKeyframe(delta)
        const next = this.nextKeyframe(delta)
        if (!next || !prev) {
            return prev?.value || next?.value
        }
        // Calculate the how far between the two keyframes the delta is (0-1)
        const range = next.position - prev.position
        const positionInRange = delta - prev.position
        const t = positionInRange / range

        return this.ease(prev.value, next.value, t, Eases['linear'])
    }

    getForm(delta) {
        let value = '',
            placeholder = '',
            activeKeyframe = false,
            type = this.propertyType.formType
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
                    placeholder = this.getTweenFromDelta(delta)
                }
                break
            case 'unset':
                placeholder = this.default
                break
        }

        if (value !== '')
            value = this.convertValueGet(value)

        if (placeholder !== '')
            placeholder = this.convertValueGet(placeholder)

        if (type === 'color' && placeholder)
            value = placeholder
        return { value, placeholder, activeKeyframe, type }
    }

    export() {

    }
}
