import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class BPMDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "BPM"
        this.id = "bpm"
        this.min = 1
        this.step = 1
        this.max = 240
        this.center = this.min
        Object.assign(this, opts)
    }

    toLocal(value) {
        return value * 60 * 4 // length of one beat to bpm
    }

    fromLocal(value) {
        return value / 60 / 4 // bpm to length of one beat
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        return {
            value: rounded,
            precision: this.precisionString(local, rounded),
            unit: "bpm",
            valueString: beautifyValue(rounded).value
        }
    }
}