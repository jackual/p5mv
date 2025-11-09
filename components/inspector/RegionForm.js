import { timeReport } from '@/lib/timeUtils';
import { BugIcon, ClockIcon, PencilIcon, ScissorsIcon, ShareIcon, TerminalIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import IconText from '../IconText';
import sketches from '@/data/sketches';
import BlendMenu from './BlendMenu';
import InspectorSection from './InspectorSection';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr';

export default function RegionForm({ project, snapshot }) {
    const selectedRegion = project.selected[0];
    const times = timeReport(selectedRegion.position, selectedRegion.length, project.meta.bpm, project.meta.fps);

    const handleSceneChange = (event) => {
        const sceneId = event.target.value;
        selectedRegion.sceneId = sceneId || null;
    };

    return (
        <>
            <IconText icon={PencilIcon} as="h3">Region Editor</IconText>
            <InspectorSection icon={ImageIcon} title="Scene" open={true}>
                <div className="form-group">
                    <label htmlFor="scene">Select</label>
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
            </InspectorSection>
            <BlendMenu project={project} snapshot={snapshot} />
            <InspectorSection icon={ClockIcon} title="Time">
                <pre>{times.replace(" / ", "\n")}</pre>
            </InspectorSection>
            <InspectorSection icon={BugIcon} title="Debug">
                <p>Renderer ID {selectedRegion.code}</p>
                <IconText as='button' icon={TerminalIcon} onClick={() => {
                    console.log(snapshot.selected[0]);
                }}>Console Object</IconText>
            </InspectorSection>
            <InspectorSection icon={ScissorsIcon} title="Actions">
                <IconText as='button' icon={TrashSimpleIcon} onClick={() => {
                    selectedRegion.del()
                }}>Delete region</IconText>
                <IconText as='button' icon={ShareIcon} onClick={() => {
                    project.render.queue = [selectedRegion]
                    document.querySelector('#render-radio').click()
                }}>Send to renderer</IconText>
            </InspectorSection>
        </>
    );
}