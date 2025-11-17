import { timeReport } from '@/lib/timeUtils';
import { BugIcon, ClockIcon, PencilIcon, ScissorsIcon, ShareIcon, TerminalIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import IconText from '../IconText';
import sketches from '@/data/sketches';
import BlendMenu from './BlendMenu';
import Details from '../Details';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr';
import SceneInput from './SceneInput';

export default function RegionForm({ project, snapshot }) {
    const selectedRegion = project.selected[0];
    const times = timeReport(
        selectedRegion.position,
        selectedRegion.length,
        project.meta.bpm,
        project.meta.fps);

    const handleSceneChange = (event) => {
        const sceneId = event.target.value;
        selectedRegion.sceneId = sceneId || null;
        // Reinitialize inputs when scene changes to avoid errors
        selectedRegion.initialiseInputs();
    };

    return (
        <>
            <IconText icon={PencilIcon} as="h3">Region Editor</IconText>
            <Details icon={ImageIcon} title="Scene" open={true}>
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
                {
                    selectedRegion.sceneId && (selectedRegion.inputs || []).map((input, index) => (
                        <SceneInput
                            input={input}
                            index={index}
                            key={input.id + selectedRegion.scene.title}
                            project={project}
                            region={selectedRegion}
                            snapshot={snapshot}
                        />
                    ))
                }
            </Details>
            <BlendMenu project={project} snapshot={snapshot} />
            <Details icon={ClockIcon} title="Time">
                <pre>{times.replace(" / ", "\n")}</pre>
            </Details>
            <Details icon={BugIcon} title="Debug">
                <p>Renderer ID {selectedRegion.code}</p>
                <p>Δbeats (playhead): {selectedRegion.playheadDelta}</p>
                <IconText as='button' icon={TerminalIcon} onClick={() => {
                    console.log(snapshot.selected[0]);
                }}>Console Object</IconText>
            </Details>
            <Details icon={ScissorsIcon} title="Actions">
                <IconText as='button' icon={TrashSimpleIcon} onClick={() => {
                    selectedRegion.del()
                }}>Delete region</IconText>
                <IconText as='button' icon={ShareIcon} onClick={() => {
                    project.render.queue = [selectedRegion]
                    document.querySelector('#render-radio').click()
                }}>Send to renderer</IconText>
            </Details>
        </>
    );
}