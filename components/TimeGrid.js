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
        if (e.target.classList.contains('cycle')) {
            setCycle({
                startPosition: null, position: null, length: null, cycling: false
            })
            return // Stop execution here
        }
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
        setCycle(prev => ({
            ...prev,
            cycling: false
        }))
    }

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