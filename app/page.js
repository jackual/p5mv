'use client'

import { proxy, useSnapshot } from 'valtio'
import { useState, useEffect } from 'react'
import useRegionResize from '@/hooks/useRegionResize'
import Project from '@/lib/classes/Project'

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
          project.tracks[index].select()
        }}>
          <p>{track.name}</p>
        </div>
        <div className="track" style={{ position: 'relative' }}>
          {renderTrackRegions(track.regions, index)}
        </div>
      </div>
    ))
  }

  return (
    <div>
      {renderTracks(snap.tracks)}
    </div>
  )
}

onkeydown = (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    project.selected.forEach(region => region.del())
  }
}