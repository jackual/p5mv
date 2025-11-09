import { useState, useEffect } from 'react'

export default function useRegionResize(project) {
    const [resizeState, setResizeState] = useState(null)

    function handleResizeStart(event, trackIndex, regionIndex, edge) {
        event.stopPropagation()
        event.preventDefault()

        const region = project.tracks[trackIndex].regions[regionIndex]

        // Get all selected regions and their starting positions and lengths
        const selectedRegions = project.selected
        const startingPositions = selectedRegions.map(r => r.position)
        const startingLengths = selectedRegions.map(r => r.length)

        setResizeState({
            trackIndex,
            regionIndex,
            edge,
            startX: event.clientX,
            startPosition: region.position,
            startLength: region.length,
            selectedRegions, // Store selected regions
            startingPositions, // Store their starting positions
            startingLengths // Store their starting lengths
        })
    }

    function handleMouseMove(event) {
        if (!resizeState) return
        console.log('handleMouseMove called:', resizeState.edge)
        const deltaX = event.clientX - resizeState.startX
        const deltaBeats = deltaX / project.view.beatWidth // Don't snap the delta

        const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)
        const trackElement = elementUnderMouse?.closest('.track')

        if (trackElement && resizeState.edge === 'drag') {
            // Get track index from data attribute
            const hoveredTrackIndex = Number(trackElement.getAttribute('data-track-index'))

            if (hoveredTrackIndex !== -1 && hoveredTrackIndex !== resizeState.trackIndex) {
                // Move region to the new track
                const region = project.tracks[resizeState.trackIndex].regions[resizeState.regionIndex]
                const oldTrack = project.tracks[resizeState.trackIndex]
                const newTrack = project.tracks[hoveredTrackIndex]

                // Remove from old track
                oldTrack.regions.splice(resizeState.regionIndex, 1)

                // Update region's track reference
                region.track = newTrack

                // Add to new track
                newTrack.regions.push(region)

                // Update resize state to new track
                setResizeState(prev => ({
                    ...prev,
                    trackIndex: hoveredTrackIndex,
                    regionIndex: newTrack.regions.length - 1
                }))

                // Reindex everything
                project.reindexAll()
                return // Don't do position updates
            }
        }

        const region = project.tracks[resizeState.trackIndex].regions[resizeState.regionIndex]

        if (resizeState.edge === 'left') {
            // Resize from left edge - adjust position and length
            if (project.selected.length > 1) {
                // Resize all selected regions from left edge
                resizeState.selectedRegions.forEach((selectedRegion, index) => {
                    const originalPosition = resizeState.startingPositions[index]
                    const originalLength = resizeState.startingLengths[index]
                    const newPosition = project.snapPosition(originalPosition + deltaBeats)
                    const newLength = project.snapPosition(originalLength - deltaBeats)

                    if (newLength >= project.snap && newPosition >= 0) {
                        selectedRegion.setPosition(newPosition)
                        selectedRegion.setLength(newLength)
                    }
                })
            } else {
                const newPosition = project.snapPosition(resizeState.startPosition + deltaBeats)
                const newLength = project.snapPosition(resizeState.startLength - deltaBeats)

                if (newLength >= project.snap && newPosition >= 0) {
                    region.setPosition(newPosition)
                    region.setLength(newLength)
                }
            }
        } else if (resizeState.edge === 'right') {
            // Resize from right edge - only adjust length
            if (project.selected.length > 1) {
                // Resize all selected regions from right edge
                resizeState.selectedRegions.forEach((selectedRegion, index) => {
                    const originalLength = resizeState.startingLengths[index]
                    const newLength = project.snapPosition(originalLength + deltaBeats)

                    if (newLength >= project.snap) {
                        selectedRegion.setLength(newLength)
                    }
                })
            } else {
                const newLength = project.snapPosition(resizeState.startLength + deltaBeats)
                if (newLength >= project.snap) {
                    region.setLength(newLength)
                }
            }

        } else if (resizeState.edge === 'drag') {
            // Drag to move - only adjust position, keep length the same
            if (project.selected.length > 1) {
                // Move all selected regions
                resizeState.selectedRegions.forEach((selectedRegion, index) => {
                    const originalPosition = resizeState.startingPositions[index]
                    const newPosition = project.snapPosition(originalPosition + deltaBeats)

                    if (newPosition >= 0) {
                        selectedRegion.setPosition(newPosition)
                    }
                })
            } else {
                const newPosition = project.snapPosition(resizeState.startPosition + deltaBeats)
                if (newPosition >= 0) {
                    region.setPosition(newPosition)
                }
            }
        }
    }

    function handleMouseUp() {
        // Trigger reindexing when drag/resize operation completes
        if (resizeState) {
            project.reindexAll()
        }
        setResizeState(null)
    }

    useEffect(() => {
        if (resizeState) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [resizeState])

    return { resizeState, handleResizeStart }
}