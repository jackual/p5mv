import { describe, it, expect } from 'vitest'
import Project from '../lib/classes/Project.js'

// This test mimics the UI workflow for adding keyframes
// to a vortex region's parameter and checks the stored
// keyframe delta (position) values.

describe('Keyframe UI workflow', () => {
    it('creates a vortex region, extends length, adds keyframes at correct deltas', () => {
        // 1. Create a new empty project (what you get on app load)
        const project = new Project()

        // 2. Add a region to the first track at position 0 (like clicking to add)
        const track = project.tracks[0]
        track.addRegionAt(0)

        const region = track.regions[0]

        // 3. Assign the "vortex" scene and initialise its inputs
        region.sceneId = 'vortex'
        region.initialiseInputs()

        // Vortex has a single "step" percent input
        const input = region.inputs.find(p => p.id === 'step')
        expect(input).toBeDefined()

        // 4. Extend region length, like dragging the right edge in the UI
        //    (length is in beats). Here we make it 4 beats long.
        region.length = 4

        // 5. Simulate playhead at start of region and add a keyframe there
        project.playhead = region.position // UI: move playhead to region start
        const deltaStart = region.playheadDelta // what SceneInput uses as delta
        input.setKeyframeValue(deltaStart, 20) // e.g. 20% intensity

        // 6. Simulate playhead at end of region and add another keyframe
        project.playhead = region.position + region.length // UI: move to region end
        const deltaEnd = region.playheadDelta
        input.setKeyframeValue(deltaEnd, 80) // e.g. 80% intensity

        // 7. Check stored keyframe delta positions match what we expect
        const positions = input.settings.value.map(k => k.position)

        // should be sorted and at [0, region.length]
        expect(deltaStart).toBe(0)
        expect(deltaEnd).toBe(4)
        expect(positions).toEqual([0, 4])
    })

    it('getForm reflects active keyframe vs tweened placeholder for vortex step', () => {
        const project = new Project()
        const track = project.tracks[0]
        track.addRegionAt(0)
        const region = track.regions[0]

        region.sceneId = 'vortex'
        region.initialiseInputs()

        const input = region.inputs.find(p => p.id === 'step')
        expect(input).toBeDefined()

        region.length = 4

        // Add two keyframes via the same delta logic SceneInput uses
        project.playhead = region.position
        const deltaStart = region.playheadDelta
        input.setKeyframeValue(deltaStart, 10)

        project.playhead = region.position + region.length
        const deltaEnd = region.playheadDelta
        input.setKeyframeValue(deltaEnd, 90)

        // What SceneInput would see at the start: should be an active keyframe
        const formAtStart = input.getForm(deltaStart)
        expect(formAtStart.activeKeyframe).toBe(true)
        expect(formAtStart.value).toBe('10') // formatted for the form
        expect(formAtStart.placeholder).toBe('')

        // In the middle of the region, there is no keyframe at this delta,
        // so the UI should show a plus (activeKeyframe === false) and a
        // tweened placeholder between the two values.
        const middleDelta = 2
        const formInMiddle = input.getForm(middleDelta)
        expect(formInMiddle.activeKeyframe).toBe(false)
        expect(formInMiddle.value).toBe('')
        const numericPlaceholder = parseFloat(formInMiddle.placeholder)
        expect(numericPlaceholder).toBeGreaterThan(10)
        expect(numericPlaceholder).toBeLessThan(90)

        // At the end delta there is another active keyframe
        const formAtEnd = input.getForm(deltaEnd)
        expect(formAtEnd.activeKeyframe).toBe(true)
        expect(formAtEnd.value).toBe('90')
        expect(formAtEnd.placeholder).toBe('')
    })
})

