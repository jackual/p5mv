import sketches from '../data/sketches'
import IconText from './IconText'
import {
    SquaresFourIcon,
    ImageIcon,
    SlidersHorizontalIcon
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
                <IconText as="h1" icon={SquaresFourIcon}>
                    Scenes Library
                </IconText>
                <ul className='sketch-list' onClick={handleClick}>
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
                                    <div className='blob' style={{ backgroundColor: sketch.color }}></div>
                                    <p>{sketch.title}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
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