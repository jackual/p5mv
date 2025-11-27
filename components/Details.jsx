import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import IconText from "./IconText";

export default function Details({ icon, title, children, open = false, fill = false }) {
    return (
        <details key={title} open={open}>
            <summary>
                <IconText iconProps={{ weight: fill ? "fill" : "bold" }} icon={icon} as='p'>{title}</IconText>
                <span className="caret">
                    <CaretRightIcon />
                    <CaretDownIcon />
                </span>
            </summary>
            <div className="details-content">
                {children}
            </div>
        </details >
    );
}