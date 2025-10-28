import { toVulgar } from 'vulgar-fractions';

export const beatsToMusicalTimeString = beats => {
    let beatsString = '';
    if (beats % 4 !== 0) {
        beatsString = toVulgar(beats % 4) + ' beats'
    }
    return `${Math.floor(beats / 4) + 1} bars ${beatsString}`;
};