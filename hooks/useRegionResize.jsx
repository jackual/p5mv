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

    // Check if a region would overlap with other regions on the same track
    function checkCollision(trackIndex, regionToCheck, newPosition, newLength) {
        const track = project.tracks[trackIndex]
        if (!track) return true // Invalid track, consider as collision

        const regionStart = newPosition
        const regionEnd = newPosition + newLength

        // Check against all other regions on the same track
        for (let region of track.regions) {
            if (!region || region === regionToCheck) continue // Skip null and self

            const otherStart = region.position
            const otherEnd = region.position + region.length

            // Check if regions overlap
            if (regionStart < otherEnd && regionEnd > otherStart) {
                return true // Collision detected
            }
        }

        return false // No collision
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
                const newTrack = project.tracks[hoveredTrackIndex]

                // Check if all selected regions can fit on the new track
                let canMoveAll = true
                for (let selectedRegion of resizeState.selectedRegions) {
                    if (checkCollision(hoveredTrackIndex, selectedRegion, selectedRegion.position, selectedRegion.length)) {
                        canMoveAll = false
                        break
                    }
                }

                if (canMoveAll) {
                    // No collisions - safe to move all selected regions
                    resizeState.selectedRegions.forEach((selectedRegion) => {
                        const oldTrack = selectedRegion.track

                        // Remove from old track
                        const oldIndex = oldTrack.regions.indexOf(selectedRegion)
                        if (oldIndex !== -1) {
                            oldTrack.regions.splice(oldIndex, 1)
                        }

                        // Update region's track reference
                        selectedRegion.track = newTrack

                        // Add to new track
                        newTrack.regions.push(selectedRegion)
                    })

                    // Update resize state to new track (using the main region being dragged)
                    const mainRegion = resizeState.selectedRegions[0]
                    const newRegionIndex = newTrack.regions.indexOf(mainRegion)

                    setResizeState(prev => ({
                        ...prev,
                        trackIndex: hoveredTrackIndex,
                        regionIndex: newRegionIndex !== -1 ? newRegionIndex : newTrack.regions.length - 1
                    }))

                    // Reindex everything
                    project.reindexAll()
                    document.body.style.cursor = 'move'
                } else {
                    // At least one collision detected - show not-allowed cursor
                    document.body.style.cursor = 'not-allowed'
                }
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
                        // Check for collision
                        const trackIndex = selectedRegion.track.trackIndex
                        if (!checkCollision(trackIndex, selectedRegion, newPosition, newLength)) {
                            selectedRegion.position = newPosition
                            selectedRegion.length = newLength
                            document.body.style.cursor = 'ew-resize'
                        } else {
                            document.body.style.cursor = 'not-allowed !important'
                        }
                    }
                })
            } else {
                const newPosition = project.snapPosition(resizeState.startPosition + deltaBeats)
                const newLength = project.snapPosition(resizeState.startLength - deltaBeats)

                if (newLength >= project.snap && newPosition >= 0) {
                    // Check for collision
                    if (!checkCollision(resizeState.trackIndex, region, newPosition, newLength)) {
                        region.position = newPosition
                        region.length = newLength
                        document.body.style.cursor = 'ew-resize'
                    } else {
                        document.body.style.cursor = 'not-allowed !important'
                    }
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
                        // Check for collision (position stays same, only length changes)
                        const trackIndex = selectedRegion.track.trackIndex
                        if (!checkCollision(trackIndex, selectedRegion, selectedRegion.position, newLength)) {
                            selectedRegion.length = newLength
                            document.body.style.cursor = 'ew-resize'
                        } else {
                            document.body.style.cursor = 'not-allowed !important'
                        }
                    }
                })
            } else {
                const newLength = project.snapPosition(resizeState.startLength + deltaBeats)
                if (newLength >= project.snap) {
                    // Check for collision (position stays same, only length changes)
                    if (!checkCollision(resizeState.trackIndex, region, region.position, newLength)) {
                        region.length = newLength
                        document.body.style.cursor = 'ew-resize'
                    } else {
                        document.body.style.cursor = 'not-allowed !important'
                    }
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
                        // Check for collision (length stays same, only position changes)
                        const trackIndex = selectedRegion.track.trackIndex
                        if (!checkCollision(trackIndex, selectedRegion, newPosition, selectedRegion.length)) {
                            selectedRegion.position = newPosition
                            document.body.style.cursor = 'move'
                        } else {
                            document.body.style.cursor = 'not-allowed !important'
                        }
                    }
                })
            } else {
                const newPosition = project.snapPosition(resizeState.startPosition + deltaBeats)
                if (newPosition >= 0) {
                    // Check for collision (length stays same, only position changes)
                    if (!checkCollision(resizeState.trackIndex, region, newPosition, region.length)) {
                        region.position = newPosition
                        document.body.style.cursor = 'move'
                    } else {
                        document.body.style.cursor = 'not-allowed !important'
                    }
                }
            }
        }
    }

    function handleMouseUp() {
        // Trigger reindexing when drag/resize operation completes
        if (resizeState) {
            project.reindexAll()
        }

        // Reset cursor to default
        document.body.style.cursor = 'default'

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