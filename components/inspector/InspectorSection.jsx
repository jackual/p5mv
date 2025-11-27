import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import IconText from "../IconText";

export default function InspectorSection({ icon, title, children, open = false }) {
    return (
        <details key={title} open={open}>
            <summary>
                <IconText iconProps={{ weight: "bold" }} icon={icon} as='p'>{title}</IconText>
                <span className="caret">
                    <CaretRightIcon />
                    <CaretDownIcon />
                </span>
            </summary>
            <div className="inspector-section-content">
                {children}
            </div>
        </details >
    );
}