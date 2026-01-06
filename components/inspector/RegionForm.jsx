import { timeReport } from '@/lib/timeUtils';
import { BugIcon, ClockIcon, LineSegmentsIcon, ImageIcon, PencilIcon, ScissorsIcon, ShareIcon, TerminalIcon, TrashSimpleIcon, TimerIcon, HourglassHighIcon, CopyIcon, SquaresFourIcon } from '@phosphor-icons/react';
import IconText from '../IconText';
import BlendMenu from './BlendMenu';
import Details from '../Details';
import SceneInput from './SceneInput';
import { ButtonStrip, ButtonStripButton } from '../ButtonStrip';

export default function RegionForm({ project, snapshot, openScenes = [] }) {
    const selectedRegion = project.selected[0];
    const times = timeReport(
        selectedRegion.position,
        selectedRegion.length,
        project.meta.bpm,
        project.meta.fps).split(" / ")

    const handleSceneChange = (event) => {
        const sceneId = event.target.value;
        selectedRegion.sceneId = sceneId || null;
        // Reinitialize inputs when scene changes to avoid errors
        selectedRegion.initialiseInputs();
    };

    return (
        <>
            <IconText icon={PencilIcon} as="h3">Region Editor</IconText>
            <div id='scene-select' className="form-group">
                <IconText as='p' icon={ImageIcon} >Scene Select: </IconText>
                <select
                    id="scene"
                    value={selectedRegion.sceneId || ''}
                    onChange={handleSceneChange}
                >
                    <option value="">Select a scene...</option>
                    {openScenes.map(sketch => (
                        <option key={sketch.id} value={sketch.id}>
                            {sketch.name}
                        </option>
                    ))}
                </select>
            </div>
            {selectedRegion.inputs.length > 0 && <Details icon={LineSegmentsIcon} title="Parameters" open={true}>
                {
                    (selectedRegion.inputs || []).map((input, index) => (
                        <SceneInput
                            input={input}
                            index={index}
                            key={input.id + selectedRegion.scene.name}
                            project={project}
                            region={selectedRegion}
                            snapshot={snapshot}
                        />
                    ))
                }
            </Details>}
            <BlendMenu project={project} snapshot={snapshot} />
            <Details icon={ClockIcon} title="Time">
                <IconText icon={HourglassHighIcon} as='p'>{times[0]}</IconText>
                <IconText icon={TimerIcon} as='p'>{times[1]}</IconText>
            </Details>
            {import.meta.env.DEV && (
                <Details icon={BugIcon} title="Debug">
                    <p>Renderer ID {selectedRegion.code}</p>
                    <p>Δbeats (playhead): {selectedRegion.playheadDelta}</p>
                    <IconText as='button' icon={TerminalIcon} onClick={() => {
                        console.log(snapshot.selected[0]);
                    }}>Console Object</IconText>
                </Details>
            )}
            <Details open icon={ScissorsIcon} open title="Actions">
                <ButtonStrip>
                    <ButtonStripButton
                        icon={TrashSimpleIcon}
                        onClick={() => {
                            selectedRegion.del()
                        }}>
                        Delete
                    </ButtonStripButton>
                    <ButtonStripButton
                        icon={ShareIcon}
                        onClick={() => {
                            project.render.queue = [selectedRegion]
                            document.querySelector('#render-radio').click()
                        }}>
                        Render
                    </ButtonStripButton>
                    <ButtonStripButton
                        icon={CopyIcon}
                        onClick={() => {
                            project.copy()
                        }}>
                        Copy
                    </ButtonStripButton>
                    <ButtonStripButton
                        icon={SquaresFourIcon}
                        onClick={() => {
                            document.querySelector('#scenes-radio').click()
                            setTimeout(() => {
                                document.querySelector(`.sketch-list li[data-sketchid='${selectedRegion.sceneId}']`)?.click()
                            }, 100)
                        }}>
                        Library
                    </ButtonStripButton>
                </ButtonStrip>
            </Details>
        </>
    );
}