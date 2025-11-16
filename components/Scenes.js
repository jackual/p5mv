import sketches from '../data/sketches'
import IconText from './IconText'
import { SquaresFourIcon } from '@phosphor-icons/react'
import { useState } from 'react'

export default function Scenes() {
    const [selectedSketch, setSelectedSketch] = useState(null)

    return (
        <div className='scenePage'>
            <div id='scene-main'>
                <IconText as="h1" icon={SquaresFourIcon}>
                    Scenes Library
                </IconText>
                <ul className='sketch-list'>
                    {sketches.map(sketch => (
                        <li
                            key={sketch.id}
                            onClick={() => setSelectedSketch(sketch.id)}
                            className={selectedSketch === sketch.id ? 'selected' : ''}
                        >
                            <img src={`/sketches/${sketch.id}/${sketch.thumb}`} alt={sketch.title} />
                            <div className='caption'>
                                <div className='blob' style={{ backgroundColor: sketch.color }}></div>
                                <p>{sketch.title}</p>
                            </div>
                        </li>
                    ))}
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