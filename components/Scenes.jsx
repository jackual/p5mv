import sketches from '../data/sketches'
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
import { useState } from 'react'
import Details from './Details'

export default function Scenes() {
    const [selectedSketch, setSelectedSketch] = useState(null)
    const handleClick = (e) => {
        const li = e.target.closest('li')
        if (li) {
            const sketchId = li.getAttribute('data-sketchid')
            if (sketchId !== selectedSketch) {
                setSelectedSketch(sketchId)
                return
            }
        }
        setSelectedSketch(null)
    }

    const renderSceneDetails = scene => {
        return (
            <>
                <IconText as="h2" icon={ImageIcon}>{scene.title}</IconText>
                <img src={`./sketches/${scene.id}/${scene.thumb}`} alt={scene.title} />
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

    const selectedScene = selectedSketch
        ? sketches.find(s => s.id === selectedSketch)
        : null

    return (
        <div className='scenePage'>
            <div id='scene-main'>
                <IconText as="h2" icon={FileIcon}>
                    Project scenes
                </IconText>
                <ul className='sketch-gallery'>
                    <IconText as="p" icon={FileDashedIcon}>
                        No sketches in this project
                    </IconText>
                </ul>
                <div className='scene-page-split'>
                    <div>
                        <IconText as="h2" icon={FolderIcon}>
                            User scenes
                        </IconText>
                        <ul className='sketch-gallery'>
                            <li className='add-card'>
                                <div className='add-thumb'>
                                    <PlusCircleIcon weight="duotone" size={32} />
                                </div>
                                <div className='caption'>
                                    <p>Add sketch</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <IconText as="h2" icon={SquaresFourIcon}>
                            Preset Scenes
                        </IconText>
                        <ul className='sketch-gallery' onClick={handleClick}>
                            {sketches.map(sketch => {
                                if (sketch.noIndex) return null
                                return (
                                    <li
                                        key={sketch.id}
                                        data-sketchid={sketch.id}
                                        className={selectedSketch === sketch.id ? 'selected' : ''}
                                    >
                                        <img src={`./sketches/${sketch.id}/${sketch.thumb}`} alt={sketch.title} />
                                        <div className='caption'>
                                            <p>{sketch.title}</p>
                                        </div>
                                    </li>
                                )
                            })}
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