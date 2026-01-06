import Inspector from '@/components/Inspector'
import Tracks from '@/components/Tracks'
import TimeGrid from '@/components/TimeGrid'
import { useState, useEffect } from 'react'
import useRegionResize from '@/hooks/useRegionResize'

export default function Timeline({ project, snap, openScenes }) {
    const { resizeState, handleResizeStart } = useRegionResize(project)
    const [nearestBeat, setNearestBeat] = useState(null)

    const handleMouseMove = (e) => {
        // Find the timeline container to get the reference point
        const timelineContainer = e.currentTarget.querySelector('.timeline-container')
        const timeGrid = e.currentTarget.querySelector('.timeGrid')

        if (!timelineContainer || !timeGrid) return

        const timelineRect = timelineContainer.getBoundingClientRect()
        const timeGridRect = timeGrid.getBoundingClientRect()

        const relativeX = e.clientX - timeGridRect.left
        if (relativeX >= 0) {
            const beatPosition = relativeX / snap.view.beatWidth
            const snappedBeat = project.snapPosition(beatPosition)
            setNearestBeat(snappedBeat)
        } else {
            setNearestBeat(null)
        }
    }

    const handleMouseLeave = () => {
        setNearestBeat(null)
    }
    //playhead needs to be able to zoom

    return (
        <main>
            <div
                className='editor'
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    '--playhead-offset': `${(snap.playhead - snap.view.start) * snap.view.beatWidth}px`
                }}
            >
                <div className='playhead' />
                <div className="timeline-container">
                    <div className="timeline-header"></div>
                    <TimeGrid snap={snap} nearestBeat={nearestBeat} />
                </div>
                <Tracks
                    tracks={snap.tracks}
                    project={project}
                    resizeState={resizeState}
                    handleResizeStart={handleResizeStart}
                    snap={snap}
                    nearestBeat={nearestBeat}
                /></div>
            <Inspector project={project} snapshot={snap} openScenes={openScenes} />
        </main>
    )
}
