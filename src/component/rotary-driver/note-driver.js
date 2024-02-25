import { PIANO_KEYS, getNote, getNoteByIndex } from "../../music/notes.js"
import RotaryDriver from "./rotary-driver.js"

export default class NoteDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "Note"
        this.id = "note"
        this.min = 0
        this.max = PIANO_KEYS.length-1
        this.center = this.min
        this.step = 1
        Object.assign(this, opts)
    }

    get maxLabel() {
        return `${PIANO_KEYS[this.max].name}${PIANO_KEYS[this.max].octave}`
    }

    get minLabel() {
        return `${PIANO_KEYS[this.min].name}${PIANO_KEYS[this.min].octave}`
    }

    toLocal(value) {
        return getNote(1/value).index
    }

    fromLocal(value) {
        return 1/getNoteByIndex(Math.round(value)).match
    }

    render(value) {
        const local = this.toLocal(value)
        const note = getNote(1/value)
        return {
            value: local,
            precision: note.precision === "=" ? "" : note.precision,
            unit: "",
            valueString: `${note.name.toUpperCase()}${note.octave}`

        }
    }
}
