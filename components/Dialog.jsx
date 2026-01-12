import { InfoIcon } from "@phosphor-icons/react"

export default function Dialog({ message, action, actionLabel, onClose }) {
    return (
        <div className="dialog-overlay">
            <div className="dialog-container">
                <button className="dialog-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                <div className="dialog-icon">
                    <InfoIcon size={32} weight="fill" />
                </div>
                <p className="dialog-message">{message}</p>
                {action && (
                    <button className="dialog-action" onClick={action}>
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}
