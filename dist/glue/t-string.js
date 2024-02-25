import TProperty from "./t-property.js"

export default class TString extends TProperty {
    constructor(value) {
        super()
        this.write(String(value))
    }
}