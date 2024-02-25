import TProperty from "./t-property.js"

export default class TBoolean extends TProperty {
    constructor(value) {
        super()
        this.write(!!value)
    }
}