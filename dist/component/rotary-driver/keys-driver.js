import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class KeysDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "Keys"
        this.id = "keys"
        this.min = 1
        this.step = 1
        this.max = 48
        this.center = this.min
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
            valueString: rounded
        }
    }
}