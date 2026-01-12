import IconText from './IconText'
import Tooltip from './Tooltip'
import {
    SquaresFourIcon,
    ImageIcon,
    SlidersHorizontalIcon,
    FileIcon,
    FolderIcon,
    FileDashedIcon,
    PlusCircleIcon,
    TrashIcon,
    FolderOpenIcon,
    XCircleIcon,
    PencilIcon
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import Details from './Details'

export default function Scenes({ isActive, availableScenes, setAvailableScenes }) {
    const [selectedSketch, setSelectedSketch] = useState(null) // { id, source }
    const [activeDragTarget, setActiveDragTarget] = useState(null) // track which source is being dragged over
    const [draggedSource, setDraggedSource] = useState(null) // track which source is being dragged from
    const [editingPropertyName, setEditingPropertyName] = useState(null) // track which property name is being edited
    const [propertyNames, setPropertyNames] = useState({}) // store custom property names
    const [isImporting, setIsImporting] = useState(false) // track import progress
    const [editingTitle, setEditingTitle] = useState(false) // track if scene title is being edited
    const [showEmptyTooltip, setShowEmptyTooltip] = useState(false)
    const [savingScene, setSavingScene] = useState(false) // track if scene is being saved

    useEffect(() => {
        if (!isActive) return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) return

        // Listen for import progress events
        const handleImportProgress = (event, { status, path, error }) => {
            if (status === 'importing') {
                setIsImporting(true)
            } else if (status === 'complete') {
                setIsImporting(false)
            } else if (status === 'error') {
                setIsImporting(false)
                window.showAlert(`An error occurred while importing the scene: ${error || 'Unknown error'}`, 'Failed to Import Scene')
            }
        }

        // Listen for scene conflict dialog
        const handleSceneConflictDialog = async (event, { sceneId }) => {
            const result = await window.showDialog({
                type: 'warning',
                title: 'Scene Already Exists',
                message: `A scene with the ID "${sceneId}" already exists in this location. What would you like to do?`,
                confirmLabel: 'Replace',
                cancelLabel: 'Cancel',
                onCancel: () => { }
            })
            // Send response back: 0 for Cancel, 1 for Replace
            // For now we don't support "Keep Both" option
            ipcRenderer.send('scene-conflict-dialog-response', result ? 1 : 0)
        }

        // Listen for delete scene dialog
        const handleDeleteSceneDialog = async (event, { sceneId }) => {
            const result = await window.showConfirm(
                `Are you sure you want to delete "${sceneId}"? This action cannot be undone.`,
                'Delete Scene'
            )
            // Send response back: 0 for Cancel, 1 for Delete
            ipcRenderer.send('delete-scene-dialog-response', result ? 1 : 0)
        }

        ipcRenderer.on('scene-import-progress', handleImportProgress)
        ipcRenderer.on('show-scene-conflict-dialog', handleSceneConflictDialog)
        ipcRenderer.on('show-delete-scene-dialog', handleDeleteSceneDialog)

        // Check if project scenes is empty and show tooltip
        if (availableScenes.openScenes.length === 0) {
            const dismissed = sessionStorage.getItem('emptyScenesGuideDismissed')
            if (!dismissed) {
                setShowEmptyTooltip(true)
            }
        } else {
            setShowEmptyTooltip(false)
        }

        return () => {
            ipcRenderer.removeListener('scene-import-progress', handleImportProgress)
            ipcRenderer.removeListener('show-scene-conflict-dialog', handleSceneConflictDialog)
            ipcRenderer.removeListener('show-delete-scene-dialog', handleDeleteSceneDialog)
        }
    }, [isActive, availableScenes.openScenes.length])

    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = async (e) => {
            if (e.key === 'Backspace' && selectedSketch) {
                // Don't delete if user is typing in a form field
                const activeElement = document.activeElement
                if (activeElement && (
                    activeElement.tagName === 'INPUT' ||
                    activeElement.tagName === 'TEXTAREA' ||
                    activeElement.tagName === 'SELECT' ||
                    activeElement.isContentEditable
                )) {
                    return
                }

                // Don't allow deleting preset scenes
                if (selectedSketch.source === 'defaultScenes') {
                    return
                }

                const ipcRenderer = window.require?.('electron')?.ipcRenderer
                if (!ipcRenderer) return

                const choice = await ipcRenderer.invoke('show-delete-scene-dialog', { sceneId: selectedSketch.id })

                if (choice === 1) { // Delete
                    try {
                        await ipcRenderer.invoke('delete-scene', {
                            sourceKey: selectedSketch.source,
                            sceneId: selectedSketch.id
                        })
                        setSelectedSketch(null)
                        // Refresh after delete
                        const updatedScenes = await ipcRenderer.invoke('scan-scenes')
                        setAvailableScenes(updatedScenes)
                    } catch (error) {
                        console.error('Error deleting scene:', error)
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isActive, selectedSketch])

    const handleClick = (e) => {
        const li = e.target.closest('li')
        if (li) {
            const sketchId = li.getAttribute('data-sketchid')
            const source = li.getAttribute('data-source')
            if (!selectedSketch || sketchId !== selectedSketch.id || source !== selectedSketch.source) {
                setSelectedSketch({ id: sketchId, source })
                return
            }
        }
        setSelectedSketch(null)
    }

    const sceneGallerySections = [
        {
            title: 'Project scenes',
            icon: FileIcon,
            source: 'openScenes',
            scenes: [...availableScenes.openScenes],
            emptyState: 'No sketches in this project',
            addCard: true
        },
        {
            title: 'User scenes',
            icon: FolderIcon,
            source: 'userDirectoryScenes',
            scenes: [...availableScenes.userDirectoryScenes],
            addCard: true,
            emptyState: 'No user scenes found. Add scenes to your Videos/p5mv/Sketches folder.'
        },
        {
            title: 'Preset Scenes',
            icon: SquaresFourIcon,
            source: 'defaultScenes',
            scenes: [...availableScenes.defaultScenes]
        }
    ]

    const selectedScene = selectedSketch
        ? sceneGallerySections
            .find(section => section.source === selectedSketch.source)
            ?.scenes.find(s => s.id === selectedSketch.id)
        : null

    const handleDragStart = (source) => (event, sketchId) => {
        if (!sketchId) return
        event.dataTransfer.setData('text/plain', sketchId)
        event.dataTransfer.effectAllowed = 'copy'
        setDraggedSource(source)
    }

    const handleDragEnd = () => {
        setActiveDragTarget(null)
        setDraggedSource(null)
    }

    const handleDragOver = (source) => (event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
        if (draggedSource !== source && activeDragTarget !== source) {
            setActiveDragTarget(source)
        }
    }

    const handleDragLeave = (source) => (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setActiveDragTarget(null)
        }
    }

    const handleDrop = (source) => async (event) => {
        event.preventDefault()
        const sketchId = event.dataTransfer.getData('text/plain')
        setActiveDragTarget(null)

        if (sketchId) {
            // Refresh scenes before completing the drop to avoid conflicts
            const ipcRenderer = window.require?.('electron')?.ipcRenderer
            if (!ipcRenderer) {
                console.error('ipcRenderer not available')
                return
            }

            const scenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(scenes)

            const hasConflict = scenes[source].some(s => s.id === sketchId)

            if (hasConflict) {
                const choice = await ipcRenderer.invoke('show-scene-conflict-dialog', { sketchId })

                if (choice === 0) {
                    // Cancel - do nothing
                    return
                } else if (choice === 1) {
                    // Replace - copy with overwrite
                    try {
                        await ipcRenderer.invoke('copy-scene-internal', {
                            sourceKey: draggedSource,
                            targetKey: source,
                            sceneId: sketchId,
                            newSceneId: sketchId,
                            overwrite: true
                        })
                        // Refresh after copy
                        const updatedScenes = await ipcRenderer.invoke('scan-scenes')
                        setAvailableScenes(updatedScenes)
                    } catch (error) {
                        console.error('Error replacing scene:', error)
                    }
                } else if (choice === 2) {
                    // Keep Both - copy with unique name
                    try {
                        const existingIds = scenes[source].map(s => s.id)
                        const { getUniqueNameWithSuffix } = await import('../lib/utils.js')
                        const uniqueId = getUniqueNameWithSuffix(existingIds, sketchId)

                        await ipcRenderer.invoke('copy-scene-internal', {
                            sourceKey: draggedSource,
                            targetKey: source,
                            sceneId: sketchId,
                            newSceneId: uniqueId,
                            overwrite: false
                        })
                        // Refresh after copy
                        const updatedScenes = await ipcRenderer.invoke('scan-scenes')
                        setAvailableScenes(updatedScenes)
                    } catch (error) {
                        console.error('Error copying scene with unique name:', error)
                    }
                }
            } else {
                // No conflict - just copy
                try {
                    await ipcRenderer.invoke('copy-scene-internal', {
                        sourceKey: draggedSource,
                        targetKey: source,
                        sceneId: sketchId,
                        newSceneId: sketchId,
                        overwrite: false
                    })
                    // Refresh after copy
                    const updatedScenes = await ipcRenderer.invoke('scan-scenes')
                    setAvailableScenes(updatedScenes)
                } catch (error) {
                    console.error('Error copying scene:', error)
                }
            }
        }
    }

    const importScene = (source) => async (event) => {
        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) {
            console.error('ipcRenderer not available')
            return
        }
        const result = await ipcRenderer.invoke('show-open-scene-dialog', { source })
        if (result) {
            // Refresh scenes after import
            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        }
    }

    const handleAddToProject = async () => {
        if (!selectedSketch || selectedSketch.source === 'openScenes') return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) return

        try {
            await ipcRenderer.invoke('copy-scene-internal', {
                sourceKey: selectedSketch.source,
                targetKey: 'openScenes',
                sceneId: selectedSketch.id
            })
            // Refresh scenes after adding
            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        } catch (error) {
            console.error('Error adding scene to project:', error)
        }
    }

    const handleShowInFinder = async () => {
        if (!selectedSketch || selectedSketch.source === 'defaultScenes') return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) return

        const scene = selectedScene
        if (scene?._path) {
            await ipcRenderer.invoke('show-item-in-folder', scene._path)
        }
    }

    const handleSaveSceneProperty = async (scene, inputId, field, value) => {
        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer || !scene._path) return

        try {
            setSavingScene(true)

            // Get current scene info
            const currentInfo = await ipcRenderer.invoke('read-scene-info', {
                scenePath: scene._path
            })

            // Find the input to update
            const inputIndex = currentInfo.inputs.findIndex(inp => inp.id === inputId)
            if (inputIndex === -1) return

            // Update the specific field
            currentInfo.inputs[inputIndex][field] = value

            // Save back to file
            await ipcRenderer.invoke('update-scene-info', {
                scenePath: scene._path,
                updates: currentInfo
            })

            // Refresh scenes to get updated data
            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        } catch (error) {
            console.error('Error saving scene property:', error)
        } finally {
            setSavingScene(false)
        }
    }

    const handleSaveSceneTitle = async (scene, newTitle) => {
        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer || !scene._path) return

        try {
            setSavingScene(true)

            const currentInfo = await ipcRenderer.invoke('read-scene-info', {
                scenePath: scene._path
            })

            currentInfo.title = newTitle
            currentInfo.name = newTitle

            await ipcRenderer.invoke('update-scene-info', {
                scenePath: scene._path,
                updates: currentInfo
            })

            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        } catch (error) {
            console.error('Error saving scene title:', error)
        } finally {
            setSavingScene(false)
        }
    }

    const handleAddSceneProperty = async (scene) => {
        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer || !scene._path) return

        try {
            setSavingScene(true)

            const currentInfo = await ipcRenderer.invoke('read-scene-info', {
                scenePath: scene._path
            })

            // Create new property with default values
            const newProperty = {
                id: `property${(currentInfo.inputs || []).length + 1}`,
                label: `New Property`,
                type: 'number',
                default: 0
            }

            // Add to inputs array
            if (!currentInfo.inputs) {
                currentInfo.inputs = []
            }
            currentInfo.inputs.push(newProperty)

            await ipcRenderer.invoke('update-scene-info', {
                scenePath: scene._path,
                updates: currentInfo
            })

            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        } catch (error) {
            console.error('Error adding scene property:', error)
        } finally {
            setSavingScene(false)
        }
    }

    const handleDeleteSceneProperty = async (scene, inputId, inputLabel) => {
        const result = await window.showDialog({
            type: 'warning',
            message: `Are you sure you want to delete the property "${inputLabel}"?`,
            title: 'Delete Property'
        })

        if (!result) return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer || !scene._path) return

        try {
            setSavingScene(true)

            const currentInfo = await ipcRenderer.invoke('read-scene-info', {
                scenePath: scene._path
            })

            // Remove the input from the inputs array
            currentInfo.inputs = currentInfo.inputs.filter(inp => inp.id !== inputId)

            await ipcRenderer.invoke('update-scene-info', {
                scenePath: scene._path,
                updates: currentInfo
            })

            const updatedScenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(updatedScenes)
        } catch (error) {
            console.error('Error deleting scene property:', error)
        } finally {
            setSavingScene(false)
        }
    }

    const handleDeleteScene = async () => {
        if (!selectedSketch || selectedSketch.source === 'defaultScenes') return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) return

        const choice = await ipcRenderer.invoke('show-delete-scene-dialog', { sceneId: selectedSketch.id })

        if (choice === 1) { // Delete
            try {
                await ipcRenderer.invoke('delete-scene', {
                    sourceKey: selectedSketch.source,
                    sceneId: selectedSketch.id
                })
                setSelectedSketch(null)
                // Refresh after delete
                const updatedScenes = await ipcRenderer.invoke('scan-scenes')
                setAvailableScenes(updatedScenes)
            } catch (error) {
                console.error('Error deleting scene:', error)
            }
        }
    }

    const renderSceneDetails = scene => {
        const detailThumbSrc = scene._path ? `scene://${scene._path}/${scene.thumb}` : `./sketches/${scene.id}/${scene.thumb}`
        const sourceInfo = sceneGallerySections.find(section => section.source === scene._source)
        const source = selectedSketch?.source

        return (
            <>
                <div className="scene-title-header">
                    <ImageIcon size={24} weight="duotone" />
                    {source === 'defaultScenes' ? (
                        <h2>{scene.name}</h2>
                    ) : editingTitle ? (
                        <input
                            type="text"
                            className="scene-title-input"
                            defaultValue={scene.name}
                            autoFocus
                            onBlur={(e) => {
                                handleSaveSceneTitle(scene, e.target.value)
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
                            {scene.name}
                            <PencilIcon size={14} weight="regular" />
                        </h2>
                    )}
                </div>
                <IconText as="p" icon={sourceInfo.icon}>{sourceInfo.title}</IconText>
                <img src={detailThumbSrc} alt={scene.name} />

                <div className="scene-actions">
                    {source !== 'openScenes' && (
                        <button className="scene-action-button" onClick={handleAddToProject} title="Add to project">
                            <PlusCircleIcon weight='duotone' size={20} />
                            <span>Add to Project</span>
                        </button>
                    )}
                    {source !== 'defaultScenes' && (
                        <button className="scene-action-button" onClick={handleShowInFinder} title="Show in Finder">
                            <FolderOpenIcon weight='duotone' size={20} />
                            <span>Open Folder</span>
                        </button>
                    )}
                    {source !== 'defaultScenes' && (
                        <button className="scene-action-button" onClick={handleDeleteScene} title="Delete scene">
                            <TrashIcon weight='duotone' size={20} />
                            <span>Delete</span>
                        </button>
                    )}
                </div>

                <div className="properties-header">
                    <IconText as="h3" icon={SlidersHorizontalIcon}>Properties</IconText>
                    {source !== 'defaultScenes' && (
                        <PlusCircleIcon
                            size={20}
                            weight="fill"
                            className="add-property-icon"
                            title="Add new property"
                            onClick={() => handleAddSceneProperty(scene)}
                        />
                    )}
                </div>
                {scene.inputs && scene.inputs.length > 0 ? (
                    <form className="scene-properties-form">
                        {scene.inputs.map((input, idx) => (
                            <div key={input.id} className="scene-property-group">
                                <div className="property-header">
                                    {source === 'defaultScenes' ? (
                                        <h4>{input.label}</h4>
                                    ) : editingPropertyName === input.id ? (
                                        <input
                                            type="text"
                                            className="property-name-input"
                                            defaultValue={input.label}
                                            autoFocus
                                            onBlur={(e) => {
                                                handleSaveSceneProperty(scene, input.id, 'label', e.target.value)
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
                                    {source !== 'defaultScenes' && (
                                        <XCircleIcon
                                            size={16}
                                            weight="fill"
                                            onClick={() => handleDeleteSceneProperty(scene, input.id, input.label)}
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
                                            readOnly={source === 'defaultScenes'}
                                            onBlur={(e) => {
                                                if (source !== 'defaultScenes') {
                                                    handleSaveSceneProperty(scene, input.id, 'id', e.target.value)
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
                                        disabled={source === 'defaultScenes'}
                                        onChange={(e) => {
                                            if (source !== 'defaultScenes') {
                                                handleSaveSceneProperty(scene, input.id, 'type', e.target.value)
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
                                        readOnly={source === 'defaultScenes'}
                                        onBlur={(e) => {
                                            if (source !== 'defaultScenes') {
                                                handleSaveSceneProperty(scene, input.id, 'default', e.target.value)
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
            </>
        )
    }

    const renderSceneItem = (source) => (sketch) => {
        if (sketch.noIndex) return null
        const isSelected = selectedSketch?.id === sketch.id && selectedSketch?.source === source
        const thumbSrc = sketch._path ? `scene://${sketch._path}/${sketch.thumb}` : `./sketches/${sketch.id}/${sketch.thumb}`
        return (
            <li
                key={sketch.id}
                data-sketchid={sketch.id}
                data-source={source}
                className={isSelected ? 'selected' : ''}
                draggable
                onDragStart={event => handleDragStart(source)(event, sketch.id)}
                onDragEnd={handleDragEnd}
            >
                <img src={thumbSrc} alt={sketch.name} />
                <div className='caption'>
                    <p>{sketch.name}</p>
                </div>
            </li>
        )
    }

    const renderSceneGallery = ({ title, icon, source, scenes, addCard, emptyState }) => {
        const isDropTarget = source !== 'defaultScenes'
        return (
            <div key={source}>
                <IconText as="h2" icon={icon}>
                    {title}
                </IconText>
                <ul
                    className={`sketch-gallery${isDropTarget && activeDragTarget === source ? ' is-drop-target' : ''}`}
                    onClick={handleClick}
                    {...(isDropTarget && {
                        onDragOver: handleDragOver(source),
                        onDragEnter: handleDragOver(source),
                        onDragLeave: handleDragLeave(source),
                        onDrop: handleDrop(source)
                    })}
                    id={source === 'openScenes' ? 'project-scenes-gallery' : undefined}
                >

                    <>
                        {source != 'defaultScenes' && (
                            <li className='add-card' onClick={importScene(source)} id={source === 'openScenes' ? 'import-scene-card' : undefined}>
                                <div className='add-thumb'>
                                    <PlusCircleIcon weight="duotone" size={32} />
                                </div>
                                <div className='caption'>
                                    <p>Import sketch</p>
                                </div>
                            </li>
                        )}
                        {scenes.map(renderSceneItem(source))}
                    </>
                </ul>
            </div>
        )
    }

    return (
        <div className='scenePage'>
            {isImporting && (
                <div className="import-overlay">
                    <div className="import-message">
                        <p>Importing sketch...</p>
                        <p className="import-detail">Generating thumbnail and preparing scene</p>
                    </div>
                </div>
            )}
            {showEmptyTooltip && (
                <Tooltip
                    target="project-scenes-gallery"
                    message={
                        <>
                            Import a scene here, or drag and drop scenes from <strong>Preset Scenes</strong> or <strong>User scenes</strong> below
                        </>
                    }
                    onClose={() => {
                        setShowEmptyTooltip(false)
                        sessionStorage.setItem('emptyScenesGuideDismissed', 'true')
                    }}
                />
            )}
            <div id='scene-main'>
                {sceneGallerySections[0] && renderSceneGallery(sceneGallerySections[0])}
                <div className='scene-page-split'>
                    {sceneGallerySections.slice(1).map(renderSceneGallery)}
                </div>
            </div>

            <aside
                className={`scene-detail ${selectedScene ? ' is-active' : ''}`}
                aria-hidden={selectedScene ? 'false' : 'true'}
            >
                {selectedScene && renderSceneDetails(selectedScene)}
            </aside>
        </div>
    )
}