import Inspector from '@/components/Inspector'
import Tracks from '@/components/Tracks'
import TimeGrid from '@/components/TimeGrid'
import Tooltip from '@/components/Tooltip'
import { useState, useEffect } from 'react'
import useRegionResize from '@/hooks/useRegionResize'

export default function Timeline({ project, snap, openScenes }) {
    const { resizeState, handleResizeStart } = useRegionResize(project)
    const [nearestBeat, setNearestBeat] = useState(null)
    const [showNoRegionsTooltip, setShowNoRegionsTooltip] = useState(false)

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

    useEffect(() => {
        // Check if there's a region with no scene assigned
        const allRegions = snap.tracks.flatMap((track, trackIndex) => 
            track.regions.map((region, regionIndex) => ({ 
                region, 
                trackIndex, 
                regionIndex,
                hasScene: region.sceneId && region.sceneId !== ''
            }))
        )
        
        // If there are no regions at all, show the "add first region" tooltip
        if (allRegions.length === 0 && snap.tracks.length > 0) {
            const dismissed = sessionStorage.getItem('noRegionsGuideDismissed')
            if (!dismissed) {
                setShowNoRegionsTooltip({
                    type: 'add-region',
                    targetId: 'track-0'
                })
                return
            }
        }
        
        const regionWithoutScene = allRegions.find(r => !r.hasScene)
        
        if (regionWithoutScene) {
            const dismissed = sessionStorage.getItem('noSceneAssignedGuideDismissed')
            if (!dismissed) {
                // Check if the region is selected
                const isSelected = snap.selected.length > 0 && snap.selected[0] === regionWithoutScene.region
                
                if (isSelected) {
                    // Region is selected, show tooltip to select scene from inspector
                    setShowNoRegionsTooltip({
                        type: 'select-scene',
                        targetId: 'scene',
                        regionId: `region-${regionWithoutScene.trackIndex}-${regionWithoutScene.regionIndex}`
                    })
                } else {
                    // Region exists but not selected, show tooltip to click it
                    setShowNoRegionsTooltip({
                        type: 'select-region',
                        targetId: `region-${regionWithoutScene.trackIndex}-${regionWithoutScene.regionIndex}`
                    })
                }
                return
            }
        }
        
        setShowNoRegionsTooltip(false)
    }, [snap.tracks, snap.selected])

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
                />
            </div>
            <Inspector project={project} snapshot={snap} openScenes={openScenes} />
            {showNoRegionsTooltip && (
                <Tooltip
                    target={showNoRegionsTooltip.targetId}
                    message={
                        showNoRegionsTooltip.type === 'add-region' 
                            ? <>Click anywhere on the track and click the <strong>+</strong> button to add a region</>
                            : showNoRegionsTooltip.type === 'select-region' 
                                ? 'Click on this region to select it'
                                : 'Select a scene from the dropdown to assign it to this region'
                    }
                    onClose={() => {
                        setShowNoRegionsTooltip(false)
                        const dismissKey = showNoRegionsTooltip.type === 'add-region' 
                            ? 'noRegionsGuideDismissed' 
                            : 'noSceneAssignedGuideDismissed'
                        sessionStorage.setItem(dismissKey, 'true')
                    }}
                />
            )}
        </main>
    )
}
