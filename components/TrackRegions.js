export default function TrackRegions({ trackRegions, trackIndex, resizeState, handleResizeStart, project, snap }) {
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