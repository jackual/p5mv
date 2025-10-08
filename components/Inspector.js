export default function Inspector({ project }) {
    const form = {
        region: () => (<h1>{project.selected[0].name}</h1>),
        'same-track': () => (<h1>{project.selected.length} regions selected</h1>),
        'whole-track': () => (<h1>Whole track selected</h1>),
        mixed: () => (<h1>Mixed selection</h1>),
        none: () => (<>
            <h1>Project</h1>
        </>)
    }
    return (
        <div className="inspector">
            {form[project.selectionMode]()}
        </div>
    )
}  