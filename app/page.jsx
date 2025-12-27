'use client'
import "./styles/main.scss"

import React, { useState } from 'react'
import { createRoot } from "react-dom/client"
import { proxy, useSnapshot, subscribe } from 'valtio'
import Project from '@/lib/classes/Project'
import Timeline from '@/components/Timeline'
import Render from '@/components/Render'
import Help from '@/components/Help'
import Scenes from '@/components/Scenes'
import Ribbon from '@/components/Ribbon'
import { newFile, openFile, saveFile } from '@/lib/projectFileMethods'

const project = proxy(new Project())

// Bind project to file methods
const projectFileMethods = {
  newFile: () => newFile(project),
  openFile: () => openFile(project),
  saveFile: () => saveFile(project)
}

// Auto-save project data whenever it changes
// subscribe(project, () => {
//   // const saveData = JSON.stringify({
//   //   tracks: project.tracks.map(track => track.export()),
//   //   meta: project.meta
//   // })

//   // Save to localStorage
//   // localStorage.setItem('project-save-data', saveData)

//   // Optional: Also log the save data to console for debugging
//   // console.log('Project auto-saved:', saveData)
// })

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
    <div className="app-shell">
      <Ribbon page={page} setPage={setPage} project={project} projectFileMethods={projectFileMethods} />
      <div className="page-content">
        {pages[page]}
      </div>
    </div>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Home />);