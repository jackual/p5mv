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
    FilmSlateIcon,
    ExportIcon
} from "@phosphor-icons/react"

const RibbonButton = ({ icon: Icon, label, onClick = () => { } }) => {
    return (
        <div className="ribbon-button" onClick={onClick} title={label}>
            <Icon size={24} weight="light" />
        </div>
    )
}

const RibbonRadio = ({ icon: Icon, page, isSelected }) => {
    return (
        <div className={`ribbon-radio ${isSelected ? 'ribbon-selected' : ''}`} onClick={() => {

        }}>
            <Icon size={24} weight={isSelected ? "regular" : "light"} />
        </div>
    )
}

const Divider = () => {
    return (
        <div className="ribbon-divider" />
    )
}

const Ribbon = ({ project }) => {
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
            <RibbonButton icon={SelectionAllIcon} label="Select All" onClick={() => project.selectAll()} />
            <RibbonButton icon={TrashIcon} label="Delete" />
            <Divider />
            <RibbonRadio icon={FilmSlateIcon} page="timeline" isSelected={true} />
            <RibbonRadio icon={SquaresFourIcon} page="scenes" />
            <RibbonRadio icon={ExportIcon} page="render" />
            <RibbonRadio icon={QuestionIcon} page="help" />
        </div>
    )
}

export default Ribbon