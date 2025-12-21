import { describe, it, expect } from 'vitest'
import Project from '../../lib/classes/Project.js'

describe('Property type serialization', () => {
    it('preserves number type through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'vortex'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'step')
        input.setKeyframeValue(0, 42.789)
        input.setKeyframeValue(4, 99.123)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'step')

        expect(reimportedInput.settings.value[0].value).toBe(42.789)
        expect(reimportedInput.settings.value[1].value).toBe(99.123)
    })

    it('preserves integer type through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'matrix'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'strokeWeight')
        input.setKeyframeValue(0, 5)
        input.setKeyframeValue(4, 20)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'strokeWeight')

        expect(reimportedInput.settings.value[0].value).toBe(5)
        expect(reimportedInput.settings.value[1].value).toBe(20)
        expect(Number.isInteger(reimportedInput.settings.value[0].value)).toBe(true)
    })

    it('preserves float type through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'matrix'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'strokeWeight')
        input.setKeyframeValue(0, 1.5)
        input.setKeyframeValue(4, 3.75)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'strokeWeight')

        expect(reimportedInput.settings.value[0].value).toBe(1.5)
        expect(reimportedInput.settings.value[1].value).toBe(3.75)
    })

    it('preserves percent type through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'vortex'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'step')
        input.setKeyframeValue(0, 0)
        input.setKeyframeValue(4, 100)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'step')

        expect(reimportedInput.settings.value[0].value).toBe(0)
        expect(reimportedInput.settings.value[1].value).toBe(100)
    })

    it('preserves colour type through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'matrix'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'backgroundColour')
        const colorValue = [180, 0.7, 0.5] // HSL values
        input.settings.mode = 'static'
        input.settings.value = colorValue

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))
        const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'backgroundColour')

        expect(reimportedInput.settings.mode).toBe('static')
        expect(reimportedInput.settings.value).toEqual(colorValue)
    })

    // it('preserves text type through roundtrip', () => {
    //     const project = new Project()
    //     const track = project.tracks[0]
    //     track.addRegionAt(0)
    //     const region = track.regions[0]

    //     region.sceneId = 'ribbon'
    //     region.initialiseInputs()

    //     const input = region.inputs.find(p => p.id === 'text')
    //     input.settings.mode = 'static'
    //     input.settings.value = 'Hello World!'

    //     const exported = project.export()
    //     const reimported = new Project(JSON.stringify(exported))
    //     const reimportedInput = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'text')

    //     expect(reimportedInput.settings.mode).toBe('static')
    //     expect(reimportedInput.settings.value).toBe('Hello World!')
    // })

    it('preserves static vs dynamic mode for all types', () => {
        const project = new Project()
        const track = project.tracks[0]

        // Add two regions: one with static, one with dynamic
        track.addRegionAt(0)
        track.addRegionAt(4)

        const staticRegion = track.regions[0]
        staticRegion.sceneId = 'vortex'
        staticRegion.initialiseInputs()
        const staticInput = staticRegion.inputs.find(p => p.id === 'step')
        staticInput.settings.mode = 'static'
        staticInput.settings.value = 50

        const dynamicRegion = track.regions[1]
        dynamicRegion.sceneId = 'vortex'
        dynamicRegion.initialiseInputs()
        const dynamicInput = dynamicRegion.inputs.find(p => p.id === 'step')
        dynamicInput.setKeyframeValue(0, 10)
        dynamicInput.setKeyframeValue(4, 90)

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        const reimportedStatic = reimported.tracks[0].regions[0].inputs.find(p => p.id === 'step')
        expect(reimportedStatic.settings.mode).toBe('static')
        expect(reimportedStatic.settings.value).toBe(50)

        const reimportedDynamic = reimported.tracks[0].regions[1].inputs.find(p => p.id === 'step')
        expect(reimportedDynamic.settings.mode).toBe('dynamic')
        expect(reimportedDynamic.settings.value).toHaveLength(2)
    })
})
