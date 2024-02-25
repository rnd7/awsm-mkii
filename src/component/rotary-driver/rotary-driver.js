export default class RotaryDriver {
    min = 0
    max = 1
    center = 0
    step = 0
    name = ""
    id = "default"
    scale = 1

    constructor(opts) {
        Object.assign(this, opts)
    }

    precisionString(value, reference, precision=0.001) {
        if (value < this.min) {
            return "<"
        } else if (value > this.max) {
            return ">"
        } else if (Math.round(value * precision) == Math.round(reference * precision)){
            return ""
        } else {
            return "≈"
        }
    }

    limit(value) {
        return Math.min(this.max, Math.max(this.min, value))
    }

    round(value) {
        if (this.step == 0) return value
        return Math.round(value * 1 / this.step) * this.step
    }

    toLocal(value) {
        return value
    }

    fromLocal(value) {
        return value
    }

    get maxLabel() {
        return this.max
    }

    get minLabel() {
        return this.min
    }

    render(value) {
        const local = this.toLocal(value)
        return {
            value: local,
            precision: "",
            unit: "",
            valueString: local
        }
    }
}