function ButtonStrip({ children }) {
    return (
        <div className="button-strip">
            {children}
        </div>
    )
}

function ButtonStripButton({ icon: Icon, onClick, children, title }) {
    return (
        <div className="button-strip-button">
            <div onClick={onClick} title={title}>
                <Icon />
            </div>
            <p>{children}</p>
        </div>
    )
}

export { ButtonStrip, ButtonStripButton }