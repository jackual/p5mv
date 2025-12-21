import { describe, it, expect } from 'vitest'
import Property from '../lib/classes/Property.js'
import Eases from 'eases'

const numberSetup = {
    id: 'prop1',
    type: 'number',
    label: 'Test Property',
    default: 0
}

describe('Property keyframe behavior', () => {
    it('adds keyframes in sorted order and sets default ease', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(10, 100)
        prop.setKeyframeValue(5, 50)
        prop.setKeyframeValue(20, 200)

        expect(prop.settings.mode).toBe('dynamic')
        expect(prop.settings.value.map(k => k.position)).toEqual([5, 10, 20])
        // default ease should be applied when none given and tweening enabled
        expect(prop.settings.value[0].ease).toBe('sineInOut')
    })

    it('updates existing keyframe at same delta', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(10, 100)
        prop.setKeyframeValue(10, 150, 'quadIn')

        expect(prop.settings.value).toHaveLength(1)
        expect(prop.settings.value[0].position).toBe(10)
        expect(prop.settings.value[0].value).toBe(150)
        expect(prop.settings.value[0].ease).toBe('quadIn')
    })

    it('detects keyframes at a given delta', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(5, 50)

        expect(prop.hasKeyframeAtDelta(5)).toBe(true)
        expect(prop.hasKeyframeAtDelta(10)).toBe(false)
    })

    it('finds previous and next keyframes correctly', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(5, 50)
        prop.setKeyframeValue(10, 100)
        prop.setKeyframeValue(20, 200)

        expect(prop.previousKeyframe(0)).toBeNull()
        expect(prop.previousKeyframe(12)?.position).toBe(10)
        expect(prop.nextKeyframe(12)?.position).toBe(20)
        expect(prop.nextKeyframe(25)).toBeNull()
    })

    it('tweens between numeric keyframes using easing', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(0, 0)
        prop.setKeyframeValue(10, 100, 'sineInOut')

        const delta = 5
        const tweened = prop.getTweenFromDelta(delta)

        const t = (delta - 0) / (10 - 0)
        const expected = 0 + (100 - 0) * Eases['sineInOut'](t)

        expect(tweened).toBeCloseTo(expected, 5)
    })

    it('returns edge keyframe values when tweening is not possible', () => {
        const prop = new Property(numberSetup)

        // manually set dynamic keyframes with step behavior (ease === false)
        prop.settings.mode = 'dynamic'
        prop.settings.value = [
            { position: 0, value: 0, ease: false },
            { position: 10, value: 100, ease: false }
        ]

        // before first keyframe uses first next keyframe value
        expect(prop.getTweenFromDelta(-5)).toBe(0)
        // between keyframes with step behavior, holds previous value
        expect(prop.getTweenFromDelta(5)).toBe(0)
        // after last keyframe stays on last keyframe value
        expect(prop.getTweenFromDelta(15)).toBe(100)
    })

    it('getForm returns active keyframe info when present', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(10, 42)
        const form = prop.getForm(10)

        expect(form.activeKeyframe).toBe(true)
        // value is formatted for form display (string)
        expect(form.value).toBe('42')
        expect(form.placeholder).toBe('')
        expect(form.easeMenu).toBe(true)
        expect(form.easeMenuValue).toBe('sineInOut')
    })

    it('getForm returns tweened placeholder when between keyframes', () => {
        const prop = new Property(numberSetup)

        prop.setKeyframeValue(0, 0)
        prop.setKeyframeValue(10, 100)

        const form = prop.getForm(5)

        expect(form.activeKeyframe).toBe(false)
        expect(form.value).toBe('')
        // placeholder should be a numeric value between 0 and 100
        expect(typeof form.placeholder).toBe('string')
        const numericPlaceholder = parseFloat(form.placeholder)
        expect(numericPlaceholder).toBeGreaterThan(0)
        expect(numericPlaceholder).toBeLessThan(100)
    })

    it('getForm after last keyframe with value 0 does not show NaN', () => {
        const prop = new Property(numberSetup)

        // Last keyframe has value 0
        prop.setKeyframeValue(0, 50)
        prop.setKeyframeValue(10, 0)

        // Delta after the last keyframe
        const form = prop.getForm(15)

        expect(form.activeKeyframe).toBe(false)
        expect(form.value).toBe('')
        // Bug: placeholder becomes "NaN…" because getTweenFromDelta returns 0,
        // which then gets passed through convertValueGet
        expect(form.placeholder).not.toContain('NaN')
        expect(form.placeholder).toBe('0')
    })
})
