export default function Inspector({ project }) {
    return (
        <div className="inspector">
            <h2>{project.selectionMode}</h2>
            <p>Details about the selected region will appear here.</p>
        </div>
    )
} 