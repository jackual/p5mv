import Blend from './Blend.js'
import sketches from '@/data/sketches.js'

export default class Region {
  constructor(object, project, index, track) {
    this.length = object.length
    this.position = object.position
    this.selected = object.selected || false
    this.sceneId = object.sceneId || null
    this.track = track
    this.index = index
    this.project = project
    this.blend = new Blend(...object.blendConstructor || ["source-over", 1])

    if (object.inputs) {
      this.inputs = object.inputs
    } else {
      this.inputs = this.initializeInputsFromScene()
    }
  }

  initializeInputsFromScene() {
    const scene = sketches.find(scene => scene.id === this.sceneId)
    if (scene?.inputs) {
      return Object.fromEntries(
        Object.entries(scene.inputs)
          .map(([key, input]) => {
            return [key, {
              mode: 'unset'
            }]
          }))
    }
    return {}
  }

  select(event) {
    if (!event?.shiftKey && !this.selected)
      this.project.deselectAll()
    this.selected = !this.selected
  }

  get scene() {
    return sketches.find(scene => scene.id === this.sceneId) || null
  }

  get code() {
    return `${this.track.trackIndex}-${this.index}`
  }

  get playheadDelta() {
    return this.project.snapPosition(Math.max(0, this.project.playhead - this.position))
  }

  // Add methods for resizing
  setLength(newLength) {
    this.length = Math.max(this.project.snap, newLength) // Minimum length of project snap value
  }

  setPosition(newPosition) {
    this.position = Math.max(0, newPosition) // Prevent negative positions
  }

  del() {
    delete this.track.regions[this.index]
    this.project.reindexAll()
  }

  export() {
    return {
      length: this.length,
      position: this.position,
      sceneId: this.sceneId,
      blendConstructor: [this.blend.mode, this.blend.opacity],
      inputs: this.inputs
    }
  }
}