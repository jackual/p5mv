import sketches from '../data/sketches'
import IconText from './IconText'
import {
    SquaresFourIcon,
    ImageIcon,
    SlidersHorizontalIcon
} from '@phosphor-icons/react'
import { useState } from 'react'

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

    const noScene = () => {
        return (
            <aside className='no-scene'>
                <div className='big-icon'><ImageIcon /></div>
                <h2>No scene selected</h2>
            </aside>
        )
    }

    const sceneAside = scene => {
        return (
            <aside>
                <IconText as="h2" icon={ImageIcon}>{scene.title}</IconText>
                <img src={`/sketches/${scene.id}/${scene.thumb}`} alt={scene.title} />
            </aside>
        )
    }

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
                                <img src={`/sketches/${sketch.id}/${sketch.thumb}`} alt={sketch.title} />
                                <div className='caption'>
                                    <div className='blob' style={{ backgroundColor: sketch.color }}></div>
                                    <p>{sketch.title}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <aside>
                {selectedSketch
                    ? <p>Selected scene: {sketches.find(s => s.id === selectedSketch)?.title}</p>
                    : <p>Select a scene</p>}
            </aside>
        </div>
    )
}