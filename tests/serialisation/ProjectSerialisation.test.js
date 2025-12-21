import { describe, it, expect } from 'vitest'
import Project from '../../lib/classes/Project.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Project serialization roundtrip', () => {
    it('roundtrips demo.p5mvProject without data loss', () => {
        const projectPath = path.join(__dirname, '..', 'test-projects', 'demo.p5mvProject')
        const originalData = fs.readFileSync(projectPath, 'utf-8')

        // Load the project
        const project = new Project(originalData)

        // Export it back
        const exported = project.export()
        const exportedString = JSON.stringify(exported)

        // Parse both to compare objects (ignoring whitespace differences)
        const original = JSON.parse(originalData)
        const roundtripped = JSON.parse(exportedString)

        // Check metadata
        expect(roundtripped.meta).toEqual(original.meta)

        // Check we have the same number of tracks
        expect(roundtripped.tracks).toHaveLength(original.tracks.length)

        // Check each track
        original.tracks.forEach((originalTrack, trackIndex) => {
            const exportedTrack = roundtripped.tracks[trackIndex]

            expect(exportedTrack.name).toBe(originalTrack.name)
            expect(exportedTrack.regions).toHaveLength(originalTrack.regions.length)

            // Check each region
            originalTrack.regions.forEach((originalRegion, regionIndex) => {
                const exportedRegion = exportedTrack.regions[regionIndex]

                expect(exportedRegion.length).toBe(originalRegion.length)
                expect(exportedRegion.position).toBe(originalRegion.position)
                expect(exportedRegion.sceneId).toBe(originalRegion.sceneId)
                expect(exportedRegion.blendConstructor).toEqual(originalRegion.blendConstructor)
            })
        })
    })

    it('roundtrips overlap-test.p5mvProject preserving keyframes', () => {
        const projectPath = path.join(__dirname, '..', 'test-projects', 'overlap-test.p5mvProject')
        const originalData = fs.readFileSync(projectPath, 'utf-8')

        // Load the project
        const project = new Project(originalData)

        // Export it back
        const exported = project.export()
        const exportedString = JSON.stringify(exported)

        // Parse both
        const original = JSON.parse(originalData)
        const roundtripped = JSON.parse(exportedString)

        // This project has regions with inputData containing keyframes
        // Check that keyframes are preserved
        const originalRegion = original.tracks[0].regions[3] // matrix region with keyframes
        const exportedRegion = roundtripped.tracks[0].regions[3]

        expect(exportedRegion.inputData).toBeDefined()
        expect(exportedRegion.inputData.strokeWeight).toBeDefined()
        expect(exportedRegion.inputData.strokeWeight.mode).toBe('dynamic')
        expect(exportedRegion.inputData.strokeWeight.value).toHaveLength(2)

        // Check keyframe values are preserved
        expect(exportedRegion.inputData.strokeWeight.value[0]).toEqual(
            originalRegion.inputData.strokeWeight.value[0]
        )
        expect(exportedRegion.inputData.strokeWeight.value[1]).toEqual(
            originalRegion.inputData.strokeWeight.value[1]
        )

        // Check colour input is preserved
        expect(exportedRegion.inputData.backgroundColour).toEqual(
            originalRegion.inputData.backgroundColour
        )
    })

    it('creates empty project and exports valid structure', () => {
        const project = new Project()
        const exported = project.export()

        expect(exported.meta).toBeDefined()
        expect(exported.meta.title).toBe('Untitled Project')
        expect(exported.meta.bpm).toBe(120)
        expect(exported.meta.width).toBe(800)
        expect(exported.meta.height).toBe(600)
        expect(exported.meta.fps).toBe(24)

        expect(exported.tracks).toBeDefined()
        expect(Array.isArray(exported.tracks)).toBe(true)
        expect(exported.tracks.length).toBeGreaterThan(0)

        // Should be able to import it back
        const reimported = new Project(JSON.stringify(exported))
        expect(reimported.meta.title).toBe('Untitled Project')
    })

    it('preserves region properties through roundtrip', () => {
        const project = new Project()
        const track = project.tracks[0]

        // Add a region and set properties
        track.addRegionAt(0)
        const region = track.regions[0]
        region.sceneId = 'vortex'
        region.length = 8
        region.position = 4
        region.initialiseInputs()

        // Add a keyframe
        const input = region.inputs.find(p => p.id === 'step')
        input.setKeyframeValue(0, 20)
        input.setKeyframeValue(8, 80)

        // Export
        const exported = project.export()

        // Reimport
        const reimported = new Project(JSON.stringify(exported))
        const reimportedRegion = reimported.tracks[0].regions[0]

        expect(reimportedRegion.sceneId).toBe('vortex')
        expect(reimportedRegion.length).toBe(8)
        expect(reimportedRegion.position).toBe(4)

        // Check keyframes survived
        const reimportedInput = reimportedRegion.inputs.find(p => p.id === 'step')
        expect(reimportedInput.settings.mode).toBe('dynamic')
        expect(reimportedInput.settings.value).toHaveLength(2)
        expect(reimportedInput.settings.value[0].value).toBe(20)
        expect(reimportedInput.settings.value[1].value).toBe(80)
    })

    it('handles empty tracks correctly', () => {
        const project = new Project()

        // Remove all regions from first track
        project.tracks[0].regions = []

        const exported = project.export()
        const reimported = new Project(JSON.stringify(exported))

        expect(reimported.tracks[0].regions).toHaveLength(0)
    })

    it('preserves blend modes through roundtrip', () => {
        const projectPath = path.join(__dirname, '..', 'test-projects', 'overlap-test.p5mvProject')
        const originalData = fs.readFileSync(projectPath, 'utf-8')

        const project = new Project(originalData)
        const exported = project.export()

        const original = JSON.parse(originalData)
        const roundtripped = JSON.parse(JSON.stringify(exported))

        // Check blend modes are preserved
        const originalBlend = original.tracks[0].regions[3].blendConstructor
        const exportedBlend = roundtripped.tracks[0].regions[3].blendConstructor

        expect(exportedBlend).toEqual(originalBlend)
        expect(exportedBlend[0]).toBe('difference')
        expect(exportedBlend[1]).toBe(1)
    })
})
