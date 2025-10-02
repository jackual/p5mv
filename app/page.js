'use client'

const saveData = '{"tracks":[{"name":"top","regions":[{"name":"a","length":4,"position":0},{"name":"b","length":2,"position":5},{"name":"c","length":2,"position":10}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0},{"name":"verse","length":16,"position":8},{"name":"chorus","length":8,"position":24},{"name":"bridge","length":4,"position":32}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0},{"name":"pattern2","length":8,"position":12},{"name":"breakdown","length":4,"position":20}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8},{"name":"chorus1","length":8,"position":24},{"name":"verse2","length":16,"position":40},{"name":"outro","length":6,"position":56}]}]}'

class Track {
  constructor(track) {
    this.name = track.name
    this.regions = track.regions.map(region => new Region(region))
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
    this.tracks = data.tracks.map(track => new Track(track))
    this.view = {
      beatWidth: 10
    }
  }
}

class Region {
  constructor(object) {
    this.name = object.name
    this.length = object.length
    this.position = object.position
    this.selected = object.selected || false
    this.id = Math.random().toString(36).substring(2, 9) //could this be a symbol
  }
  select() {
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

const project = new Project(saveData)

function renderTrackRegions(trackRegions) {
  return trackRegions.map((region, index) => (
    <div className={"region" + (region.selected ? " selected" : "")} onClick={() => {
      region.select()
    }} style={{
      position: 'absolute',
      width: project.view.beatWidth * region.length,
      left: project.view.beatWidth * region.position,
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
        {renderTrackRegions(track.regions)}
      </div>
    </div>
  ))
}

export default function Home() {
  return (
    <div>
      {renderTracks(project.tracks)}
    </div>
  )
}
