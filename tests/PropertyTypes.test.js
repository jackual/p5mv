import { describe, it, expect } from 'vitest'
import PropertyTypes from '../data/PropertyTypes.js'
import { truncateWithEllipsis } from '../lib/utils.js'

describe('PropertyTypes set/get conversions', () => {
    it('number type preserves 0 value as "0" string', () => {
        const t = PropertyTypes.number
        const stored = t.set('0')
        expect(stored).toBe(0)
        const display = t.get(stored)
        expect(display).toBe('0')
    })

    it('integer type preserves 0 value as "0" string', () => {
        const t = PropertyTypes.int
        const stored = t.set('0')
        expect(stored).toBe(0)
        const display = t.get(stored)
        expect(display).toBe('0')
    })

    it('float type preserves 0 value as "0" string', () => {
        const t = PropertyTypes.float
        const stored = t.set('0.0')
        expect(stored).toBe(0)
        const display = t.get(stored)
        expect(display).toBe('0')
    })

    it('percent type preserves 0 value as "0" string', () => {
        const t = PropertyTypes.percent
        const stored = t.set('0')
        expect(stored).toBe(0)
        const display = t.get(stored)
        expect(display).toBe('0')
    })

    it('text type passes values through unchanged', () => {
        const t = PropertyTypes.text
        const stored = t.set('0')
        expect(stored).toBe('0')
        const display = t.get(stored)
        expect(display).toBe('0')
    })

    it('colour type round-trips a hex value', () => {
        const t = PropertyTypes.colour
        const stored = t.set('#ff0000')
        const display = t.get(stored)
        expect(display.toUpperCase()).toBe('#FF0000')
    })
})

describe('truncateWithEllipsis behaviour', () => {
    it('formats 0 as "0"', () => {
        expect(truncateWithEllipsis(0)).toBe('0')
    })

    it('truncates a positive float and adds ellipsis when needed', () => {
        const formatted = truncateWithEllipsis(1.234567, 4)
        // 1.234567 truncated to 4 decimals -> 1.2345…
        expect(formatted).toBe('1.2345…')
    })
})