import { InfoIcon, WarningIcon, CheckCircleIcon } from "@phosphor-icons/react"

export default function Dialog({ type = 'info', title, message, confirmLabel = 'OK', cancelLabel = 'Cancel', onConfirm, onCancel, onClose }) {
    const icon = type === 'warning' ? <WarningIcon size={32} weight="fill" /> :
                 type === 'success' ? <CheckCircleIcon size={32} weight="fill" /> :
                 <InfoIcon size={32} weight="fill" />

    const handleConfirm = () => {
        if (onConfirm) onConfirm()
        if (onClose) onClose()
    }

    const handleCancel = () => {
        if (onCancel) onCancel()
        if (onClose) onClose()
    }

    return (
        <div className="dialog-overlay">
            <div className="dialog-container">
                {onCancel && (
                    <button className="dialog-close" onClick={handleCancel} aria-label="Close">
                        ×
                    </button>
                )}
                <div className="dialog-icon">
                    {icon}
                </div>
                {title && <h3 className="dialog-title">{title}</h3>}
                <p className="dialog-message">{message}</p>
                <div className="dialog-buttons">
                    {onCancel && (
                        <button className="dialog-button dialog-button-cancel" onClick={handleCancel}>
                            {cancelLabel}
                        </button>
                    )}
                    <button className="dialog-button dialog-button-confirm" onClick={handleConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
