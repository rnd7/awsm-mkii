import TProperty from "./t-property.js"

export default class TNumber extends TProperty {
    constructor(value) {
        super()
        this.write(Number(value))
    }
}