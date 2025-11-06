import { WarningCircleIcon } from "@phosphor-icons/react";
import IconText from "./IconText";
import sketches from "../data/sketches";

export default function TrackRegions({ trackRegions, trackIndex, resizeState, handleResizeStart, project, snap }) {
  return trackRegions.map((region, index) => {
    if (region.position + region.length < snap.view.start) return null
    //if (region.position > snap.view.end) return null // region ends after view end
    let displayPosition = region.position - snap.view.start
    let displayLength = region.length

    // Build className array
    const classNames = ["region"]

    if (displayPosition < 0) {
      displayLength += displayPosition
      displayPosition = 0
      classNames.push("truncated-left")
    }

    if (region.selected) {
      classNames.push("selected")
    }

    if (resizeState) {
      classNames.push("resizing")
    }

    classNames.push(`scene-${region.sceneId || 'none'}`)

    if (displayLength <= 0) return null

    // Calculate region width in pixels
    const regionWidth = snap.view.beatWidth * displayLength

    // Minimum width to show "No scene" text (roughly 80px for icon + text)
    const minWidthForNoSceneText = 80

    return (
      <div
        data-region-index={index}
        className={classNames.join(" ")}
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
          width: regionWidth,
          left: snap.view.beatWidth * displayPosition,
          top: 0
        }}
        key={index}
      >
        <div
          className="resize-handle left"
          onMouseDown={event => handleResizeStart(event, trackIndex, index, 'left')}
        />
        <div>
          {region.sceneId ? (
            region.scene.title
          ) : (
            <IconText icon={WarningCircleIcon} as="span" iconProps={{ weight: "fill" }}>
              {regionWidth >= minWidthForNoSceneText && "No scene"}
            </IconText>
          )}
        </div>
        <div
          className="resize-handle right"
          onMouseDown={event => handleResizeStart(event, trackIndex, index, 'right')}
        />
      </div>
    )
  });
}