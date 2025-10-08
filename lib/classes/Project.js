import Track from "./Track"

export default class Project {
  constructor(string) {
    let data = JSON.parse(string)
    this.tracks = data.tracks.map((track, index) => new Track(track, this, index))
    this.view = {
      beatWidth: 10
    }
    this.meta = {
      bpm: data.meta?.bpm || 120,
      title: data.meta?.title || "Untitled Project",
      width: data.meta?.width || 800,
      height: data.meta?.height || 600,
      fps: data.meta?.fps || 24
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
          if (this.selected[0].track.regions.length === this.selected.length) {
            return 'whole-track'
          } else {
            return 'same-track'
          }
        } else {
          return 'mixed'
        }
    }
  }

  get length() {
    let length = 0
    this.tracks.forEach(track => {
      track.regions.forEach(region => {
        let regionEnd = region.position + region.length
        if (regionEnd > length) length = regionEnd
      })
    })
    return length
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