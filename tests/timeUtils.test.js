import { describe, it, expect } from 'vitest'
import { beatsToMusicalTimeString } from '../lib/timeUtils.js'

describe('beatsToMusicalTimeString', () => {
    describe('standard fraction output', () => {
        it('converts 0 beats correctly', () => {
            expect(beatsToMusicalTimeString(0)).toBe('0 beats')
        })

        it('converts 1 beat correctly', () => {
            expect(beatsToMusicalTimeString(1)).toBe('1 beat')
        })

        it('converts 4 beats (1 bar) correctly', () => {
            expect(beatsToMusicalTimeString(4)).toBe('1 bar')
        })

        it('converts 0.5 beats correctly', () => {
            expect(beatsToMusicalTimeString(0.5)).toBe('½ beat')
        })

        it('converts 0.25 beats correctly', () => {
            expect(beatsToMusicalTimeString(0.25)).toBe('¼ beat')
        })

        it('converts 0.125 beats correctly', () => {
            expect(beatsToMusicalTimeString(0.125)).toBe('⅛ beat')
        })

        it('converts 1/3 beat correctly', () => {
            expect(beatsToMusicalTimeString(1 / 3)).toBe('⅓ beat')
        })

        it('converts multiple bars correctly', () => {
            expect(beatsToMusicalTimeString(8)).toBe('2 bars')
        })

        it('converts bars and beats correctly', () => {
            expect(beatsToMusicalTimeString(5)).toBe('1 bar 1 beat')
        })

        it('converts bars and fractional beats correctly', () => {
            expect(beatsToMusicalTimeString(4.5)).toBe('1 bar ½ beat')
        })

        it('converts complex values correctly', () => {
            expect(beatsToMusicalTimeString(9.25)).toBe('2 bars 1¼ beats')
        })
    })

    describe('British note name output', () => {
        it('returns Breve for 8 beats', () => {
            expect(beatsToMusicalTimeString(8, true)).toBe('2 bars (Breve)')
        })

        it('returns Semibreve for 4 beats', () => {
            expect(beatsToMusicalTimeString(4, true)).toBe('1 bar (Semibreve)')
        })

        it('returns Minim for 2 beats', () => {
            expect(beatsToMusicalTimeString(2, true)).toBe('2 beats (Minim)')
        })

        it('returns Crotchet for 1 beat', () => {
            expect(beatsToMusicalTimeString(1, true)).toBe('1 beat (Crotchet)')
        })

        it('returns Quaver for 0.5 beat', () => {
            expect(beatsToMusicalTimeString(0.5, true)).toBe('½ beat (Quaver)')
        })

        it('returns Quaver Triplet for 1/3 beat', () => {
            expect(beatsToMusicalTimeString(1 / 3, true)).toBe('⅓ beat (Quaver Triplet)')
        })

        it('returns Semiquaver for 0.25 beat', () => {
            expect(beatsToMusicalTimeString(0.25, true)).toBe('¼ beat (Semiquaver)')
        })

        it('returns Demisemiquaver for 0.125 beat', () => {
            expect(beatsToMusicalTimeString(0.125, true)).toBe('⅛ beat (Demisemiquaver)')
        })

        it('does not append note name for non-standard values', () => {
            expect(beatsToMusicalTimeString(2.75, true)).toBe('2¾ beats')
        })

        it('does not append note name for values with bars (using beat portion)', () => {
            expect(beatsToMusicalTimeString(5, true)).toBe('1 bar 1 beat')
        })

        it('does not append note name for values with bars (using beat portion)', () => {
            expect(beatsToMusicalTimeString(6, true)).toBe('1 bar 2 beats')
        })
    })
})
