import beautifyFrequency from "../../music/beautify-frequency.js"
import beautifyTime from "../../music/beautify-time.js"
import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class FrequencyDriver extends RotaryDriver{
    constructor(opts) {
        super()
        this.name = "Frequency"
        this.id = "frequency"
        this.min = 1
        this.max = 22000
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        const beautified = beautifyValue(this.max)
        return `${beautified.value}${beautified.unit}`
    }

    get minLabel() {
        return beautifyTime(this.min).value
    }

    toLocal(value) {
        return 1/value
    }

    fromLocal(value) {
        return 1/value
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const unitObject = beautifyFrequency(limited)
        return {
            value: this.round(limited),
            precision: this.precisionString(local, limited),
            unit: unitObject.unit,
            valueString: unitObject.value

        }
    }
}