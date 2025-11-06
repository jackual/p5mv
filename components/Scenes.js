import sketches from '../data/sketches'
import IconText from './IconText'
import { SquaresFourIcon } from '@phosphor-icons/react'

export default function Scenes() {
    return (
        <div className='scenePage'>
            <div>
                <IconText as="h1" icon={SquaresFourIcon}>
                    Scenes Library
                </IconText>
                <ul className='sketch-list'>
                    {sketches.map(sketch => (
                        <li key={sketch.id}>
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
                <p>Select a scene</p>
            </aside>
        </div>
    )
}