import IconText from "../IconText";
import { BezierCurveIcon } from "@phosphor-icons/react";

export default function EaseMenu({ id, value, onChange }) {
    const easeOptionGroups = [
        {
            label: 'Basic',
            options: [
                { label: 'None', value: false },
                { label: 'Linear', value: 'linear' },
                { label: 'Sine In Out (Easy Ease)', value: 'sineInOut' }
            ]
        },
        {
            label: 'Quadratic',
            options: [
                { label: 'Quad In', value: 'quadIn' },
                { label: 'Quad Out', value: 'quadOut' },
                { label: 'Quad In Out', value: 'quadInOut' }
            ]
        },
        {
            label: 'Cubic',
            options: [
                { label: 'Cubic In', value: 'cubicIn' },
                { label: 'Cubic Out', value: 'cubicOut' },
                { label: 'Cubic In Out', value: 'cubicInOut' }
            ]
        },
        {
            label: 'Quartic',
            options: [
                { label: 'Quart In', value: 'quartIn' },
                { label: 'Quart Out', value: 'quartOut' },
                { label: 'Quart In Out', value: 'quartInOut' }
            ]
        },
        {
            label: 'Quintic',
            options: [
                { label: 'Quint In', value: 'quintIn' },
                { label: 'Quint Out', value: 'quintOut' },
                { label: 'Quint In Out', value: 'quintInOut' }
            ]
        },
        {
            label: 'Sine',
            options: [
                { label: 'Sine In', value: 'sineIn' },
                { label: 'Sine Out', value: 'sineOut' }
            ]
        },
        {
            label: 'Exponential',
            options: [
                { label: 'Expo In', value: 'expoIn' },
                { label: 'Expo Out', value: 'expoOut' },
                { label: 'Expo In Out', value: 'expoInOut' }
            ]
        },
        {
            label: 'Circular',
            options: [
                { label: 'Circ In', value: 'circIn' },
                { label: 'Circ Out', value: 'circOut' },
                { label: 'Circ In Out', value: 'circInOut' }
            ]
        },
        {
            label: 'Back',
            options: [
                { label: 'Back In', value: 'backIn' },
                { label: 'Back Out', value: 'backOut' },
                { label: 'Back In Out', value: 'backInOut' }
            ]
        },
        {
            label: 'Elastic',
            options: [
                { label: 'Elastic In', value: 'elasticIn' },
                { label: 'Elastic Out', value: 'elasticOut' },
                { label: 'Elastic In Out', value: 'elasticInOut' }
            ]
        },
        {
            label: 'Bounce',
            options: [
                { label: 'Bounce In', value: 'bounceIn' },
                { label: 'Bounce Out', value: 'bounceOut' },
                { label: 'Bounce In Out', value: 'bounceInOut' }
            ]
        }
    ];

    const handleEaseChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div id={id} className="ease-menu">
            <IconText as="label" htmlFor={id + "-select"} icon={BezierCurveIcon}>Keyframe easing</IconText>
            <select id={id + "-select"} className="easeSelect" value={value} onChange={handleEaseChange}>
                {easeOptionGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
}