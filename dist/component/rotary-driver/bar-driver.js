import RotaryDriver from "./rotary-driver.js"

export default class BarDriver extends RotaryDriver {
    tempo = 120 / 60 / 4
    constructor(opts) {
        super()
        this.name = "Bars"
        this.id = "bar"
        this.min = 1
        this.max = 24
        this.step = 1
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        return this.max
    }

    get minLabel() {
        return this.min
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
        const rounded = this.round(limited)
        return {
            value: rounded,
            precision: this.precisionString(local, rounded),
            unit: "",
            valueString: rounded

        }
    }
}