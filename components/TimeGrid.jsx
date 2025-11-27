import { useState, useRef } from 'react'
import { beatsToTimecode } from '@/lib/timeUtils'

export default function TimeGrid({ snap, nearestBeat }) {
    const style = { width: snap.view.beatWidth }
    const timeGridRef = useRef(null)
    const [cycle, setCycle] = useState({
        startPosition: null,
        position: null,
        length: null,
        cycling: false
    })

    const getBeatFromMouseEvent = (e) => {
        if (!timeGridRef.current) return null
        const rect = timeGridRef.current.getBoundingClientRect()
        const relativeX = e.clientX - rect.left
        const beatPosition = relativeX / snap.view.beatWidth
        return Math.max(0, Math.round(beatPosition))
    }

    const mouseDown = (e) => {
        e.stopPropagation()
        const startBeat = getBeatFromMouseEvent(e)
        setCycle({
            startPosition: startBeat,
            position: startBeat,
            length: 1,
            cycling: true
        })
    }

    const mouseMove = (e) => {
        if (cycle.cycling && cycle.startPosition !== null) {
            e.stopPropagation()
            const currentBeat = getBeatFromMouseEvent(e)
            if (currentBeat !== null) {
                const startPos = Math.min(cycle.startPosition, currentBeat)
                const endPos = Math.max(cycle.startPosition, currentBeat)
                const length = endPos - startPos + 1

                setCycle(prev => ({
                    ...prev,
                    position: startPos,
                    length: length
                }))
            }
        }
    }

    const mouseUp = (e) => {
        e.stopPropagation()
        if (cycle.length === 1) {
            setCycle({
                startPosition: null,
                position: null,
                length: null,
                cycling: false
            })
        }
        else
            setCycle(prev => ({
                ...prev,
                cycling: false
            }))
    }

    const length = Math.min(snap.view.end, snap.length + 1) // fix this

    return (
        <div
            className="timeGrid"
            key={"tg-" + snap.view.start + "-" + snap.view.end}
            ref={timeGridRef}
            onMouseDown={mouseDown}
            onMouseMove={mouseMove}
            onMouseUp={mouseUp}
            onMouseLeave={mouseUp}
        >
            {cycle.position !== null && cycle.length && cycle.length > 0 ? (
                <div className="cycle" style={{
                    left: cycle.position * snap.view.beatWidth,
                    width: cycle.length * snap.view.beatWidth
                }} />
            ) : null}
            {Array.from({ length }, (_, i) => {
                if (snap.view.start > i) return null
                let className = "notch"
                if (i % 4 === 0) className += " bar"
                if (i % 16 === 0) className += " major-bar"
                if (i === nearestBeat) className += " nearest"
                if (snap.view.beatWidth < 8 && className == "notch") className = ""
                const timecode = beatsToTimecode(i, snap.meta.bpm, snap.meta.fps)

                return <div key={`tg-beat-${i}`} style={{ position: 'relative' }}>
                    {i % 16 === 0 && <p style={{ left: ((i - snap.view.start) * snap.view.beatWidth) + 130 }} key={`tg-label-${i}`}>
                        {timecode}
                    </p>}
                    <div className={className} data-pos={i} style={style} key={`tg-notch-${i}`}></div>
                </div>
            })}
        </div>
    )
}