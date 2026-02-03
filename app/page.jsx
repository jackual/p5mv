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
import MetadataWizard from '@/components/MetadataWizard'
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
  const [dialog, setDialog] = useState(null)
  const [showMetadataWizard, setShowMetadataWizard] = useState(false)

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

  // Global dialog functions
  React.useEffect(() => {
    window.showDialog = (config) => {
      return new Promise((resolve) => {
        setDialog({
          ...config,
          onConfirm: () => {
            setDialog(null)
            resolve(true)
          },
          onCancel: config.onCancel ? () => {
            setDialog(null)
            resolve(false)
          } : undefined,
          onClose: () => {
            setDialog(null)
            resolve(false)
          }
        })
      })
    }

    window.showAlert = (message, title = 'Alert') => {
      return window.showDialog({ type: 'info', title, message, confirmLabel: 'OK' })
    }

    window.showConfirm = (message, title = 'Confirm') => {
      return window.showDialog({ type: 'warning', title, message, confirmLabel: 'OK', onCancel: () => { } })
    }

    // Listen for quit dialog from main process
    const ipcRenderer = window.require?.('electron')?.ipcRenderer
    if (ipcRenderer) {
      const handleQuitDialog = async (event, { projectTitle }) => {
        const confirmed = await window.showConfirm(
          `You have unsaved changes in ${projectTitle}`,
          'Do you really want to quit?'
        )
        if (confirmed) {
          await ipcRenderer.invoke('project-force-quit')
        }
      }
      ipcRenderer.on('show-quit-dialog', handleQuitDialog)

      return () => {
        ipcRenderer.removeListener('show-quit-dialog', handleQuitDialog)
        delete window.showDialog
        delete window.showAlert
        delete window.showConfirm
      }
    }

    return () => {
      delete window.showDialog
      delete window.showAlert
      delete window.showConfirm
    }
  }, [])

  const handlePageChange = async (newPage) => {
    // If leaving editor page, check if navigation should be blocked
    if (page === "editor" && newPage !== "editor" && editorNavigationCheck) {
      const canNavigate = await editorNavigationCheck();
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
      <Ribbon
        page={page}
        setPage={handlePageChange}
        project={project}
        projectFileMethods={projectFileMethods}
        onShowMetadataWizard={() => setShowMetadataWizard(true)}
      />
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
      {dialog && (
        <Dialog {...dialog} />
      )}
      {showMetadataWizard && (
        <MetadataWizard onClose={() => setShowMetadataWizard(false)} />
      )}
    </div>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Home />);