import blendModes from '@/data/blendModes';
import Blend from '@/lib/classes/Blend';
import IconText from '../IconText';
import InspectorSection from '../Details';
import { CircleHalfTiltIcon } from '@phosphor-icons/react';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr';

export default function BlendMenu({ project, snapshot }) {
    // Get current values from snapshot
    const selectedBlendMode = snapshot.selected.length > 0 && snapshot.selected[0].blend
        ? snapshot.selected[0].blend.mode
        : 'source-over';

    const opacity = snapshot.selected.length > 0 && snapshot.selected[0].blend
        ? snapshot.selected[0].blend.opacityPercentage
        : 100;

    const handleBlendModeChange = (event) => {
        const selectedValue = event.target.value;

        // Update the selected region's blend mode directly on the project
        if (project.selected.length > 0) {
            if (!project.selected[0].blend) {
                project.selected[0].blend = new Blend();
            }
            project.selected[0].blend.mode = selectedValue;
        }
    };

    const handleOpacityChange = (event) => {
        const opacityValue = parseFloat(event.target.value);

        // Update the selected region's blend opacity directly on the project
        if (project.selected.length > 0) {
            if (!project.selected[0].blend) {
                project.selected[0].blend = new Blend();
            }
            project.selected[0].blend.opacityPercentage = opacityValue;
        }
    };

    // Find the description for the currently selected blend mode
    const getSelectedModeDescription = () => {
        for (const [category, modes] of Object.entries(blendModes)) {
            const mode = modes.find(m => m.value === selectedBlendMode);
            if (mode) {
                return mode.description;
            }
        }
        return '';
    };

    return (
        <InspectorSection icon={CircleHalfTiltIcon} title="Composite" open={false}>
            <div className="form-group">
                <label htmlFor="opacity">Opacity (%)</label>
                <input
                    id="opacity"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={opacity}
                    onChange={handleOpacityChange}
                />
                <br />
                <label htmlFor="blendMode">Blend Mode</label>
                <select
                    id="blendMode"
                    value={selectedBlendMode}
                    onChange={handleBlendModeChange}
                    className="blend-mode-select"
                >
                    {Object.entries(blendModes).map(([category, modes]) => (
                        <optgroup key={category} label={category}>
                            {modes.map((mode) => (
                                <option key={mode.value} value={mode.value}>
                                    {mode.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <br />
                {getSelectedModeDescription() && (
                    <IconText as='small' iconProps={{ weight: "bold" }} icon={InfoIcon} className="blend-mode-description">
                        {getSelectedModeDescription()}
                    </IconText>
                )}
            </div>
        </InspectorSection>
    );
}