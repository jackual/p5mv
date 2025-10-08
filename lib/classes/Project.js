import Track from "./Track"

export default class Project {
  constructor(string) {
    let data = JSON.parse(string)
    this.tracks = data.tracks.map((track, index) => new Track(track, this, index))
    this.view = {
      beatWidth: 10
    }
  }
  get selected() {
    let selectedRegions = []
    this.tracks.forEach(track => {
      track.regions.forEach(region => {
        if (region.selected) {
          selectedRegions.push(region)
        }
      })
    })
    return selectedRegions
  }
  get selectionMode() {
    switch (this.selected.length) {
      case 0: return 'none'
      case 1: return 'region'
      default:
        if (this.selected.every(region => region.track.trackIndex === this.selected[0].track.trackIndex)) {
          return 'same-track'
        } else {
          return 'mixed'
        }
    }
  }

  deselectAll() {
    this.selected.forEach(region => region.selected = false)
  }
  selectAll() {
    this.tracks.forEach(track => {
      track.regions.forEach(region => region.selected = true)
    })
  }
}