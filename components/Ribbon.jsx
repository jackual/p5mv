import {
    QuestionIcon,
    SquaresFourIcon,
    FilmStripIcon,
    ExportIcon,
    CodeIcon,
    MagicWandIcon
} from "@phosphor-icons/react"

const RibbonRadio = ({ icon: Icon, page, label, isSelected, onClick }) => {
    return (
        <div className={`ribbon-radio ${isSelected ? 'ribbon-selected' : ''}`} onClick={onClick} id={page + "-radio"}>
            <Icon size={18} weight="light" />
            <span className="ribbon-radio-label">{label}</span>
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