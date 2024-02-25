
export class Note {
    static LT = '<'
    static GT = '>'
    static CLOSE = '≈'
    static EQ = '='
    static NONE = '!'
 
    frequency
    precision
    match
    name
    octave
    color
    index
    
    constructor({frequency = null, match = null, name = "", octave = null, color = null, precision=Note.NONE, index = 0} = {}) {
        this.frequency = frequency
        this.precision = precision
        this.match = match
        this.name = name
        this.octave = octave
        this.color = color
        this.index = index
    }
}

export const ALTERNATIVE_NOTE_NAMES = (() => {
    const greekAlphabet = 'αβγδεζηθικλμνξοπρςτυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'.split('')
    return [...greekAlphabet, ...greekAlphabet.map((value) => `${value}'`)]
})()

export const PIANO_KEYS = (() => {
    const from = 440
    const min = -4
    const zeroOctave = -5
    const max = 5
    const names = ["a", "a#", "b", "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#"]
    const colors = [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1]
    const octaveOffset = 9
    let arr = []
    let index = 0
    for (let octave = min; octave < max; octave++) {
        let base = from * Math.pow(2, octave)
        for (let note = 0; note < 12; note++) {
            arr.push(new Note({
                match: base * Math.pow(2, note / 12),
                name: names[note],
                octave: Math.round(((octave - zeroOctave) * 12 + note - octaveOffset) / 12),
                color: colors[note],
                index
            }))
            index++
        }
    }
    return arr
})()

export const OCTAVES = (() => {
    const octaves = []
    let last = null
    PIANO_KEYS.forEach(key => {
        if (key.octave !== last) {
            octaves.push(key)
            last = key.octave
        }
    })
    return octaves
})()

export const FREQUENCY_MAP = (() => {
    const map = new Map()
    PIANO_KEYS.forEach(key => {
        map.set(Math.round(key.match * 100) / 100, key)
    })
    return map
})()

export function getOctave(frequency) {
    if (frequency < OCTAVES[0].frequency) return null
    for (let i = 0; i < OCTAVES.length; i++) {
        if (frequency <= OCTAVES[i].frequency) return OCTAVES[i].octave - 1
    }
    return null
}

export function findClosestNote(frequency) {
    let previousDelta = Number.MAX_SAFE_INTEGER
    let previous
    for (let i=0; i<PIANO_KEYS.length; i++) {
        const key = PIANO_KEYS[i]
        const delta = Math.abs(key.match - frequency)
        if (key.match > frequency) {
            if (delta < previousDelta) return key
            return previous
        }
        previousDelta = delta
        previous = key
    }
    return previous
}

export function getNoteByIndex(index) {
    return new Note(PIANO_KEYS[index])
}

export function getNote(frequency) {
    const closest = new Note(findClosestNote(frequency))
    closest.frequency = frequency
    if (Math.abs(closest.match - frequency) < .001) {
        closest.precision = Note.EQ
    } else if (Math.abs(closest.match - frequency) < .5) {
        closest.precision = Note.CLOSE
    } else if (frequency > closest.match) {
        closest.precision = Note.GT
    } else if (frequency < closest.match) {
        closest.precision = Note.LT
    }
    return closest
}
