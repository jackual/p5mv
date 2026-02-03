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

const project = proxy(new Project())

const projectFileMethods = {
  newFile: () => {
    const newProject = new Project('{}')

    // Clear all existing properties
    Object.keys(project).forEach(key => {
      delete project[key]
    })

    // Add all new project properties
    Object.assign(project, newProject)
  },
  openFile: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.p5mvProject'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const loadedProject = new Project(event.target.result)
          
          // Clear all existing properties
          Object.keys(project).forEach(key => {
            delete project[key]
          })
          
          // Add all loaded project properties
          Object.assign(project, loadedProject)
        } catch (error) {
          alert('Error loading project: ' + error.message)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  },
  saveFile: () => {
    const saveData = JSON.stringify(project.export())
    function downloadObjectAsJson(exportObj, exportName) {
      // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
    downloadObjectAsJson(project.export(), project.meta.title + ".p5mvProject")
  }
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

  // Listen for file open events from Electron (double-click .p5mvProject)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.require) {
      const { ipcRenderer } = window.require('electron');
      
      const handleOpenFile = (event, fileData) => {
        try {
          const loadedProject = new Project(fileData);
          
          // Clear all existing properties
          Object.keys(project).forEach(key => {
            delete project[key];
          });
          
          // Add all loaded project properties
          Object.assign(project, loadedProject);
        } catch (error) {
          alert('Error loading project: ' + error.message);
        }
      };
      
      ipcRenderer.on('open-project-file', handleOpenFile);
      
      return () => {
        ipcRenderer.removeListener('open-project-file', handleOpenFile);
      };
    }
  }, []);

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