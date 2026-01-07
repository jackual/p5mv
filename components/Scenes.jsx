import IconText from './IconText'
import {
    SquaresFourIcon,
    ImageIcon,
    SlidersHorizontalIcon,
    FileIcon,
    FolderIcon,
    FileDashedIcon,
    PlusCircleIcon
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import Details from './Details'

export default function Scenes({ isActive, availableScenes, setAvailableScenes }) {
    const [selectedSketch, setSelectedSketch] = useState(null) // { id, source }
    const [activeDragTarget, setActiveDragTarget] = useState(null) // track which source is being dragged over
    const [draggedSource, setDraggedSource] = useState(null) // track which source is being dragged from
    const [isImporting, setIsImporting] = useState(false) // track import progress

    useEffect(() => {
        if (!isActive) return

        const ipcRenderer = window.require?.('electron')?.ipcRenderer
        if (!ipcRenderer) return

        // Listen for import progress events
        const handleImportProgress = (event, { status, path, error }) => {
            if (status === 'importing') {
                setIsImporting(true)
            } else if (status === 'complete' || status === 'error') {
                setIsImporting(false)
            }
        }

        ipcRenderer.on('scene-import-progress', handleImportProgress)

        return () => {
            ipcRenderer.removeListener('scene-import-progress', handleImportProgress)
        }
    }, [isActive])

    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = async (e) => {
            if (e.key === 'Backspace' && selectedSketch) {
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

    const renderSceneDetails = scene => {
        const detailThumbSrc = scene._path ? `scene://${scene._path}/${scene.thumb}` : `./sketches/${scene.id}/${scene.thumb}`
        return (
            <>
                <IconText as="h2" icon={ImageIcon}>{scene.name}</IconText>
                <img src={detailThumbSrc} alt={scene.name} />
                <Details title="Inputs" icon={SlidersHorizontalIcon}>
                    {scene.inputs ? scene.inputs.map(input => (
                        <div key={input.id} className="input-detail">
                            <p>{input.label}</p> ({input.type})
                        </div>
                    )) : <p>No inputs for this scene.</p>}
                </Details>
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
                >

                    <>
                        {source != 'defaultScenes' && (
                            <li className='add-card' onClick={importScene(source)}>
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