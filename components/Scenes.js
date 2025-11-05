import sketches from '../data/sketches'

export default function Scenes() {
    return (
        <div>
            <h1>Scenes Page</h1>
            <ul className='sketch-list'>
                {sketches.map(sketch => (
                    <li key={sketch.id}>
                        <div className='blob' style={{ backgroundColor: sketch.color }}></div>
                        {sketch.title}
                    </li>
                ))}
            </ul>
        </div>
    )
}