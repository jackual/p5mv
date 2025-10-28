import Blend from './Blend.js'

export default class Region {
  constructor(object, project, index, track) {
    this.name = object.name || "　"
    this.length = object.length
    this.position = object.position
    this.selected = object.selected || false
    this.track = track
    this.index = index
    this.project = project
    this.blend = new Blend(...object.blendConstructor || ["source-over", 1])
  }

  select(event) {
    if (!event?.shiftKey && !this.selected)
      this.project.deselectAll()
    this.selected = !this.selected
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
  }

  export() {
    return {
      name: this.name,
      length: this.length,
      position: this.position,
      blendConstructor: [this.blend.mode, this.blend.opacity]
    }
  }
}