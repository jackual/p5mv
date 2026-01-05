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

export default function Scenes({ isActive }) {
    const [selectedSketch, setSelectedSketch] = useState(null) // { id, source }
    const [isProjectDragActive, setIsProjectDragActive] = useState(false)
    const [availableScenes, setAvailableScenes] = useState({
        defaultScenes: [],
        openScenes: [],
        userDirectoryScenes: []
    })

    useEffect(() => {
        if (!isActive) return

        const loadScenes = async () => {
            const ipcRenderer = window.require?.('electron')?.ipcRenderer
            if (!ipcRenderer) {
                console.error('ipcRenderer not available')
                return
            }
            const scenes = await ipcRenderer.invoke('scan-scenes')
            setAvailableScenes(scenes)
        }
        loadScenes()
    }, [isActive])

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

    const allPresetScenes = [...availableScenes.defaultScenes]
    const allUserScenes = [...availableScenes.userDirectoryScenes]
    const allProjectScenes = [...availableScenes.openScenes]

    const selectedScene = selectedSketch
        ? (() => {
            const sourceMap = {
                'defaultScenes': allPresetScenes,
                'userDirectoryScenes': allUserScenes,
                'openScenes': allProjectScenes
            }
            return sourceMap[selectedSketch.source]?.find(s => s.id === selectedSketch.id)
        })()
        : null

    const handleDragStart = (event, sketchId) => {
        if (!sketchId) return
        event.dataTransfer.setData('text/plain', sketchId)
        event.dataTransfer.effectAllowed = 'copy'
    }

    const handleDragEnd = () => {
        setIsProjectDragActive(false)
    }

    const handleProjectDragOver = event => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
        if (!isProjectDragActive) {
            setIsProjectDragActive(true)
        }
    }

    const handleProjectDragLeave = event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsProjectDragActive(false)
        }
    }

    const handleProjectDrop = event => {
        event.preventDefault()
        const sketchId = event.dataTransfer.getData('text/plain')
        console.log('Origin node:', event.target.closest('ul'))
        console.log('Target node:', event.currentTarget)
        console.log('Sketch ID:', sketchId)
        setIsProjectDragActive(false)
        if (sketchId) {
            console.log(`Sketch ${sketchId} dropped into Project scenes`)
        }
    }

    const renderSceneDetails = scene => {
        return (
            <>
                <IconText as="h2" icon={ImageIcon}>{scene.name}</IconText>
                <img src={`./sketches/${scene.id}/${scene.thumb}`} alt={scene.name} />
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
        return (
            <li
                key={sketch.id}
                data-sketchid={sketch.id}
                data-source={source}
                className={isSelected ? 'selected' : ''}
                draggable
                onDragStart={event => handleDragStart(event, sketch.id)}
                onDragEnd={handleDragEnd}
            >
                <img src={`./sketches/${sketch.id}/${sketch.thumb}`} alt={sketch.name} />
                <div className='caption'>
                    <p>{sketch.name}</p>
                </div>
            </li>
        )
    }

    return (
        <div className='scenePage'>
            <div id='scene-main'>
                <IconText as="h2" icon={FileIcon}>
                    Project scenes
                </IconText>
                <ul
                    className={`sketch-gallery${isProjectDragActive ? ' is-drop-target' : ''}`}
                    onDragOver={handleProjectDragOver}
                    onDragEnter={handleProjectDragOver}
                    onDragLeave={handleProjectDragLeave}
                    onDrop={handleProjectDrop}
                    onClick={handleClick}
                >
                    {allProjectScenes.length === 0 ? (
                        <li className='empty-state'>
                            <IconText as="p" icon={FileDashedIcon}>
                                No sketches in this project
                            </IconText>
                        </li>
                    ) : (
                        allProjectScenes.map(renderSceneItem('openScenes'))
                    )}
                </ul>
                <div className='scene-page-split'>
                    <div>
                        <IconText as="h2" icon={FolderIcon}>
                            User scenes
                        </IconText>
                        <ul className='sketch-gallery' onClick={handleClick}>
                            <li className='add-card'>
                                <div className='add-thumb'>
                                    <PlusCircleIcon weight="duotone" size={32} />
                                </div>
                                <div className='caption'>
                                    <p>Add sketch</p>
                                </div>
                            </li>
                            {allUserScenes.map(renderSceneItem('userDirectoryScenes'))}
                        </ul>
                    </div>
                    <div>
                        <IconText as="h2" icon={SquaresFourIcon}>
                            Preset Scenes
                        </IconText>
                        <ul className='sketch-gallery' onClick={handleClick}>
                            {allPresetScenes.map(renderSceneItem('defaultScenes'))}
                        </ul>
                    </div>
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