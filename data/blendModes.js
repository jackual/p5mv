export default {
    "Normal": [
        {
            "name": "Source Over",
            "description": "Default mode. Draws the new shape over the existing content.",
            "value": "source-over"
        },
        {
            "name": "Copy",
            "description": "Replaces everything with the new shape (ignores existing content).",
            "value": "copy"
        },
        {
            "name": "XOR",
            "description": "Keeps only non-overlapping parts of both shapes (overlapping areas are transparent).",
            "value": "xor"
        }
    ],
    "Darken": [
        {
            "name": "Darken",
            "description": "Keeps the darker of the source and destination colours.",
            "value": "darken"
        },
        {
            "name": "Multiply",
            "description": "Multiplies source and destination colours — darkens the image.",
            "value": "multiply"
        },
        {
            "name": "Colour Burn",
            "description": "Darkens the destination to reflect the source (intense shadows).",
            "value": "color-burn"
        }
    ],
    "Lighten": [
        {
            "name": "Lighten",
            "description": "Keeps the lighter of the source and destination colours.",
            "value": "lighten"
        },
        {
            "name": "Screen",
            "description": "Inverse multiply — lightens the image (useful for glows or highlights).",
            "value": "screen"
        },
        {
            "name": "Colour Dodge",
            "description": "Brightens the destination to reflect the source (strong highlight).",
            "value": "color-dodge"
        }
    ],
    "Contrast": [
        {
            "name": "Overlay",
            "description": "Combination of multiply and screen — darkens darks, lightens lights.",
            "value": "overlay"
        },
        {
            "name": "Soft Light",
            "description": "Softens contrast using subtle lightening or darkening.",
            "value": "soft-light"
        },
        {
            "name": "Hard Light",
            "description": "Like overlay, but with source and destination roles reversed.",
            "value": "hard-light"
        }
    ],
    "Comparative": [
        {
            "name": "Difference",
            "description": "Subtracts darker colours from lighter ones — creates inverted or high-contrast effects.",
            "value": "difference"
        },
        {
            "name": "Exclusion",
            "description": "Similar to difference, but with less contrast and softer transitions.",
            "value": "exclusion"
        }
    ],
    "Component": [
        {
            "name": "Hue",
            "description": "Combines the hue of the source with saturation and luminosity of the destination.",
            "value": "hue"
        },
        {
            "name": "Saturation",
            "description": "Uses the saturation of the source with hue and luminosity of the destination.",
            "value": "saturation"
        },
        {
            "name": "Colour",
            "description": "Uses the hue and saturation of the source with luminosity of the destination.",
            "value": "color"
        },
        {
            "name": "Luminosity",
            "description": "Uses the luminosity of the source with hue and saturation of the destination.",
            "value": "luminosity"
        }
    ],
    "Compositing": [
        {
            "name": "Source In",
            "description": "Draws the new shape only where it overlaps existing content. Elsewhere becomes transparent.",
            "value": "source-in"
        },
        {
            "name": "Source Out",
            "description": "Draws the new shape only where it does not overlap existing content.",
            "value": "source-out"
        },
        {
            "name": "Source Atop",
            "description": "Draws the new shape only where it overlaps existing content; keeps destination where it does not overlap.",
            "value": "source-atop"
        },
        {
            "name": "Destination Over",
            "description": "Draws the existing content over the new shape.",
            "value": "destination-over"
        },
        {
            "name": "Destination In",
            "description": "Keeps the existing content only where it overlaps the new shape.",
            "value": "destination-in"
        },
        {
            "name": "Destination Out",
            "description": "Keeps the existing content only where it does not overlap the new shape.",
            "value": "destination-out"
        },
        {
            "name": "Destination Atop",
            "description": "Draws existing content only where it overlaps the new shape.",
            "value": "destination-atop"
        }
    ]
}