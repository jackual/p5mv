export default function TimeGrid({ snap, nearestBeat }) {
    const style = { width: snap.view.beatWidth }

    return (
        <div className="timeGrid">
            {Array.from({ length: snap.length + 1 }, (_, i) => {
                let className = "notch"
                if (i % 4 === 0) className += " bar"
                if (i % 16 === 0) className += " major-bar"
                if (i === nearestBeat) className += " nearest"

                return <div className={className} data-pos={i} style={style} key={i}></div>
            })}
        </div>
    )
}