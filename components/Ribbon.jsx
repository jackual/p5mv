import {
    QuestionIcon,
    SquaresFourIcon,
    FilmStripIcon,
    ExportIcon,
    CodeIcon,
    MagicWandIcon
} from "@phosphor-icons/react"
import capitalize from "lodash.capitalize"
import { beatsToMusicalTimeString } from '@/lib/timeUtils'
import Project from "@/lib/classes/Project"

const RibbonButton = ({ icon: Icon, label, onClick = () => { } }) => {
    return (
        <div className="ribbon-button" onClick={onClick} title={label}>
            <Icon size={20} weight="light" />
        </div>
    )
}

const RibbonRadio = ({ icon: Icon, page, label, isSelected, onClick }) => {
    return (
        <div className={`ribbon-radio ${isSelected ? 'ribbon-selected' : ''}`} onClick={onClick} id={page + "-radio"} title={label || capitalize(page)}>
            <Icon size={18} weight="light" />
            <span className="ribbon-radio-label">{label || capitalize(page)}</span>
        </div>
    )
}

const Divider = () => {
    return (
        <div className="ribbon-divider" />
    )
}

const Ribbon = ({ page, setPage, project, projectFileMethods, onShowMetadataWizard }) => {
    return (
        <div className="ribbon">
            <img src="./logo.svg" className="ribbon-logo" />
            <Divider />
            <RibbonRadio icon={FilmStripIcon} page="timeline" label="Timeline" isSelected={page === "timeline"} onClick={() => setPage("timeline")} />
            <RibbonRadio icon={SquaresFourIcon} page="scenes" label="Scenes" isSelected={page === "scenes"} onClick={() => setPage("scenes")} />
            <RibbonRadio icon={CodeIcon} page="editor" label="Editor" isSelected={page === "editor"} onClick={() => setPage("editor")} />
            <RibbonRadio icon={ExportIcon} page="render" label="Render" isSelected={page === "render"} onClick={() => setPage("render")} />
            <RibbonRadio icon={QuestionIcon} page="help" label="Help" isSelected={page === "help"} onClick={() => setPage("help")} />
            <Divider />
            {page === "timeline" && (
                <>
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
                </>
            )}
            {page === "editor" && (
                <>
                    <div className="ribbon-button ribbon-button-labeled" onClick={onShowMetadataWizard} title="Metadata Wizard">
                        <MagicWandIcon size={20} weight="light" />
                        <span className="ribbon-button-label">Metadata Wizard</span>
                    </div>
                    <Divider />
                    <div className="ribbon-message">
                        Download sketch to add to your project
                    </div>
                </>
            )}
        </div>
    )
}

export default Ribbon