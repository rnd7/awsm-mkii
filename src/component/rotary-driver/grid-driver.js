import beautifyValue from "../../music/beautify-value.js"
import RotaryDriver from "./rotary-driver.js"

export default class GridDriver extends RotaryDriver {
    constructor(opts) {
        super()
        this.name = "Grid"
        this.id = "grid"
        this.min = 1
        this.step = 1
        this.max = 25
        this.center = this.min
        Object.assign(this, opts)
    }

    get maxLabel() {
        return "∞"
    }

    toLocal(value) {
        return value
    }

    fromLocal(value) {
        return value >= this.max ? Number.MAX_SAFE_INTEGER : value
    }

    render(value) {
        const local = this.toLocal(value)
        const limited = this.limit(local)
        const rounded = this.round(limited)
        return {
            value: rounded,
            precision: (rounded<=this.max-1)?this.precisionString(local, rounded):"",
            unit: "",
            valueString: (rounded>=this.max)?"∞":rounded
        }
    }
}