import chroma from 'chroma-js'
import { truncateWithEllipsis } from '../lib/utils.js'

export default {
    number: {
        name: 'Number',
        description: 'Numeric value that can be animated with easing',
        formType: 'number',
        set: (value) => parseFloat(value),
        get: (value) => truncateWithEllipsis(parseFloat(value))
    },

    text: {
        name: 'Text',
        description: 'String value for text input',
        formType: 'text',
        set: (value) => value,
        get: (value) => value,
        disableTween: true
    },

    int: {
        name: 'Integer',
        description: 'Whole number value',
        formType: 'number',
        step: 1,
        set: (value) => parseInt(value),
        get: (value) => parseInt(value).toString()
    },

    float: {
        name: 'Float',
        description: 'Decimal number value',
        formType: 'number',
        set: (value) => parseFloat(value),
        get: (value) => truncateWithEllipsis(parseFloat(value))
    },

    percent: {
        name: 'Percentage',
        description: 'Percentage value (0-100)',
        formType: 'number',
        min: 0,
        max: 100,
        set: (value) => parseFloat(value),
        get: (value) => truncateWithEllipsis(parseFloat(value))
    },

    colour: {
        name: 'Colour',
        description: 'Color value with HSL interpolation',
        formType: 'color',
        set: (value) => {
            const hsl = chroma(value).hsl()
            return [
                isNaN(hsl[0]) ? 0 : hsl[0], // Handle achromatic colors (NaN hue)
                hsl[1],
                hsl[2]
            ]
        },
        get: (value) => chroma.hsl(value[0], value[1], value[2]).hex()
    }
}
