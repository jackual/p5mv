import { useState, useRef } from 'react'

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
            ref={timeGridRef}
            onMouseDown={mouseDown}
            onMouseMove={mouseMove}
            onMouseUp={mouseUp}
            onMouseLeave={mouseUp}
        >
            {cycle.position !== null && cycle.length && cycle.length > 0 ? (
                <div className="cycle" style={{
                    position: 'absolute',
                    left: cycle.position * snap.view.beatWidth,
                    width: cycle.length * snap.view.beatWidth,
                    height: '100%',
                    backgroundColor: 'rgba(0, 255, 0, 0.3)',
                    border: '1px solid #00ff00',
                    cursor: 'pointer',
                    zIndex: 10
                }} />
            ) : null}
            {Array.from({ length }, (_, i) => {
                if (snap.view.start > i) return null
                let className = "notch"
                if (i % 4 === 0) className += " bar"
                if (i % 16 === 0) className += " major-bar"
                if (i === nearestBeat) className += " nearest"
                const secondsFloat = (60 / snap.meta.bpm) * i
                const minutes = Math.floor(secondsFloat / 60)
                const seconds = Math.floor(secondsFloat % 60)
                const frames = Math.floor((secondsFloat % 1) * snap.meta.fps)
                const timecode = `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`

                return <>
                    {i % 16 === 0 && <p style={{ left: ((i - snap.view.start) * snap.view.beatWidth) + 130 }} key={"tg-label-" + i}>
                        {timecode}
                    </p>}
                    <div className={className} data-pos={i} style={style} key={"tg" + i}></div>
                </>
            })}
        </div>
    )
}