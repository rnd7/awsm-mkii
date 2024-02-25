import beautifyTime from "../../music/beautify-time.js"
import RotaryDriver from "./rotary-driver.js"

export default class TimeDriver extends RotaryDriver {
    constructor(opts) { 
        super()
        this.name = "Time"
        this.id = "time"
        this.min = 1/20000
        this.max = 60
        this.step = this.min
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        const beautified = beautifyTime(this.max)
        return `${beautified.value}${beautified.unit}`
    }

    get minLabel() {
        const beautified = beautifyTime(this.min)
        return `${beautified.value*1000}μs`
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        const unitObject = beautifyTime(limited)
        return {
            value: limited,
            precision: this.precisionString(local, rounded,.1),
            unit: unitObject.unit,
            valueString: unitObject.value

        }
    }
}