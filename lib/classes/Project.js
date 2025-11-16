import Track from "./Track"
import { toVulgar } from 'vulgar-fractions'

export default class Project {
  constructor(string) {
    let data = JSON.parse(string)
    this.tracks = data.tracks.map((track, index) => new Track(track, this, index))
    this.view = {
      beatWidth: 10,
      start: 0,
      get end() {
        if (typeof document !== 'undefined')
          return this.start + Math.floor((document.querySelector('.track')?.offsetWidth || 800) / this.beatWidth)
        else return null
      }
    }
    this.playhead = 60
    this.snap = 1
    this.meta = {
      bpm: data.meta?.bpm || 120,
      title: data.meta?.title || "Untitled Project",
      width: data.meta?.width || 800,
      height: data.meta?.height || 600,
      fps: data.meta?.fps || 24
    }
    this.render = {
      queue: [],
      status: 'idle', // 'idle', 'rendering', 'completed', 'error',
      renderRegions: [0, 0],
      currentRegion: [0, 0],
      composite: [0, 0],
      encode: [0, 0],
      skipComposite: true
    }
    this.newRegion = [] // [trackIndex, position] for the new region indicator

    // Ensure all tracks and regions are properly indexed
    this.reindexAll()
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

  zoomIn() {
    this.view.beatWidth = this.view.beatWidth * 1.5
  }
  zoomOut() {
    this.view.beatWidth = this.view.beatWidth / 1.5
  }

  moveLeft() {
    this.view.start = Math.max(0, this.view.start - 4)
  }
  moveRight() {
    this.view.start = this.view.start + 4
  }
  moveToStart() {
    this.view.start = 0
  }

  // Snap a position to the current snap value
  snapPosition(position) {
    return Math.round(position / this.snap) * this.snap
  }

  // Add a new track
  addTrack() {
    const newTrackIndex = this.tracks.length
    const newTrackData = {
      name: `Track ${newTrackIndex + 1}`,
      regions: []
    }
    const newTrack = new Track(newTrackData, this, newTrackIndex)
    this.tracks.push(newTrack)
    this.reindexAll()
  }

  // Reindex all tracks and regions to maintain consistency
  reindexAll() {
    this.tracks.forEach((track, trackIndex) => {
      track.trackIndex = trackIndex

      // Get only existing (non-null) regions for sorting, but don't modify the array
      const existingRegions = track.regions.filter(region => region != null)
      const sortedRegions = [...existingRegions].sort((a, b) => a.position - b.position)

      // Update each existing region's index to reflect its chronological position
      track.regions.forEach(region => {
        if (region != null) {
          region.index = sortedRegions.findIndex(sortedRegion => sortedRegion === region)
        }
      })
    })
  }

  // Remove a track by index
  removeTrack(index) {
    if (index >= 0 && index < this.tracks.length) {
      this.tracks.splice(index, 1)
      this.reindexAll()
    }
  }
}