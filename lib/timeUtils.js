import * as vulgarFractions from 'vulgar-fractions';
const toVulgar = vulgarFractions.toVulgar || vulgarFractions.default?.toVulgar || vulgarFractions;

const beatsToMusicalTimeString = (beats, noteName = false) => {
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
        beatsString = String(Math.floor(beats % 4))
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
        if (beats % 4 > 1) {
            beatsString += 's'
        }
    }
    let result = [barsString, beatsString].filter(Boolean).join(' ') || '0 beats';

    // Append British note name in brackets if requested
    if (noteName) {
        const beatValue = beats % 4; // Get the beat portion
        let britishName = null;

        if (beatValue === 0 && beats === 8) {
            britishName = 'Breve';
        } else if (beatValue === 0 && beats === 4) {
            britishName = 'Semibreve';
        } else if (bars === 0 && beatValue === 2) {
            britishName = 'Minim';
        } else if (bars === 0 && beatValue === 1) {
            britishName = 'Crotchet';
        } else if (bars === 0 && beatValue === 0.5) {
            britishName = 'Quaver';
        } else if (bars === 0 && Math.abs(beatValue - 1 / 3) < 0.001) {
            britishName = 'Quaver Triplet';
        } else if (bars === 0 && beatValue === 0.25) {
            britishName = 'Semiquaver';
        } else if (bars === 0 && beatValue === 0.125) {
            britishName = 'Demisemiquaver';
        }

        if (britishName) {
            result += ` (${britishName})`;
        }
    }

    return result;
};

const beatsToTimecode = (beat, bpm, fps) => {
    const secondsFloat = (60 / bpm) * beat
    const minutes = Math.floor(secondsFloat / 60)
    const seconds = Math.floor(secondsFloat % 60)
    const frames = Math.floor((secondsFloat % 1) * fps)
    return `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
}

const beatsToFrameDuration = (length, bpm, fps) => {
    const secondsFloat = (60 / bpm) * length
    return Math.floor(secondsFloat * fps)
}

const timeReport = (start, duration, bpm, fps) => {
    return `${beatsToMusicalTimeString(duration)} | ${beatsToTimecode(duration, bpm, fps)} | ${beatsToFrameDuration(duration, bpm, fps)}f / ${beatsToMusicalTimeString(start, bpm, fps)} – ${beatsToMusicalTimeString(start + duration, bpm, fps)} | ${beatsToTimecode(start, bpm, fps)} – ${beatsToTimecode(start + duration, bpm, fps)}`
}

export { beatsToMusicalTimeString, beatsToTimecode, beatsToFrameDuration, timeReport }