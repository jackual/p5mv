'use client'
import "./styles/main.scss"

import React, { useState } from 'react'
import { createRoot } from "react-dom/client"
import { proxy, useSnapshot, subscribe } from 'valtio'
import { SquaresFourIcon, CodeIcon } from '@phosphor-icons/react'
import Project from '@/lib/classes/Project'
import Timeline from '@/components/Timeline'
import Render from '@/components/Render'
import Help from '@/components/Help'
import Scenes from '@/components/Scenes'
import Editor from '@/components/Editor'
import Ribbon from '@/components/Ribbon'
import Dialog from '@/components/Dialog'
import Tooltip from '@/components/Tooltip'
import { newFile, openFile, saveFile } from '@/lib/projectFileMethods'

const project = proxy(new Project())

// Bind project to file methods
const projectFileMethods = {
  newFile: () => newFile(project),
  openFile: () => openFile(project),
  saveFile: () => saveFile(project)
}

// Track unsaved changes
subscribe(project, () => {
  if (typeof window !== 'undefined' && window.require) {
    try {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.invoke('project-mark-unsaved', { title: project.meta.title })
    } catch (error) {
      console.error('Failed to mark project as unsaved:', error)
    }
  }
})

export default function Home() {
  const [page, setPage] = useState("timeline")
  const [availableScenes, setAvailableScenes] = useState({
    defaultScenes: [],
    openScenes: [],
    userDirectoryScenes: []
  })
  const [editorNavigationCheck, setEditorNavigationCheck] = useState(null)
  const [showNoScenesGuide, setShowNoScenesGuide] = useState(false)
  const [tooltipTarget, setTooltipTarget] = useState(null)

  // Load scenes on mount and whenever page changes
  React.useEffect(() => {
    const loadScenes = async () => {
      const ipcRenderer = window.require?.('electron')?.ipcRenderer
      if (!ipcRenderer) {
        console.error('ipcRenderer not available')
        return
      }
      const scenes = await ipcRenderer.invoke('scan-scenes')
      setAvailableScenes(scenes)
      // Update project.openScenes for Region class to use
      project.openScenes = scenes.openScenes

      // Check if there are no scenes in the project and show guide on timeline page
      if (scenes.openScenes.length === 0 && page === "timeline") {
        // Check if user has dismissed the guide in this session
        const dismissed = sessionStorage.getItem('noScenesGuideDismissed')
        if (!dismissed) {
          setTooltipTarget('scenes')
        }
      } else {
        setTooltipTarget(null)
      }
    }
    loadScenes()
  }, [page])

  const handlePageChange = (newPage) => {
    // If leaving editor page, check if navigation should be blocked
    if (page === "editor" && newPage !== "editor" && editorNavigationCheck) {
      const canNavigate = editorNavigationCheck();
      if (!canNavigate) {
        return; // Cancel navigation
      }
    }
    setPage(newPage);
  };

  const snap = useSnapshot(project),
    pages = {
      "timeline": <Timeline project={project} snap={snap} openScenes={availableScenes.openScenes} />,
      "render": <Render project={project} snap={snap} />,
      "help": <Help />,
      "scenes": <Scenes isActive={page === "scenes"} availableScenes={availableScenes} setAvailableScenes={setAvailableScenes} />,
      "editor": <Editor isActive={page === "editor"} onNavigateAway={setEditorNavigationCheck} />
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
      <Ribbon page={page} setPage={handlePageChange} project={project} projectFileMethods={projectFileMethods} />
      <div className="page-content">
        {pages[page]}
      </div>
      {tooltipTarget && (
        <Tooltip
          target={tooltipTarget}
          message={
            <>
              Go to Scenes or Editor to add your first scene to the project.
            </>
          }
          onClose={() => {
            setTooltipTarget(null)
            sessionStorage.setItem('noScenesGuideDismissed', 'true')
          }}
        />
      )}
    </div>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Home />);