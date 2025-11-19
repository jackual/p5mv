import {
    FilePlusIcon,
    FolderOpenIcon,
    FloppyDiskIcon,
    SelectionAllIcon,
    TrashIcon,
    QuestionIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowLineLeftIcon,
    SquaresFourIcon,
    FilmStripIcon,
    ExportIcon,
    ClipboardTextIcon,
    CopyIcon
} from "@phosphor-icons/react"
import capitalize from "lodash.capitalize"
import { beatsToMusicalTimeString } from '@/lib/timeUtils'

const RibbonButton = ({ icon: Icon, label, onClick = () => { } }) => {
    return (
        <div className="ribbon-button" onClick={onClick} title={label}>
            <Icon size={24} weight="light" />
        </div>
    )
}

const RibbonRadio = ({ icon: Icon, page, isSelected, onClick }) => {
    return (
        <div className={`ribbon-radio ${isSelected ? 'ribbon-selected' : ''}`} onClick={onClick} id={page + "-radio"} title={capitalize(page)}>
            <Icon size={24} weight={isSelected ? "regular" : "light"} />
        </div>
    )
}

const Divider = () => {
    return (
        <div className="ribbon-divider" />
    )
}

const Ribbon = ({ page, setPage, project }) => {
    return (
        <div className="ribbon">
            <img src="/logo.svg" className="ribbon-logo" />
            <Divider />
            <RibbonButton icon={FilePlusIcon} label="New" />
            <RibbonButton icon={FolderOpenIcon} label="Open" />
            <RibbonButton icon={FloppyDiskIcon} label="Save" />
            <Divider />
            <RibbonButton icon={MagnifyingGlassPlusIcon} label="Zoom In" onClick={() => project.zoomIn()} />
            <RibbonButton icon={MagnifyingGlassMinusIcon} label="Zoom Out" onClick={() => project.zoomOut()} />
            <RibbonButton icon={ArrowLineLeftIcon} label="Move to start" onClick={() => project.moveToStart()} />
            <RibbonButton icon={ArrowLeftIcon} label="Left" onClick={() => project.moveLeft()} />
            <RibbonButton icon={ArrowRightIcon} label="Right" onClick={() => project.moveRight()} />
            <Divider />
            <div className="ribbon-snap-control">
                <label htmlFor="ribbon-snap">Snap:</label>
                <select
                    id="ribbon-snap"
                    value={project.snap}
                    onChange={(e) => {
                        project.snap = parseFloat(e.target.value);
                    }}
                >
                    {[4, 1, 0.5, 1 / 3, 0.25, 0.125].map(value => (
                        <option key={value} value={value}>
                            {beatsToMusicalTimeString(value)}
                        </option>
                    ))}
                </select>
            </div>
            <Divider />
            <RibbonButton icon={CopyIcon} label="Copy" onClick={() => project.copy()} />
            <RibbonButton icon={ClipboardTextIcon} label="Paste" onClick={() => project.paste()} />
            <RibbonButton icon={SelectionAllIcon} label="Select All" onClick={() => project.selectAll()} />
            <RibbonButton icon={TrashIcon} label="Delete" />
            <Divider />
            <RibbonRadio icon={FilmStripIcon} page="timeline" isSelected={page === "timeline"} onClick={() => setPage("timeline")} />
            <RibbonRadio icon={SquaresFourIcon} page="scenes" isSelected={page === "scenes"} onClick={() => setPage("scenes")} />
            <RibbonRadio icon={ExportIcon} page="render" isSelected={page === "render"} onClick={() => setPage("render")} />
            <RibbonRadio icon={QuestionIcon} page="help" isSelected={page === "help"} onClick={() => setPage("help")} />
        </div>
    )
}

export default Ribbon