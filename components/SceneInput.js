export default function SceneInput({ input, project, region, snapshot, id }) {
    let type = input.type,
        placeholder = input.default,
        value = region.inputs[id] || ""
    switch (type) {
        case 'number':
            type = 'number'
            break
        case 'colour':
        case 'color':
            type = 'color'
            value = region.inputs[id] || input.default
            break
        case 'text':
        default:
            type = 'text'
            break
    }
    return (
        <div>
            <div className="form-group">
                <label htmlFor={id}>{input.label}</label>
                <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={() => {
                        const value = document.getElementById(id).value
                        region.inputs[id] = value // this could become object with static prop for keyframes

                    }}
                ></input>
            </div>
        </div>
    )
}