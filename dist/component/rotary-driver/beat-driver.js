import beautifyTime from "../../music/beautify-time.js"
import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"
import TimeDriver from "./time-driver.js"

export default class BeatDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "Beat length"
        this.id = "beat"
        this.min = 0.25
        this.step = 0.01
        this.max = 2
        this.center = this.min
        Object.assign(this, opts)
    }

    toLocal(value) {
        return 1/value/4
    }

    fromLocal(value) {
        return 1/(value*4)
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        const unitObject = beautifyTime(limited)
        return {
            value: rounded,
            precision: this.precisionString(local, rounded,.1),
            unit: unitObject.unit,
            valueString: unitObject.value
        }
    }
}