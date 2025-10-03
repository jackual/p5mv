import Region from "./Region"

export default class Track {
  constructor(track, project, trackIndex) {
    this.name = track.name
    this.project = project
    this.trackIndex = trackIndex
    this.regions = track.regions.map((region, index) => new Region(
      region,
      project,
      index,
      this
    ))
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

  export() {
    return {
      name: this.name,
      regions: this.regions.map(region => region.export())
    }
  }
}