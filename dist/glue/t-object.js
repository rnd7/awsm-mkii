import ensureType from "./ensure-type.js"
import Signal from "./signal.js"
import TProperty from "./t-property.js"

export default class TObject extends TProperty {
    #type = String
    #subscriptions = new Map()
    constructor(value, type) {
        super()
        this.#type = type
        this.write(value)
    }

    #updateSubscriptions() {
        const active = new Set()
        for (let key in this.value) {
            active.add(key)
            let item = this.value[key]
            if (!this.#subscriptions.has(key)) {
                if (typeof item === "object") {
                    const subscription = Signal.subscribe(item, (signal)=>{
                        Signal.broadcast(this, signal)
                    })
                    this.#subscriptions.set(key, subscription)
                }
            }
        }
        for (const [key, value] of this.#subscriptions.entries()) {
            if (!active.has(key)) {
                Signal.unsubscribe(value.origin, value.callback)
                this.#subscriptions.delete(key)
            }
        }
    }

    write(value) {
        const map = value || {}
        const type = this.#type
        for (let [key, item] of Object.entries(value)) {
            value[key] = ensureType(this.#type, item)
        }

        const updateSubscriptions = this.#updateSubscriptions.bind(this)
        const self = this

        const proxy = new Proxy(map, {
            set: function(target, property, value) {
                target[property] = ensureType(type, value)
                Signal.broadcast(self)
                updateSubscriptions()
                return true
            },
            deleteProperty: function(target, property) {
                delete target[property]
                Signal.broadcast(self)
                updateSubscriptions()
                return true
            }
        })
        return super.write(proxy)
    }
}