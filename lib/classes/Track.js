import Region from "./Region"
import Blend from './Blend.js'

export default class Track {
  constructor(track = {}, project, trackIndex = 0) {
    this.name = track.name || `Track ${trackIndex + 1}`
    this.project = project
    this.trackIndex = trackIndex
    this.regions = track.regions ? track.regions.map((region, index) => new Region(
      region,
      project,
      index,
      this
    )) : []
  }

  select() {
    const allSelected = this.regions.every(region => region.selected)
    this.project.deselectAll()
    if (!allSelected) {
      this.regions.map(i => {
        i.selected = true
      })
    }
  }

  // addTrack() {
  //   this.project.tracks.splice(this.trackIndex + 1, 0, new Track({
  //     name: "New Track",
  //     regions: []
  //   }, this.project, this.trackIndex + 1))
  //   // Update trackIndex for all tracks
  //   this.project.tracks.forEach((track, index) => {
  //     track.trackIndex = index
  //     track.regions.forEach(region => {
  //       region.trackIndex = index
  //     })
  //   })
  // }

  addRegionAt(position) {
    this.regions.push(new Region({
      length: 1,
      position: position,
      selected: false
    }, this.project, this.regions.length, this))
    this.project.reindexAll()
  }

  export() {
    return {
      name: this.name,
      regions: this.regions.map(region => region.export())
    }
  }
}