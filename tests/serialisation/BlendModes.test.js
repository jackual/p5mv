import { describe, it, expect } from 'vitest'
import Project from '../../lib/classes/Project.js'
import Blend from '../../lib/classes/Blend.js'

describe('Blend mode serialization', () => {
    const blendModes = [
        'source-over', 'copy', 'xor',
        'darken', 'multiply', 'color-burn',
        'lighten', 'screen', 'color-dodge',
        'overlay', 'soft-light', 'hard-light',
        'difference', 'exclusion',
        'hue', 'saturation', 'color', 'luminosity',
        'source-in', 'source-out', 'source-atop',
        'destination-over', 'destination-in', 'destination-out', 'destination-atop'
    ]

    blendModes.forEach(blendMode => {
        it(`preserves ${blendMode} blend mode through roundtrip`, () => {
            const project = new Project()
            const track = project.tracks[0]

            track.addRegionAt(0)
            const region = track.regions[0]
            region.blend = new Blend(blendMode, 1)

            const exported = project.export()
            const reimported = new Project(JSON.stringify(exported))

            const reimportedRegion = reimported.tracks[0].regions[0]
            expect(reimportedRegion.blend.mode).toEqual(blendMode)

            // Reconstruct blend from constructor
        })
    })

    it('preserves blend opacity values', () => {
        const project = new Project()
        const track = project.tracks[0]

        const opacities = [0, 0.25, 0.5, 0.75, 1]

        opacities.forEach((opacity, index) => {
            track.addRegionAt(index * 2)
            const region = track.regions[index]
            region.blend = new Blend('source-over', opacity)
        })

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        reimported.tracks[0].regions.forEach((region, index) => {
            expect(region.blend.opacity).toBe(opacities[index])
        })
    })

    it('preserves different blend modes across multiple tracks', () => {
        const project = new Project()

        // Add regions to different tracks with different blend modes
        project.addTrack()
        project.addTrack()

        const blendConfigs = [
            { track: 0, mode: 'multiply', opacity: 0.8 },
            { track: 0, mode: 'screen', opacity: 0.6 },
            { track: 1, mode: 'difference', opacity: 1 },
            { track: 1, mode: 'overlay', opacity: 0.5 },
            { track: 2, mode: 'color-dodge', opacity: 0.9 }
        ]

        blendConfigs.forEach((config, index) => {
            const track = project.tracks[config.track]
            track.addRegionAt(index * 2)
            const region = track.regions[track.regions.length - 1]
            region.blend = new Blend(config.mode, config.opacity)
        })

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        let regionIndex = 0
        blendConfigs.forEach(config => {
            const track = reimported.tracks[config.track]
            const region = track.regions.find((r, idx) => {
                if (r.blend.mode === config.mode && r.blend.opacity === config.opacity) {
                    return true
                }
                return false
            })

            expect(region).toBeDefined()
            expect(region.blend.mode).toBe(config.mode)
            expect(region.blend.opacity).toBe(config.opacity)
        })
    })

    it('preserves blend mode constructor format [mode, opacity]', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0)
        const region = track.regions[0]
        region.blend = new Blend('exclusion', 0.7)

        const exported = project.export()

        // Check the raw exported data has the correct format
        expect(exported.tracks[0].regions[0].blendConstructor).toEqual(['exclusion', 0.7])

        // Check it can be reimported
        const reimported = new Project(JSON.stringify(exported))
        expect(reimported.tracks[0].regions[0].blend.mode).toBe('exclusion')
        expect(reimported.tracks[0].regions[0].blend.opacity).toBe(0.7)
    })

    it('defaults to source-over with opacity 1 for new regions', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0)
        const region = track.regions[0]

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].blend.mode).toBe('source-over')
        expect(reimported.tracks[0].regions[0].blend.opacity).toBe(1)
    })
})
