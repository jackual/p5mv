'use client'

import React, { useState } from 'react'
import { proxy, useSnapshot, subscribe } from 'valtio'
import Project from '@/lib/classes/Project'
import Timeline from '@/components/Timeline'
import Render from '@/components/Render'
import Help from '@/components/Help'
import Scenes from '@/components/Scenes'
import Ribbon from '@/components/Ribbon'

const saveData = '{"tracks":[{"name":"Track 1","regions":[{"name":"a","length":4,"position":0,"blendConstructor":["source-over",1]},{"name":"b","length":2,"position":5,"blendConstructor":["source-over",1]},{"name":"c","length":2,"position":10,"blendConstructor":["source-over",1]}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0,"blendConstructor":["source-over",1]},{"name":"verse","length":16,"position":8,"blendConstructor":["source-over",1]},{"name":"chorus","length":8,"position":24,"blendConstructor":["source-over",1]},{"name":"bridge","length":4,"position":32,"blendConstructor":["source-over",1]}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0,"blendConstructor":["source-over",1]},{"name":"pattern2","length":8,"position":12,"blendConstructor":["source-over",1]},{"name":"breakdown","length":4,"position":20,"blendConstructor":["source-over",1]}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8,"blendConstructor":["source-over",1]},{"name":"chorus1","length":8,"position":24,"blendConstructor":["source-over",1]},{"name":"verse2","length":16,"position":40,"blendConstructor":["source-over",1]},{"name":"outro","length":6,"position":56,"blendConstructor":["source-over",1]}]}],"meta":{"bpm":120,"title":"Untitled Project","width":800,"height":600,"fps":24}}'

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
      "render": <Render snap={snap} />,
      "help": <Help />,
      "scenes": <Scenes />
    }

  // Set up keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (page == "timeline")
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