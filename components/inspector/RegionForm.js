import { timeReport } from '@/lib/timeUtils';
import { ShareIcon, TerminalIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import IconText from '../IconText';
import sketches from '@/data/sketches';
import BlendMenu from './BlendMenu';

export default function RegionForm({ project, snapshot }) {
    const selectedRegion = project.selected[0];
    const times = timeReport(selectedRegion.position, selectedRegion.length, project.meta.bpm, project.meta.fps);

    const handleSceneChange = (event) => {
        const sceneId = event.target.value;
        selectedRegion.sceneId = sceneId || null;
    };

    return (
        <>
            <h3>{selectedRegion.name}</h3>
            <p>{times}</p>

            <div className="form-group">
                <label htmlFor="scene">Scene</label>
                <select
                    id="scene"
                    value={selectedRegion.sceneId || ''}
                    onChange={handleSceneChange}
                >
                    <option value="">Select a scene...</option>
                    {sketches.map(sketch => (
                        <option key={sketch.id} value={sketch.id}>
                            {sketch.title}
                        </option>
                    ))}
                </select>
            </div>
            <p>ID: {selectedRegion.code}</p>
            <BlendMenu project={project} snapshot={snapshot} />
            <IconText as='button' icon={TrashSimpleIcon} onClick={() => {
                selectedRegion.del()
            }}>Delete region</IconText>
            <IconText as='button' icon={TerminalIcon} onClick={() => {
                console.log(snapshot.selected[0]);
            }}>Console Object</IconText>
            <IconText as='button' icon={ShareIcon} onClick={() => {
                project.render.queue = [selectedRegion]
                document.querySelector('#render-radio').click()
            }}>Send to renderer</IconText>
        </>
    );
}