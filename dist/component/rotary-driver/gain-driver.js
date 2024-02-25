import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class GainDriver extends RotaryDriver {
    constructor(opts) { 
        super()
        this.name = "Gain"
        this.id = "gain"
        this.min = 0
        this.max = 1
        this.step = this.min
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        return beautifyValue(this.max).value
    }

    get minLabel() {
        return beautifyValue(this.min).value
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        const unitObject = beautifyValue(limited)
        return {
            value: limited,
            precision: this.precisionString(local, rounded,.1),
            unit: unitObject.unit,
            valueString: unitObject.value

        }
    }
}