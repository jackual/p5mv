const trackRegions = [
  {
    name: 'bar',
    length: 4,
    position: 0,
  },
  {
    name: 'half1',
    length: 2,
    position: 5
  },
  {
    name: 'half2',
    length: 2,
    position: 10
  }
]

let beatWidth = 40

function renderTrackRegions() {
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

export default function Home() {
  return (
    <div className="trackContainer">
      <div className="trackHeader">
        <p>track1</p>
      </div>
      <div className="track" style={{ position: 'relative' }}>
        {renderTrackRegions()}
      </div>
    </div>
  )
}
