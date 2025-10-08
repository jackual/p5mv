export default function TimeGrid({ snap }) {
    const style = { width: snap.view.beatWidth }
    return <div className="timeGrid">
        {Array.from({ length: 20 }, (_, i) => {
            let className = "notch"
            if (i % 4 === 0) className += " bar"
            if (i % 16 === 0) className += " major-bar"
            return <div className={className} style={style} key={i}></div>
        })}
    </div>
}