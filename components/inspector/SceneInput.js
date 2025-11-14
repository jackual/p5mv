import { EraserIcon, MinusCircleIcon, TerminalIcon, PlusCircleIcon, CaretCircleDoubleLeftIcon, CaretCircleDoubleRightIcon } from "@phosphor-icons/react"
import IconText from "../IconText"

export default function SceneInput({ project, region, snapshot, index, input }) {
    const delta = region.playheadDelta

    const getFormValue = () => {
        return document.getElementById(input.id).value
    }

    const makeValueUnset = () => {
        input.makeUnset()
    }

    const updateField = () => {
        const value = getFormValue()
        if (value !== '')
            input.setValue(value, delta)
        else
            input.removeValue(delta)
    }

    const removeKeyframe = () => {
        input.removeValue(delta)
    }

    const addKeyframe = () => {
        let value = getFormValue()
        if (value === '')
            value = input.default
        input.setKeyframeValue(delta, value)
    }

    const form = input.getForm(delta),
        previousKeyframe = input.previousKeyframe(delta),
        nextKeyframe = input.nextKeyframe(delta)

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
                    <IconText icon={PlusCircleIcon} as="button" onClick={addKeyframe} /> :
                    <IconText icon={MinusCircleIcon} iconProps={{ weight: "fill" }} as="button" onClick={removeKeyframe} />
                }
                {input.settings.mode === 'dynamic' &&
                    <>
                        <IconText icon={EraserIcon} as="button" onClick={makeValueUnset} />
                        <IconText
                            icon={CaretCircleDoubleLeftIcon}
                            as="button"
                            disabled={!previousKeyframe}
                            onClick={goToPreviousKeyframe} />
                        <IconText icon={CaretCircleDoubleRightIcon} as="button" disabled={!nextKeyframe} onClick={goToNextKeyframe} />
                    </>
                }
                {/* <IconText icon={TerminalIcon} as="button" onClick={() => {
                    console.log(input);
                }} />
                <p>{input.settings.mode[0].toUpperCase()}</p> */}
            </div>
        </div>
    )
}