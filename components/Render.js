import { ExportIcon } from "@phosphor-icons/react";
import IconText from "./IconText";

export default function Render() {
    return (
        <div>
            <IconText as="h1" icon={ExportIcon}>Render to video</IconText>
        </div>
    )
}