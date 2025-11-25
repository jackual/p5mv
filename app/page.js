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
  "tracks": [
    {
      "name": "Track 1",
      "regions": [
        {
          "length": 8,
          "position": 0,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 8,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 16,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 24,
          "sceneId": "matrix",
          "blendConstructor": [
            "difference",
            1
          ],
          "inputData": {
            "strokeWeight": {
              "mode": "dynamic",
              "value": [
                {
                  "position": 0,
                  "value": 0,
                  "ease": "sineInOut"
                },
                {
                  "position": 8,
                  "value": 9,
                  "ease": "sineIn"
                }
              ]
            },
            "backgroundColour": {
              "mode": "static",
              "value": [
                137.8082191780822,
                1,
                0.5705882352941176
              ]
            }
          }
        },
        {
          "length": 8,
          "position": 32,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 40,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 48,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 8,
          "position": 56,
          "sceneId": "matrix",
          "blendConstructor": [
            "exclusion",
            1
          ],
          "inputData": {
            "strokeWeight": {
              "mode": "dynamic",
              "value": [
                {
                  "position": 0,
                  "value": 0,
                  "ease": "sineInOut"
                },
                {
                  "position": 8,
                  "value": 9,
                  "ease": "sineIn"
                }
              ]
            },
            "backgroundColour": {
              "mode": "static",
              "value": [
                220,
                1,
                0.5705882352941176
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Track 2",
      "regions": [
        {
          "length": 4,
          "position": 24,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 28,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 29,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 30,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 0.5,
          "position": 31,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 0.5,
          "position": 31.5,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 4,
          "position": 56,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 60,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 61,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 1,
          "position": 62,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 0.5,
          "position": 63,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        },
        {
          "length": 0.5,
          "position": 63.5,
          "sceneId": "reef",
          "blendConstructor": [
            "source-over",
            1
          ],
          "inputData": {}
        }
      ]
    }
  ],
  "meta": {
    "bpm": 160,
    "title": "Overlap Test",
    "width": 800,
    "height": 600,
    "fps": 24
  }
})

const project = proxy(new Project(saveData))

const projectFileMethods = {
  newFile: () => {
    const newProject = new Project('{}')

    // Clear all existing properties
    Object.keys(project).forEach(key => {
      delete project[key]
    })

    // Add all new project properties
    Object.assign(project, newProject)
  }, saveFile: () => {
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
    downloadObjectAsJson(project.export(), project.meta.title + ".pvm5Project")
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
      <Ribbon page={page} setPage={setPage} project={project} projectFileMethods={projectFileMethods} />
      {pages[page]}
    </div>
  )
}