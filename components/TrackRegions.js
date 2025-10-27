export default function TrackRegions({ trackRegions, trackIndex, resizeState, handleResizeStart, project, snap }) {
  return trackRegions.map((region, index) => {
    if (region.position + region.length < snap.view.start) return null
    //if (region.position > snap.view.end) return null // region ends after view end
    let displayPosition = region.position - snap.view.start
    let displayLength = region.length
    let truncated = ''
    if (displayPosition < 0) {
      displayLength += displayPosition
      displayPosition = 0
      truncated = ' truncated-left '
    }
    if (displayLength <= 0) return null
    return (
      <div
        data-region-index={index}
        className={"region" + truncated + (region.selected ? " selected" : "") + (resizeState ? " resizing" : "")}
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
          width: snap.view.beatWidth * displayLength,
          left: snap.view.beatWidth * displayPosition,
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
    )
  });
}