import { PlusCircleIcon, XCircleIcon, PencilIcon, SlidersHorizontalIcon } from '@phosphor-icons/react'
import IconText from './IconText'
import { useState } from 'react'

export default function ScenePropertyEditor({ 
    sceneInfo, 
    onUpdate, 
    readOnly = false,
    showTitle = false 
}) {
    const [editingPropertyName, setEditingPropertyName] = useState(null)
    const [editingTitle, setEditingTitle] = useState(false)

    const handleAddProperty = () => {
        const newProperty = {
            id: `property${(sceneInfo.inputs || []).length + 1}`,
            label: `New Property`,
            type: 'number',
            default: 0
        }

        const updatedInfo = {
            ...sceneInfo,
            inputs: [...(sceneInfo.inputs || []), newProperty]
        }
        
        onUpdate(updatedInfo)
    }

    const handleDeleteProperty = async (inputId, inputLabel) => {
        const result = await window.showDialog({
            type: 'warning',
            message: `Are you sure you want to delete the property "${inputLabel}"?`,
            title: 'Delete Property'
        })

        if (!result) return

        const updatedInfo = {
            ...sceneInfo,
            inputs: sceneInfo.inputs.filter(inp => inp.id !== inputId)
        }
        
        onUpdate(updatedInfo)
    }

    const handleUpdateProperty = (inputId, field, value) => {
        const updatedInfo = {
            ...sceneInfo,
            inputs: sceneInfo.inputs.map(inp => 
                inp.id === inputId ? { ...inp, [field]: value } : inp
            )
        }
        
        onUpdate(updatedInfo)
    }

    const handleUpdateTitle = (newTitle) => {
        const updatedInfo = {
            ...sceneInfo,
            name: newTitle
        }
        
        onUpdate(updatedInfo)
    }

    return (
        <div className="scene-property-editor">
            {showTitle && (
                <div className="scene-title-header">
                    {readOnly ? (
                        <h2>{sceneInfo.name || 'Untitled'}</h2>
                    ) : editingTitle ? (
                        <input
                            type="text"
                            className="scene-title-input"
                            defaultValue={sceneInfo.name || ''}
                            autoFocus
                            onBlur={(e) => {
                                handleUpdateTitle(e.target.value)
                                setEditingTitle(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    e.target.blur()
                                }
                            }}
                        />
                    ) : (
                        <h2 onClick={() => setEditingTitle(true)}>
                            {sceneInfo.name || 'Untitled'}
                            <PencilIcon size={14} weight="regular" />
                        </h2>
                    )}
                </div>
            )}

            <div className="properties-header">
                <IconText as="h3" icon={SlidersHorizontalIcon}>Properties</IconText>
                {!readOnly && (
                    <button className="add-property-button" onClick={handleAddProperty}>
                        <PlusCircleIcon size={16} weight="regular" />
                        Add Property
                    </button>
                )}
            </div>

            {sceneInfo.inputs && sceneInfo.inputs.length > 0 ? (
                <form className="scene-properties-form">
                    {sceneInfo.inputs.map((input, idx) => (
                        <div key={input.id} className="scene-property-group">
                            <div className="property-header">
                                {readOnly ? (
                                    <h4>{input.label}</h4>
                                ) : editingPropertyName === input.id ? (
                                    <input
                                        type="text"
                                        className="property-name-input"
                                        defaultValue={input.label}
                                        autoFocus
                                        onBlur={(e) => {
                                            handleUpdateProperty(input.id, 'label', e.target.value)
                                            setEditingPropertyName(null)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                e.target.blur()
                                            }
                                        }}
                                    />
                                ) : (
                                    <h4 onClick={() => setEditingPropertyName(input.id)}>
                                        {input.label}
                                        <PencilIcon size={12} weight="regular" />
                                    </h4>
                                )}
                                {!readOnly && (
                                    <XCircleIcon
                                        size={16}
                                        weight="fill"
                                        onClick={() => handleDeleteProperty(input.id, input.label)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor={`scene-input-id-${input.id}`}>ID</label>
                                <div className="id-input-wrapper">
                                    <span className="id-prefix">p5mv.</span>
                                    <input
                                        type="text"
                                        className="id-input"
                                        id={`scene-input-id-${input.id}`}
                                        defaultValue={input.id}
                                        readOnly={readOnly}
                                        onBlur={(e) => {
                                            if (!readOnly) {
                                                handleUpdateProperty(input.id, 'id', e.target.value)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                e.target.blur()
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor={`scene-input-type-${input.id}`}>Type</label>
                                <select
                                    id={`scene-input-type-${input.id}`}
                                    defaultValue={input.type}
                                    disabled={readOnly}
                                    onChange={(e) => {
                                        if (!readOnly) {
                                            handleUpdateProperty(input.id, 'type', e.target.value)
                                        }
                                    }}
                                >
                                    <option value="number">Number</option>
                                    <option value="text">Text</option>
                                    <option value="int">Integer</option>
                                    <option value="float">Float</option>
                                    <option value="percent">Percentage</option>
                                    <option value="colour">Colour</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor={`scene-input-default-${input.id}`}>Default</label>
                                <input
                                    type="text"
                                    id={`scene-input-default-${input.id}`}
                                    defaultValue={input.default || ''}
                                    readOnly={readOnly}
                                    onBlur={(e) => {
                                        if (!readOnly) {
                                            handleUpdateProperty(input.id, 'default', e.target.value)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            e.target.blur()
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </form>
            ) : <p>No properties for this scene.</p>}
        </div>
    )
}
