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
import { createMenuHandlers } from '@/lib/menuHandlers'

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

// Track snap changes and update menu
let previousSnap = 0.25;
subscribe(project, () => {
  if (typeof window !== 'undefined' && window.require && project.snap !== previousSnap) {
    try {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.send('update-menu-snap', project.snap)
      previousSnap = project.snap;
    } catch (error) {
      console.error('Failed to update menu snap:', error)
    }
  }
});

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

    // Update menu to show current page
    if (typeof window !== 'undefined' && window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('update-menu-page', newPage);
      } catch (error) {
        console.error('Failed to update menu:', error);
      }
    }
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

      // Create menu handlers with current dependencies
      const handlers = createMenuHandlers(project, projectFileMethods, page, setPage);

      ipcRenderer.on('open-project-file', handlers.handleOpenFile);
      ipcRenderer.on('menu-new-project', handlers.handleMenuNewProject);
      ipcRenderer.on('menu-open-project', handlers.handleMenuOpenProject);
      ipcRenderer.on('menu-save-project', handlers.handleMenuSaveProject);
      ipcRenderer.on('menu-edit-cut', handlers.handleEditCut);
      ipcRenderer.on('menu-edit-copy', handlers.handleEditCopy);
      ipcRenderer.on('menu-edit-paste', handlers.handleEditPaste);
      ipcRenderer.on('menu-edit-delete', handlers.handleEditDelete);
      ipcRenderer.on('menu-edit-select-all', handlers.handleEditSelectAll);
      ipcRenderer.on('menu-timeline-deselect-all', handlers.handleTimelineDeselectAll);
      ipcRenderer.on('menu-timeline-move-to-start', handlers.handleTimelineMoveToStart);
      ipcRenderer.on('menu-timeline-move-left', handlers.handleTimelineMoveLeft);
      ipcRenderer.on('menu-timeline-move-right', handlers.handleTimelineMoveRight);
      ipcRenderer.on('menu-timeline-zoom-in', handlers.handleTimelineZoomIn);
      ipcRenderer.on('menu-timeline-zoom-out', handlers.handleTimelineZoomOut);
      ipcRenderer.on('menu-timeline-set-snap', handlers.handleTimelineSetSnap)
      ipcRenderer.on('menu-view-page', handlers.handleViewPage);

      return () => {
        ipcRenderer.removeListener('open-project-file', handlers.handleOpenFile);
        ipcRenderer.removeListener('menu-new-project', handlers.handleMenuNewProject);
        ipcRenderer.removeListener('menu-open-project', handlers.handleMenuOpenProject);
        ipcRenderer.removeListener('menu-save-project', handlers.handleMenuSaveProject);
        ipcRenderer.removeListener('menu-edit-cut', handlers.handleEditCut);
        ipcRenderer.removeListener('menu-edit-copy', handlers.handleEditCopy);
        ipcRenderer.removeListener('menu-edit-paste', handlers.handleEditPaste);
        ipcRenderer.removeListener('menu-edit-delete', handlers.handleEditDelete);
        ipcRenderer.removeListener('menu-edit-select-all', handlers.handleEditSelectAll);
        ipcRenderer.removeListener('menu-timeline-deselect-all', handlers.handleTimelineDeselectAll);
        ipcRenderer.removeListener('menu-timeline-move-to-start', handlers.handleTimelineMoveToStart);
        ipcRenderer.removeListener('menu-timeline-move-left', handlers.handleTimelineMoveLeft);
        ipcRenderer.removeListener('menu-timeline-move-right', handlers.handleTimelineMoveRight);
        ipcRenderer.removeListener('menu-timeline-zoom-in', handlers.handleTimelineZoomIn);
        ipcRenderer.removeListener('menu-timeline-zoom-out', handlers.handleTimelineZoomOut);
        ipcRenderer.removeListener('menu-timeline-set-snap', handlers.handleTimelineSetSnap)
        ipcRenderer.removeListener('menu-view-page', handlers.handleViewPage);
      };
    }
  }, [page]);

  // All keyboard shortcuts are now handled by the native menu system

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