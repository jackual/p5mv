import { useState, useEffect } from 'react'

export default function useRegionResize(project) {
    const [resizeState, setResizeState] = useState(null)

    function handleResizeStart(event, trackIndex, regionIndex, edge) {
        event.stopPropagation() // Prevent region selection
        event.preventDefault()

        const region = project.tracks[trackIndex].regions[regionIndex]

        setResizeState({
            trackIndex,
            regionIndex,
            edge, // 'left' or 'right'
            startX: event.clientX,
            startPosition: region.position,
            startLength: region.length
        })
    }

    function handleMouseMove(event) {
        if (!resizeState) return

        console.log('handleMouseMove called:', resizeState.edge)
        const deltaX = event.clientX - resizeState.startX
        const deltaBeats = Math.round(deltaX / project.view.beatWidth)
        console.log('Delta:', { deltaX, deltaBeats })

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
            console.log('Drag: newPosition =', newPosition)
            if (newPosition >= 0) {
                console.log('Setting position to:', newPosition)
                region.setPosition(newPosition)
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