import {
    ExportIcon,
    RepeatIcon,
    FilmStripIcon,
    XIcon,
    PlayIcon,
    WarningOctagonIcon,
    CircleNotchIcon,
    CircleWavyCheckIcon,
    ListIcon,
    WarningIcon
} from "@phosphor-icons/react";
import IconText from "./IconText";

export default function Render({ project, snap }) {
    project.render.status = "rendering" // idle, rendering, done, error
    let statusIndicator, canStart = false
    switch (project.render.status) {
        case "idle":
            if (project.render.queue.length === 0) {
                statusIndicator = <IconText as="div" icon={WarningIcon}>Idle: Render queue is empty</IconText>
            }
            else {
                statusIndicator = <IconText as="div" icon={ListIcon}>Idle: {snap.render.queue.length} tasks in queue</IconText>
                canStart = true
            }
            break
        case "rendering":
            statusIndicator = <IconText spin as="div" icon={CircleNotchIcon}>Rendering...</IconText>
            break
        case "done":
            statusIndicator = <IconText as="div" icon={CircleWavyCheckIcon}>Render complete!</IconText>
            break
        case "error":
            statusIndicator = <IconText as="div" icon={WarningOctagonIcon}>Render error occurred</IconText>
            canStart = true
            break
    }
    return (
        <div>
            <IconText as="h1" icon={ExportIcon}>Render to video</IconText>
            {statusIndicator}
            <IconText as="button" disabled icon={RepeatIcon} onClick={() => {
            }}>Set task to cycle region</IconText>
            <IconText as="button" disabled icon={FilmStripIcon} onClick={() => {
            }}>Set task to whole project</IconText>
            <IconText as="button" disabled={!snap.render.queue.length} icon={XIcon} onClick={() => {
                project.render.queue = []
            }}>Clear tasks</IconText>
            <IconText as="button" disabled={!canStart} icon={PlayIcon} onClick={() => {
            }}><h3>Render</h3></IconText>
        </div>
    )
}