'use client'

import { proxy, useSnapshot, subscribe } from 'valtio'
import { useState, useEffect } from 'react'
import useRegionResize from '@/hooks/useRegionResize'
import Project from '@/lib/classes/Project'
import Inspector from '@/components/Inspector'
import Tracks from '@/components/Tracks'
import TimeGrid from '@/components/TimeGrid'

const saveData = '{"tracks":[{"name":"top","regions":[{"name":"a","length":4,"position":0,"blendConstructor":["source-over",1]},{"name":"b","length":2,"position":5,"blendConstructor":["source-over",1]},{"name":"c","length":2,"position":10,"blendConstructor":["source-over",1]}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0,"blendConstructor":["source-over",1]},{"name":"verse","length":16,"position":8,"blendConstructor":["source-over",1]},{"name":"chorus","length":8,"position":24,"blendConstructor":["source-over",1]},{"name":"bridge","length":4,"position":32,"blendConstructor":["source-over",1]}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0,"blendConstructor":["source-over",1]},{"name":"pattern2","length":8,"position":12,"blendConstructor":["source-over",1]},{"name":"breakdown","length":4,"position":20,"blendConstructor":["source-over",1]}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8,"blendConstructor":["source-over",1]},{"name":"chorus1","length":8,"position":24,"blendConstructor":["source-over",1]},{"name":"verse2","length":16,"position":40,"blendConstructor":["source-over",1]},{"name":"outro","length":6,"position":56,"blendConstructor":["source-over",1]}]}],"meta":{"bpm":120,"title":"Untitled Project","width":800,"height":600,"fps":24}}'

const project = proxy(new Project(saveData))

// Auto-save project data whenever it changes
subscribe(project, () => {
  const saveData = JSON.stringify({
    tracks: project.tracks.map(track => track.export()),
    meta: project.meta
  })

  // Save to localStorage
  // localStorage.setItem('project-save-data', saveData)

  // Optional: Also log the save data to console for debugging
  // console.log('Project auto-saved:', saveData)
})

export default function Home() {
  const { resizeState, handleResizeStart } = useRegionResize(project)
  const snap = useSnapshot(project)
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
      const nearestBeatIndex = Math.round(beatPosition)
      setNearestBeat(nearestBeatIndex)
    } else {
      setNearestBeat(null)
    }
  }

  const handleMouseLeave = () => {
    setNearestBeat(null)
  }
  //playhead needs to be able to zoom

  return (
    <div>
      <p>{snap.meta.title} | {snap.meta.bpm}bpm | {snap.meta.width}×{snap.meta.height}@{snap.meta.fps}fps</p>
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
      <Inspector project={project} snapshot={snap} />
    </div>
  )
}

onkeydown = (e) => {
  switch (e.key) {
    case "Delete":
    case "Backspace":
      project.selected.forEach(region => region.del())
      break
    case "Escape":
      project.deselectAll()
      break
    case "a":
      if (e.metaKey || e.ctrlKey) {
        project.selectAll()
        e.preventDefault()
      }
      break
  }
}