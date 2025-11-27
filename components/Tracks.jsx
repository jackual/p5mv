import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr";
import TrackRegions from "./TrackRegions"
import { MinusCircleIcon } from "@phosphor-icons/react";

export default function Tracks({ tracks, project, resizeState, handleResizeStart, snap, nearestBeat }) {
    const setPlayheadPosition = (event) => {
        project.newRegion = [];
        project.playhead = nearestBeat + snap.view.start;
        if (event.target.classList.contains('new-region-indicator') && nearestBeat !== null) {
            const trackIndex = Number(event.target.parentElement.getAttribute('data-track-index'))
            console.log("Adding region at", nearestBeat + snap.view.start, "to track index", trackIndex);
            project.tracks[trackIndex].addRegionAt(nearestBeat + snap.view.start);
            return
        }
        if (event.target.classList.contains('track') && project.selectionMode == 'none' && nearestBeat !== null) {
            const trackIndex = Number(event.target.getAttribute('data-track-index'))
            project.newRegion = [trackIndex, nearestBeat + snap.view.start]
        }
    }
    return tracks.map((track, index) => (
        <div className="trackContainer" key={index} onClick={setPlayheadPosition}>
            <div className="trackHeader" onClick={event => {
                console.log('Clicked element:', event.target, 'Class:', event.target.className)
                // Check if clicked element or its parent has the button class
                const clickedElement = event.target.closest('.add-button, .remove-button') || event.target

                if (clickedElement.classList.contains('add-button') || clickedElement.closest('.add-button')) {
                    console.log('Adding track')
                    project.addTrack()
                } else if (clickedElement.classList.contains('remove-button') || clickedElement.closest('.remove-button')) {
                    console.log('Removing track')
                    if (track.regions.length === 0 || confirm(`Are you sure you want to delete track "${track.name}"? This action cannot be undone.`)) {
                        project.removeTrack(index)
                    }
                } else if (event.target.classList.contains('trackHeader')) {
                    project.tracks[index].select()
                }
            }}>
                <p>{track.name} </p>
                <a className="add-button"><PlusCircleIcon /></a>
                <a className="remove-button"><MinusCircleIcon /></a>
            </div>
            <div className="track" data-track-index={index} onClick={event => {
                if (event.target.classList.contains('track')) {
                    project.deselectAll()
                }
            }} style={{ position: 'relative' }}>
                {project.newRegion.length && project.newRegion[0] === index ?
                    <div className="new-region-indicator" style={{
                        left: (project.newRegion[1] * snap.view.beatWidth) - 12,
                        position: 'absolute'
                    }}>+</div> : ""}
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