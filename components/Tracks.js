import TrackRegions from "./TrackRegions"

export default function Tracks({ tracks, project, resizeState, handleResizeStart, snap }) {
    const newRegion = (event) => {
        if (event.target.classList.contains('track') && project.selectionMode == 'none') {
            console.log('new region')
        }
    }
    return tracks.map((track, index) => (
        <div className="trackContainer" key={index} onClick={newRegion}>
            <div className="trackHeader" onClick={event => {
                switch (event.target.className) {
                    case "trackHeader":
                        project.tracks[index].select()
                        break
                    case "add-button":
                        project.tracks[index].addRegion()
                        break
                    case "remove-button":
                        if (confirm(`Are you sure you want to delete track "${track.name}"? This action cannot be undone.`))
                            delete project.tracks[index]
                        break
                }
            }}>
                <p>{track.name} </p>
                <a className="add-button">+</a>
                <a className="remove-button">-</a>
            </div>
            <div className="track" onClick={event => {
                if (event.target.classList.contains('track')) {
                    project.deselectAll()
                }
            }} style={{ position: 'relative' }}>
                <TrackRegions
                    trackRegions={track.regions}
                    trackIndex={index}
                    resizeState={resizeState}
                    handleResizeStart={handleResizeStart}
                    project={project}
                    snap={snap}
                />
            </div>
        </div>
    ))
}