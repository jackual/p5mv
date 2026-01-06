import RegionForm from './inspector/RegionForm';
import SameTrackForm from './inspector/SameTrackForm';
import WholeTrackForm from './inspector/WholeTrackForm';
import MixedForm from './inspector/MixedForm';
import ProjectSettingsForm from './inspector/ProjectSettingsForm';

export default function Inspector({ project, snapshot, openScenes }) {
    const form = {
        region: <RegionForm project={project} snapshot={snapshot} openScenes={openScenes} />,
        'same-track': <SameTrackForm project={project} />,
        'whole-track': <WholeTrackForm project={project} snapshot={snapshot} />,
        mixed: <MixedForm />,
        none: <ProjectSettingsForm project={project} snapshot={snapshot} />
    }

    return (
        <div className="inspector">
            {form[project.selectionMode]}
        </div>
    )
}  