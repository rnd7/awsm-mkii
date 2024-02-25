import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class RangeDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "FM Range"
        this.id = "range"
        this.min = 0
        this.step = 1
        this.max = 48
        this.center = 1
        Object.assign(this, opts)
    }

    toLocal(value) {
        return ((value - 1) * 12) //((value/2) * 12) // from multiplicator base to notes
    }

    fromLocal(value) {
        return (value / 12)+1 // (value / 12) * 2 // from notes to multiplicator base
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        return {
            value: rounded,
            precision: this.precisionString(local, rounded),
            unit: "",
            valueString: rounded
        }
    }
}