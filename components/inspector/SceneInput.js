import { EraserIcon, MinusCircleIcon } from "@phosphor-icons/react"
import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { object } from "yup"
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

    const form = input.getForm(delta)

    return (
        <div>
            <div className="form-group sceneInput">
                <label htmlFor={input.id}>{input.label}</label>
                <input
                    id={input.id}
                    type={form.type}
                    placeholder={form.placeholder}
                    value={form.value}
                    onChange={updateField}
                ></input>
                {!form.activeKeyframe ?
                    <IconText icon={PlusCircleIcon} as="button" onClick={addKeyframe} /> :
                    <IconText icon={MinusCircleIcon} as="button" onClick={removeKeyframe} />
                }
                <IconText icon={EraserIcon} as="button" onClick={makeValueUnset} />
                <p>{input.settings.mode[0].toUpperCase()}</p>
            </div>
        </div>
    )
}