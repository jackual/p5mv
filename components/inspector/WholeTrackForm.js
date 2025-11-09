import BlendMenu from './BlendMenu';

export default function WholeTrackForm({ project, snapshot }) {
    return (
        <>
            <h3>{project.selected[0].track.name} regions selected</h3>
            {/* <BlendMenu project={project} snapshot={snapshot} /> */}
        </>
    );
}