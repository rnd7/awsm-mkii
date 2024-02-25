import ensureType from "./ensure-type.js"
import Signal from "./signal.js"
import TProperty from "./t-property.js"

export default class TInstance extends TProperty {
    #type
    #subscription
    constructor(value, type) {
        super()
        this.#type = type
        this.write(value)
    }

    write(value) {
        value = ensureType(this.#type, value)
        if (this.#subscription) Signal.unsubscribe(this.#subscription.origin, this.#subscription.callback)
        if (value) {
            this.#subscription = Signal.subscribe(value, (signal)=>{
                Signal.broadcast(this, signal)
            })
        }
        return super.write(value)
    }
}