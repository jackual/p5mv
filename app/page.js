'use client'

import { proxy, useSnapshot } from 'valtio'

const saveData = '{"tracks":[{"name":"top","regions":[{"name":"a","length":4,"position":0},{"name":"b","length":2,"position":5},{"name":"c","length":2,"position":10}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0},{"name":"verse","length":16,"position":8},{"name":"chorus","length":8,"position":24},{"name":"bridge","length":4,"position":32}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0},{"name":"pattern2","length":8,"position":12},{"name":"breakdown","length":4,"position":20}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8},{"name":"chorus1","length":8,"position":24},{"name":"verse2","length":16,"position":40},{"name":"outro","length":6,"position":56}]}]}'

class Track {
  constructor(track, project) {
    this.name = track.name
    this.project = project
    this.regions = track.regions.map(region => new Region(region, project))
  }
  export() {
    return {
      name: this.name,
      regions: this.regions.map(region => region.export())
    }
  }
}

class Project {
  constructor(string) {
    let data = JSON.parse(string)
    this.tracks = data.tracks.map(track => new Track(track, this))
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
  deselectAll() {
    this.selected.forEach(region => region.selected = false)
  }
}

class Region {
  constructor(object, project) {
    this.name = object.name
    this.length = object.length
    this.position = object.position
    this.selected = object.selected || false
    this.id = Math.random().toString(36).substring(2, 9)
    this.project = project
  }
  select(event) {
    if (!event?.shiftKey)
      this.project.deselectAll()
    this.selected = !this.selected
  }
  export() {
    return {
      name: this.name,
      length: this.length,
      position: this.position
    }
  }
}

const project = proxy(new Project(saveData))

export default function Home() {
  const snap = useSnapshot(project)

  function renderTrackRegions(trackRegions, trackIndex) {
    return trackRegions.map((region, index) => (
      <div className={"region" + (region.selected ? " selected" : "")} onClick={event => {
        // Access the original proxy object for mutations, not the snapshot
        project.tracks[trackIndex].regions[index].select(event)
      }} style={{
        position: 'absolute',
        width: snap.view.beatWidth * region.length,
        left: snap.view.beatWidth * region.position,
        top: 0
      }} key={index}>
        {region.name}
      </div>
    ));
  }

  function renderTracks(tracks) {
    return tracks.map((track, index) => (
      <div className="trackContainer" key={index}>
        <div className="trackHeader">
          <p>{track.name}</p>
        </div>
        <div className="track" style={{ position: 'relative' }}>
          {renderTrackRegions(track.regions, index)}
        </div>
      </div>
    ))
  }

  return (
    <div>
      {renderTracks(snap.tracks)}
    </div>
  )
}
