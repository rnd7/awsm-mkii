import { fromFraction } from "../../math/from-fraction.js"
import toFraction from "../../math/to-fraction.js"
import RotaryDriver from "./rotary-driver.js"

export default class FractionDriver extends RotaryDriver{
    tempo = 120 / 60 / 4 // length of one beat
    constructor(opts) {
        super()
        this.name = "Fraction"
        this.id = "fraction"
        this.min = 1 / 64
        this.max = 1
        this.step = this.min
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        return toFraction(this.max)
    }

    get minLabel() {
        return toFraction(this.min)
    }

    toLocal(value) {
        return value * this.tempo
    }

    fromLocal(value) {
        return value / this.tempo
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        //const rounded = this.round(limited)
        const fractionStr = toFraction(limited)
        const fractionVal = fromFraction(fractionStr)
        return {
            value: fractionVal,
            precision: this.precisionString(local, fractionVal),
            unit: "",
            valueString: fractionStr
        }
    }
}