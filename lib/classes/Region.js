import Property from './Property.js'
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
    this.inputData = object.inputData || {}
    this.inputs = []
    if (this.sceneId) {
      this.initialiseInputs()
    }
  }

  initialiseInputs() {
    const scene = sketches.find(scene => scene.id === this.sceneId)
    scene.inputs && scene.inputs.map(input => {
      const property = new Property(input, this.inputData[input.id] || null)
      this.inputs.push(property)
    })
  }

  select(event) {
    if (!event?.shiftKey && !this.selected)
      this.project.deselectAll()
    if (!this.selected) {
      this.selected = true
    }
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