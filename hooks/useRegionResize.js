import { useState, useEffect } from 'react'

export default function useRegionResize(project) {
    const [resizeState, setResizeState] = useState(null)

    function handleResizeStart(event, trackIndex, regionIndex, edge) {
        event.stopPropagation()
        event.preventDefault()

        const region = project.tracks[trackIndex].regions[regionIndex]

        // Get all selected regions and their starting positions
        const selectedRegions = project.selected
        const startingPositions = selectedRegions.map(r => r.position)

        setResizeState({
            trackIndex,
            regionIndex,
            edge,
            startX: event.clientX,
            startPosition: region.position,
            startLength: region.length,
            selectedRegions, // Store selected regions
            startingPositions // Store their starting positions
        })
    }

    function handleMouseMove(event) {
        if (!resizeState) return
        console.log('handleMouseMove called:', resizeState.edge)
        const deltaX = event.clientX - resizeState.startX
        const deltaBeats = Math.round(deltaX / project.view.beatWidth)

        const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)
        const trackElement = elementUnderMouse?.closest('.track')

        if (trackElement) {
            // Get track index from data attribute or find it in the DOM
            const trackContainer = trackElement.closest('.trackContainer')
            const allTracks = document.querySelectorAll('.trackContainer')
            const hoveredTrackIndex = Array.from(allTracks).indexOf(trackContainer)

            if (hoveredTrackIndex !== -1 && hoveredTrackIndex !== resizeState.trackIndex) {
                // Move region to the new track logic
            }
        }

        const region = project.tracks[resizeState.trackIndex].regions[resizeState.regionIndex]

        if (resizeState.edge === 'left') {
            // Resize from left edge - adjust position and length
            const newPosition = resizeState.startPosition + deltaBeats
            const newLength = resizeState.startLength - deltaBeats

            if (newLength >= 1 && newPosition >= 0) {
                region.setPosition(newPosition)
                region.setLength(newLength)
            }
        } else if (resizeState.edge === 'right') {
            // Resize from right edge - only adjust length
            const newLength = resizeState.startLength + deltaBeats
            if (newLength >= 1) {
                region.setLength(newLength)
            }

        } else if (resizeState.edge === 'drag') {
            // Drag to move - only adjust position, keep length the same
            const newPosition = resizeState.startPosition + deltaBeats
            if (project.selected.length > 1) {
                // Move all selected regions
                resizeState.selectedRegions.forEach((selectedRegion, index) => {
                    const originalPosition = resizeState.startingPositions[index]
                    const newPosition = originalPosition + deltaBeats

                    if (newPosition >= 0) {
                        selectedRegion.setPosition(newPosition)
                    }
                })
            } else {
                if (newPosition >= 0) {
                    region.setPosition(newPosition)
                }
            }
        }
    }

    function handleMouseUp() {
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