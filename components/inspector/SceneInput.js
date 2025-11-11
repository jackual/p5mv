import { EraserIcon, MinusCircleIcon } from "@phosphor-icons/react"
import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { object } from "yup"
import IconText from "../IconText"

export default function SceneInput({ input, project, region, snapshot, id }) {
    const setting = region.inputs[id]
    let type = input.type, placeholder, value, activeKeyframe = false

    switch (setting.mode) {
        case 'static':
            value = setting.value
            break
        case 'dynamic':
            if (setting.value
                .some(item => item.position === region.playheadDelta)) {
                activeKeyframe = true
            }
            break
        case 'unset':
        default:
            value = ""
            placeholder = input.default
            break
    }

    switch (type) {
        case 'number':
            type = 'number'
            break
        case 'colour':
        case 'color':
            type = 'color'
            value = region.inputs[id].value || input.default
            break
        case 'text':
        default:
            type = 'text'
            break
    }

    const makeValueUnset = () => {
        region.inputs[id] = { mode: 'unset', value: null }
    }

    const updateField = () => {
        const value = document.getElementById(id).value
        if (value === "") makeValueUnset()
        else
            region.inputs[id] = { mode: 'static', value } // this could become object with static prop for keyframes
        console.log(region.inputs[id])
    }

    const addKeyframe = () => {

    }

    return (
        <div>
            <div className="form-group sceneInput">
                <label htmlFor={id}>{input.label}</label>
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={updateField}
                ></input>
                <IconText icon={PlusCircleIcon} as="button" onClick={addKeyframe} />
                <IconText icon={EraserIcon} as="button" onClick={makeValueUnset} />
                <p>{setting.mode[0].toUpperCase()}</p>
            </div>
        </div>
    )
}