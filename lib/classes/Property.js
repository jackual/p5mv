import Eases from 'eases'
import PropertyTypes from '../../data/PropertyTypes.js'
import { beatsToFrameDuration } from '../timeUtils.js'

export default class Property {
    constructor(setup, settings = null) {
        this.id = setup.id
        this.type = setup.type
        this.label = setup.label
        // Convert default value to internal format (e.g., hex to HSL for colours)
        const propertyType = PropertyTypes[setup.type] || PropertyTypes['text']
        this.default = propertyType.set ? propertyType.set(setup.default) : setup.default
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

    setValue(newValue, delta, ease = false) {
        const convertedValue = this.convertValueSet(newValue)
        if (this.settings.mode != 'dynamic') {
            this.settings.value = convertedValue
            this.settings.mode = 'static'
        }
        else {
            this.setKeyframeValue(delta, newValue, ease)
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

    setKeyframeValue(delta, newValue, ease = false) {
        newValue = this.convertValueSet(newValue)
        if (this.settings.mode != 'dynamic') {
            this.makeDynamic()
        }
        if (!this.hasKeyframeAtDelta(delta)) {
            // Find the correct position to insert the keyframe to keep them sorted by position
            if (!this.disableTween && ease === false) {
                ease = 'sineInOut'
            }

            const newKeyframe = { position: delta, value: newValue, ease: ease }
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
                    item.ease = ease
                }
            })
        }
    }

    exportForRender(project) {
        switch (this.settings.mode) {
            case 'static':
                return { id: this.id, type: this.type, value: this.settings.value, mode: 'static' }
            case 'unset':
                return { id: this.id, type: this.type, value: this.default, mode: 'static' }
            case 'dynamic':
                return {
                    id: this.id, type: this.type, values: this.settings.value.map(item => {
                        return [beatsToFrameDuration(
                            item.position,
                            project.meta.bpm,
                            project.meta.fps
                        ), item.value, item.ease]
                    }), mode: 'dynamic'
                }
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

        if (!next || !prev || this.propertyType.disableTween || next.ease === false) {
            return prev?.value ?? next?.value
        }
        // Calculate the how far between the two keyframes the delta is (0-1)
        const range = next.position - prev.position
        const positionInRange = delta - prev.position
        const t = positionInRange / range

        return this.ease(prev.value, next.value, t, Eases[next.ease])
    }

    getForm(delta) {
        let value = '',
            placeholder = '',
            easeMenu = false,
            easeMenuValue = null,
            activeKeyframe = false,
            type = this.propertyType.formType
        switch (this.settings.mode) {
            case 'static':
                value = this.settings.value
                break
            case 'dynamic':
                if (this.hasKeyframeAtDelta(delta)) {
                    activeKeyframe = true
                    const keyframe = this.settings.value.find(item => item.position === delta)
                    value = keyframe.value
                    if (!this.propertyType.disableTween) {
                        easeMenu = true
                        easeMenuValue = keyframe.ease
                    }
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
        return {
            value,
            placeholder,
            activeKeyframe,
            type,
            easeMenu,
            easeMenuValue,
            step: this.propertyType.step,
            min: this.propertyType.min,
            max: this.propertyType.max
        }
    }

    export() {
        // Only export user-defined settings, not metadata that can be inferred from sketch
        return {
            mode: this.settings.mode,
            value: this.settings.mode === 'dynamic' && Array.isArray(this.settings.value)
                ? this.settings.value.map(keyframe => ({
                    position: keyframe.position,
                    value: keyframe.value,
                    ease: keyframe.ease
                }))
                : this.settings.value
        }
    }
}
