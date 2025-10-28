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
    if (Math.floor(beats % 4) !== 0) {
        beatsString = Math.floor(toVulgar(beats % 4))
    }
    if (beats % 1) {
        let fraction
        switch (String(beats % 1).slice(0, 6)) {
            case '0.3333':
                fraction = 1 / 3
                break
            case '0.6666':
                fraction = 2 / 3
                break
            default:
                fraction = beats % 1
        }
        beatsString += toVulgar(fraction)
    }
    if (beats % 4 !== 0) {
        beatsString += ' beat'
        if (beats % 4 !== 1) {
            beatsString += 's'
        }
    }
    return [barsString, beatsString].filter(Boolean).join(' ');

};