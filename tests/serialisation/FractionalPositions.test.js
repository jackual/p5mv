import { describe, it, expect } from 'vitest'
import Project from '../../lib/classes/Project.js'

describe('Fractional position serialization', () => {
    it('preserves whole beat positions', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0)
        track.addRegionAt(4)
        track.addRegionAt(8)

        track.regions[0].length = 2
        track.regions[1].length = 3
        track.regions[2].length = 1

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].position).toBe(0)
        expect(reimported.tracks[0].regions[0].length).toBe(2)
        expect(reimported.tracks[0].regions[1].position).toBe(4)
        expect(reimported.tracks[0].regions[1].length).toBe(3)
        expect(reimported.tracks[0].regions[2].position).toBe(8)
        expect(reimported.tracks[0].regions[2].length).toBe(1)
    })

    it('preserves half beat positions (0.5)', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0)
        track.addRegionAt(1.5)
        track.addRegionAt(3.5)

        track.regions[0].length = 0.5
        track.regions[1].length = 1.5
        track.regions[2].length = 0.5

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].position).toBe(0)
        expect(reimported.tracks[0].regions[0].length).toBe(0.5)
        expect(reimported.tracks[0].regions[1].position).toBe(1.5)
        expect(reimported.tracks[0].regions[1].length).toBe(1.5)
        expect(reimported.tracks[0].regions[2].position).toBe(3.5)
        expect(reimported.tracks[0].regions[2].length).toBe(0.5)
    })

    it('preserves quarter beat positions (0.25)', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0.25)
        track.addRegionAt(0.75)
        track.addRegionAt(1.25)

        track.regions[0].length = 0.25
        track.regions[1].length = 0.25
        track.regions[2].length = 0.75

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].position).toBe(0.25)
        expect(reimported.tracks[0].regions[0].length).toBe(0.25)
        expect(reimported.tracks[0].regions[1].position).toBe(0.75)
        expect(reimported.tracks[0].regions[1].length).toBe(0.25)
        expect(reimported.tracks[0].regions[2].position).toBe(1.25)
        expect(reimported.tracks[0].regions[2].length).toBe(0.75)
    })

    it('preserves eighth beat positions (0.125)', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0.125)
        track.addRegionAt(0.375)

        track.regions[0].length = 0.125
        track.regions[1].length = 0.625

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].position).toBe(0.125)
        expect(reimported.tracks[0].regions[0].length).toBe(0.125)
        expect(reimported.tracks[0].regions[1].position).toBe(0.375)
        expect(reimported.tracks[0].regions[1].length).toBe(0.625)
    })

    it('preserves third beat positions (1/3)', () => {
        const project = new Project()
        const track = project.tracks[0]

        const oneThird = 1 / 3
        const twoThirds = 2 / 3

        track.addRegionAt(oneThird)
        track.addRegionAt(twoThirds)

        track.regions[0].length = oneThird
        track.regions[1].length = twoThirds

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions[0].position).toBeCloseTo(oneThird, 10)
        expect(reimported.tracks[0].regions[0].length).toBeCloseTo(oneThird, 10)
        expect(reimported.tracks[0].regions[1].position).toBeCloseTo(twoThirds, 10)
        expect(reimported.tracks[0].regions[1].length).toBeCloseTo(twoThirds, 10)
    })

    it('preserves keyframe positions at fractional deltas', () => {
        const project = new Project()
        const track = project.tracks[0]

        track.addRegionAt(0)
        const region = track.regions[0]
        region.length = 4
        region.sceneId = 'vortex'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'step')
        input.setKeyframeValue(0, 0)
        input.setKeyframeValue(0.5, 25)
        input.setKeyframeValue(1.5, 50)
        input.setKeyframeValue(2.25, 75)
        input.setKeyframeValue(4, 100)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'step')

        expect(reimportedInput.settings.value).toHaveLength(5)
        expect(reimportedInput.settings.value[0].position).toBe(0)
        expect(reimportedInput.settings.value[1].position).toBe(0.5)
        expect(reimportedInput.settings.value[2].position).toBe(1.5)
        expect(reimportedInput.settings.value[3].position).toBe(2.25)
        expect(reimportedInput.settings.value[4].position).toBe(4)
    })
})
