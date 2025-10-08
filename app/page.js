'use client'

import { proxy, useSnapshot } from 'valtio'
import { useState, useEffect } from 'react'
import useRegionResize from '@/hooks/useRegionResize'
import Project from '@/lib/classes/Project'
import Inspector from '@/components/Inspector'

const saveData = '{"tracks":[{"name":"top","regions":[{"name":"a","length":4,"position":0},{"name":"b","length":2,"position":5},{"name":"c","length":2,"position":10}]},{"name":"layer1","regions":[{"name":"intro","length":8,"position":0},{"name":"verse","length":16,"position":8},{"name":"chorus","length":8,"position":24},{"name":"bridge","length":4,"position":32}]},{"name":"text","regions":[{"name":"pattern1","length":12,"position":0},{"name":"pattern2","length":8,"position":12},{"name":"breakdown","length":4,"position":20}]},{"name":"background","regions":[{"name":"verse1","length":16,"position":8},{"name":"chorus1","length":8,"position":24},{"name":"verse2","length":16,"position":40},{"name":"outro","length":6,"position":56}]}]}'

const project = proxy(new Project(saveData))

export default function Home() {
  const { resizeState, handleResizeStart } = useRegionResize(project)
  const snap = useSnapshot(project)

  function renderTrackRegions(trackRegions, trackIndex) {
    return trackRegions.map((region, index) => (
      <div
        className={"region" + (region.selected ? " selected" : "") + (resizeState ? " resizing" : "")}
        onMouseDown={event => {
          if (!event.target.classList.contains('resize-handle')) {
            handleResizeStart(event, trackIndex, index, 'drag')
          }
        }}
        onClick={event => {
          if (!resizeState) {
            project.tracks[trackIndex].regions[index].select(event)
          }
        }}
        style={{
          position: 'absolute',
          width: snap.view.beatWidth * region.length,
          left: snap.view.beatWidth * region.position,
          top: 0
        }}
        key={index}
      >
        <div
          className="resize-handle left"
          onMouseDown={event => handleResizeStart(event, trackIndex, index, 'left')}
        />
        <div>{region.name}</div>
        <div
          className="resize-handle right"
          onMouseDown={event => handleResizeStart(event, trackIndex, index, 'right')}
        />
      </div>
    ));
  }

  function renderTracks(tracks) {
    return tracks.map((track, index) => (
      <div className="trackContainer" key={index}>
        <div className="trackHeader" onClick={event => {
          switch (event.target.className) {
            case "trackHeader":
              project.tracks[index].select()
              break
            case "add-button":
              project.tracks[index].addRegion()
              break
            case "remove-button":
              if (confirm(`Are you sure you want to delete track "${track.name}"? This action cannot be undone.`))
                delete project.tracks[index]
              break
          }
        }}>
          <p>{track.name} </p>
          <a className="add-button">+</a>
          <a className="remove-button">-</a>
        </div>
        <div className="track" onClick={event => {
          if (event.target.classList.contains('track')) {
            project.deselectAll()
          }
        }} style={{ position: 'relative' }}>
          {renderTrackRegions(track.regions, index)}
        </div>
      </div>
    ))
  }

  return (
    <div>
      <p>{snap.meta.title} | {snap.meta.bpm}BPM | {snap.meta.width}x{snap.meta.height}@{snap.meta.fps}fps</p>
      {renderTracks(snap.tracks)}
      <Inspector project={project} />
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
