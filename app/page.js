'use client'

import React, { useState } from 'react'
import { proxy, useSnapshot, subscribe } from 'valtio'
import Project from '@/lib/classes/Project'
import Timeline from '@/components/Timeline'
import Render from '@/components/Render'
import Help from '@/components/Help'
import Scenes from '@/components/Scenes'
import Ribbon from '@/components/Ribbon'

// Original full demo project (kept for reference)
// const saveData = '{"tracks":[{"name":"Track 1","regions":[{"name":"a","length":4,"position":0,"blendConstructor":["source-over",1],"sceneId":"blobs"},{"name":"b","length":2,"position":5,"blendConstructor":["source-over",1],"sceneId":"bubbles"},{"name":"c","length":2,"position":10,"blendConstructor":["source-over",1]}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0,"blendConstructor":["source-over",1],"sceneId":"fishtank"},{"name":"verse","length":16,"position":8,"blendConstructor":["source-over",1],"sceneId":"laser"},{"name":"chorus","length":8,"position":24,"blendConstructor":["source-over",1],"sceneId":"loom"},{"name":"bridge","length":4,"position":32,"blendConstructor":["source-over",1],"sceneId":"matrix"}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0,"blendConstructor":["source-over",1],"sceneId":"puddle"},{"name":"pattern2","length":8,"position":12,"blendConstructor":["source-over",1],"sceneId":"rainbow"},{"name":"breakdown","length":4,"position":20,"blendConstructor":["source-over",1]}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8,"blendConstructor":["source-over",1],"sceneId":"reef"},{"name":"chorus1","length":8,"position":24,"blendConstructor":["source-over",1],"sceneId":"rings"},{"name":"verse2","length":16,"position":40,"blendConstructor":["source-over",1],"sceneId":"spiro"},{"name":"outro","length":6,"position":56,"blendConstructor":["source-over",1],"sceneId":"vortex"}]}],"meta":{"bpm":120,"title":"Untitled Project","width":800,"height":600,"fps":24}}'

// Minimal overlapping example: one region using `testing`, one using `matrix` on a different track.
const saveData = JSON.stringify({
  tracks: [
    {
      name: "Track 1",
      regions: [
        {
          name: "Testing Region",
          length: 8,
          position: 0,
          blendConstructor: ["source-over", 1],
          sceneId: "testing",
        },
      ],
    },
    {
      name: "Track 2",
      regions: [
        {
          name: "Matrix Region",
          length: 8,
          position: 4, // overlaps with Track 1 region between beats 4–8
          blendConstructor: ["source-over", 1],
          sceneId: "matrix",
        },
      ],
    },
  ],
  meta: {
    bpm: 120,
    title: "Overlap Test",
    width: 800,
    height: 600,
    fps: 24,
  },
})

const project = proxy(new Project(saveData))

// Auto-save project data whenever it changes
subscribe(project, () => {
  // const saveData = JSON.stringify({
  //   tracks: project.tracks.map(track => track.export()),
  //   meta: project.meta
  // })

  // Save to localStorage
  // localStorage.setItem('project-save-data', saveData)

  // Optional: Also log the save data to console for debugging
  // console.log('Project auto-saved:', saveData)
})

export default function Home() {
  const [page, setPage] = useState("timeline")
  const snap = useSnapshot(project),
    pages = {
      "timeline": <Timeline project={project} snap={snap} />,
      "render": <Render project={project} snap={snap} />,
      "help": <Help />,
      "scenes": <Scenes />
    }

  // Set up keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if focus is on an input field
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
      )

      // Only handle shortcuts when not focused on input fields
      if (page == "timeline" && !isInputFocused) {
        switch (e.key) {
          case "Delete":
          case "Backspace":
            project.selected.forEach(region => region.del())
            break
          case "Escape":
            project.deselectAll()
            break
          case "ArrowLeft":
            project.playhead = Math.max(0, project.playhead - project.snap)
            e.preventDefault()
            break
          case "ArrowRight":
            project.playhead = project.playhead + project.snap
            e.preventDefault()
            break
          case "a":
            if (e.metaKey || e.ctrlKey) {
              project.selectAll()
              e.preventDefault()
            }
            break
          case "c":
            if (e.metaKey || e.ctrlKey) {
              project.copy()
              e.preventDefault()
            }
            break
          case "v":
            if (e.metaKey || e.ctrlKey) {
              project.paste()
              e.preventDefault()
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [page])

  return (
    <div>
      <Ribbon page={page} setPage={setPage} project={project} />
      {pages[page]}
    </div>
  )
}