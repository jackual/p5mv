const tracks = [
  {
    name: 'track1',
    regions: [{
      name: 'a',
      length: 4,
      position: 0,
    },
    {
      name: 'b',
      length: 2,
      position: 5
    },
    {
      name: 'c',
      length: 2,
      position: 10
    }]
  },
  {
    name: 'drums',
    regions: [{
      name: 'intro',
      length: 8,
      position: 0,
    },
    {
      name: 'verse',
      length: 16,
      position: 8
    },
    {
      name: 'chorus',
      length: 8,
      position: 24
    },
    {
      name: 'bridge',
      length: 4,
      position: 32
    }]
  },
  {
    name: 'bass',
    regions: [{
      name: 'pattern1',
      length: 12,
      position: 0,
    },
    {
      name: 'pattern2',
      length: 8,
      position: 12
    },
    {
      name: 'breakdown',
      length: 4,
      position: 20
    }]
  },
  {
    name: 'vocals',
    regions: [{
      name: 'verse1',
      length: 16,
      position: 8,
    },
    {
      name: 'chorus1',
      length: 8,
      position: 24
    },
    {
      name: 'verse2',
      length: 16,
      position: 40
    },
    {
      name: 'outro',
      length: 6,
      position: 56
    }]
  }
]

let beatWidth = 10

function renderTrackRegions(trackRegions) {
  return trackRegions.map((region, index) => (
    <div className="region" style={{
      position: 'absolute',
      width: beatWidth * region.length,
      left: beatWidth * region.position,
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
      {renderTracks(tracks)}
    </div>
  )
}
