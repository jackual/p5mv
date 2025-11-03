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
    ArrowLineLeftIcon
} from "@phosphor-icons/react"

const RibbonButton = ({ icon: Icon, label, onClick = () => { } }) => {
    return (
        <div className="ribbon-button" onClick={onClick} title={label}>
            <Icon size={24} weight="light" />
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
            <RibbonButton icon={QuestionIcon} label="Help" />
        </div>
    )
}

export default Ribbon