import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class ExponentDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "Exponent"
        this.id = "exponent"
        this.min = .5
        this.step = .01
        this.max = 1000
        this.scale = .2
        this.center = 1
        Object.assign(this, opts)
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        return {
            value: rounded,
            precision: this.precisionString(local, rounded),
            unit: "",
            valueString: beautifyValue(rounded).value
        }
    }
}