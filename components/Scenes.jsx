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

    const sceneGallerySections = [
        {
            title: 'Project scenes',
            icon: FileIcon,
            source: 'openScenes',
            scenes: [...availableScenes.openScenes],
            emptyState: 'No sketches in this project',
            dragDrop: true
        },
        {
            title: 'User scenes',
            icon: FolderIcon,
            source: 'userDirectoryScenes',
            scenes: [...availableScenes.userDirectoryScenes],
            addCard: false,
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
                <img src={`${sketch._path}/${sketch.thumb}`} alt={sketch.name} />
                <div className='caption'>
                    <p>{sketch.name}</p>
                </div>
            </li>
        )
    }

    const renderSceneGallery = ({ title, icon, source, scenes, addCard, emptyState, dragDrop }) => (
        <div key={source}>
            <IconText as="h2" icon={icon}>
                {title}
            </IconText>
            <ul
                className={`sketch-gallery${dragDrop && isProjectDragActive ? ' is-drop-target' : ''}`}
                onClick={handleClick}
                {...(dragDrop && {
                    onDragOver: handleProjectDragOver,
                    onDragEnter: handleProjectDragOver,
                    onDragLeave: handleProjectDragLeave,
                    onDrop: handleProjectDrop
                })}
            >
                {emptyState && scenes.length === 0 ? (
                    <li className='empty-state'>
                        <IconText as="p" icon={FileDashedIcon}>
                            {emptyState}
                        </IconText>
                    </li>
                ) : (
                    <>
                        {addCard && (
                            <li className='add-card'>
                                <div className='add-thumb'>
                                    <PlusCircleIcon weight="duotone" size={32} />
                                </div>
                                <div className='caption'>
                                    <p>Add sketch</p>
                                </div>
                            </li>
                        )}
                        {scenes.map(renderSceneItem(source))}
                    </>
                )}
            </ul>
        </div>
    )

    return (
        <div className='scenePage'>
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