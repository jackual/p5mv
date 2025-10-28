import { toVulgar } from 'vulgar-fractions';

export const beatsToMusicalTimeString = beats => {
    const bars = Math.floor(beats / 4)
    let barsString = ''
    if (bars !== 0) {
        barsString = `${bars} bar`
        if (bars !== 1) {
            barsString += 's'
        }
    }
    let beatsString = '';
    if (beats % 4 !== 0) {
        beatsString = toVulgar(beats % 4) + ' beat'
        if (beats % 4 !== 1) {
            beatsString += 's'
        }
    }
    return [barsString, beatsString].filter(Boolean).join(' ');
};