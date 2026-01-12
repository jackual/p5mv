import { XIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

export default function Tooltip({ target, message, onClose }) {
    const [position, setPosition] = useState(null)

    useEffect(() => {
        if (!target) return

        // Find the target element by ID - try with -radio suffix first, then without
        let targetElement = document.getElementById(`${target}-radio`)
        
        if (!targetElement) {
            targetElement = document.getElementById(target)
        }
        
        if (!targetElement) {
            console.warn(`Tooltip target element not found: ${target}`)
            return
        }

        // Get the bounding rectangle of the target element
        const rect = targetElement.getBoundingClientRect()
        
        // Position the tooltip below the target element
        setPosition({
            top: rect.bottom + 10,
            left: rect.left + rect.width / 2
        })
    }, [target])

    if (!position) return null

    return (
        <div
            className="tooltip-pointer"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
        >
            <div className="tooltip-arrow" />
            <div className="tooltip-content">
                <button className="tooltip-close-btn" onClick={onClose} aria-label="Close">
                    <XIcon size={14} weight="bold" />
                </button>
                <div className="tooltip-message">{message}</div>
            </div>
        </div>
    )
}
