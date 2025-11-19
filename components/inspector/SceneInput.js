import { EraserIcon, MinusCircleIcon, TerminalIcon, PlusCircleIcon, CaretCircleDoubleLeftIcon, CaretCircleDoubleRightIcon } from "@phosphor-icons/react"
import IconText from "../IconText"
import EaseMenu from "./EaseMenu"

export default function SceneInput({ project, region, snapshot, index, input }) {
    const delta = region.playheadDelta

    const getFormValue = () => {
        return document.getElementById(input.id).value
    }

    const getEaseValue = () => {
        if (document.querySelector(`#${input.id}-ease select`)) {
            let value = document.querySelector(`#${input.id}-ease select`).value
            if (value !== 'false')
                return value
        }
        return false
    }

    const makeValueUnset = () => {
        input.makeUnset()
    }

    const updateField = () => {
        const value = getFormValue()
        if (value !== '')
            input.setValue(value, delta, getEaseValue())
        else
            input.removeValue(delta)
    }

    const removeKeyframe = () => {
        input.removeValue(delta)
    }

    const form = input.getForm(delta),
        previousKeyframe = input.previousKeyframe(delta),
        nextKeyframe = input.nextKeyframe(delta)


    const addKeyframe = () => {
        let value = getFormValue()
        if (value === '')
            value = form.placeholder
        input.setKeyframeValue(delta, value, getEaseValue())
    }

    const goToPreviousKeyframe = () => {
        if (previousKeyframe) {
            project.playhead = region.position + previousKeyframe.position
        }
    }

    const goToNextKeyframe = () => {
        if (nextKeyframe) {
            project.playhead = region.position + nextKeyframe.position
        }
    }

    return (
        <div>
            <div className="form-group sceneInput">
                <label htmlFor={input.id}>{input.label}</label>
                <input
                    id={input.id}
                    type={form.type}
                    placeholder={form.placeholder}
                    step={form.step}
                    min={form.min}
                    max={form.max}
                    value={form.value}
                    onChange={updateField}
                ></input>
                {!form.activeKeyframe ?
                    <IconText icon={PlusCircleIcon} as="a" onClick={addKeyframe} title="Add keyframe" /> :
                    <IconText icon={MinusCircleIcon} iconProps={{ weight: "fill" }} as="a" onClick={removeKeyframe} title="Remove keyframe" />
                }
                {input.settings.mode === 'dynamic' &&
                    <>
                        <IconText icon={EraserIcon} as="a" onClick={makeValueUnset} title="Clear value" />
                        <IconText
                            icon={CaretCircleDoubleLeftIcon}
                            as="a"
                            className={!previousKeyframe && "disabled"}
                            onClick={goToPreviousKeyframe}
                            title="Go to previous keyframe" />
                        <IconText icon={CaretCircleDoubleRightIcon} as="a" className={!nextKeyframe && "disabled"} onClick={goToNextKeyframe} title="Go to next keyframe" />
                    </>
                }
                {
                    form.easeMenu &&
                    <EaseMenu value={form.easeMenuValue} id={input.id + "-ease"} onChange={updateField} />
                }
                {/* <IconText icon={TerminalIcon} as="button" onClick={() => {
                    console.log(input);
                }} />
                <p>{input.settings.mode[0].toUpperCase()}</p> */}
            </div>
        </div>
    )
}