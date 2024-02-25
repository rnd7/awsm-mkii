import ensureType from "./ensure-type.js"
import ensureTypes from "./ensure-types.js"
import Signal from "./signal.js"
import TProperty from "./t-property.js"

export default class TArray extends TProperty {
    static MUTABLE = ["shift", "pop", "reverse", "sort", "copyWithin"]
    #subscriptions = new Map()
    #type
    constructor(value, type) {
        super()
        this.#type = type
        this.write(value)
    }

    #updateSubscriptions() {
        const active = new Set()
        for (let i = 0; i < this.value.length; i++) {
            active.add(this.value[i])
            if (!this.#subscriptions.has(this.value[i])) {
                if (typeof this.value[i] === "object") {
                    const subscription = Signal.subscribe(this.value[i], (signal)=>{
                        Signal.broadcast(this, signal)
                    })
                    this.#subscriptions.set(this.value[i], subscription)
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
        const type = this.#type
        const updateSubscriptions = this.#updateSubscriptions.bind(this)
        if (Array.isArray(value)) value = ensureTypes(type, value)
        const reference = value
        // proxy mutable methods
        {
            const method = reference.push
            value.push = (...elements) => {
                const result = method.apply(
                    reference, 
                    ensureTypes(type, elements)
                )
                Signal.broadcast(this)
                updateSubscriptions()
                return result
            }
        }
        {
            const method = reference.unshift
            value.unshift = (...elements) => {
                const result = method.apply(
                    reference, 
                    ensureTypes(type, elements)
                )
                updateSubscriptions()
                return result
            }
        }
        {
            const method = reference.splice
            value.splice = (start, deleteCount, ...elements) => {
                const result = method.call(
                    reference, 
                    start,
                    deleteCount,
                    ...ensureTypes(type, elements)
                )
                Signal.broadcast(this)
                updateSubscriptions()
                return result
            }
        }
        {
            const method = reference.fill
            value.fill = (element, start, end) => {
                const result = method.call(
                    reference, 
                    ensureType(element),
                    start,
                    end
                )
                Signal.broadcast(this)
                updateSubscriptions()
                return result
            }
        }
        TArray.MUTABLE.forEach((name)=>{
            const method = value[name]
            reference[name] = (...args) => {
                const result = method.call(reference, ...args)
                Signal.broadcast(this)
                updateSubscriptions()
                return result
            }
        })
        const self = this

        // add dynamic numerical property proxy
        value = new Proxy(value, {
            set: function(target, property, value) {
              if (property === 'length' || isNaN(property)) {
                target[property] = value;
              } else {
                target[property] = ensureType(type, value)
                Signal.broadcast(self)
                updateSubscriptions()
              }
              return true
            },
            deleteProperty: function(target, property) {
              delete target[property];
              Signal.broadcast(self)
              updateSubscriptions()
              return true
            }
        })
        const returnValue = super.write(value)
        updateSubscriptions()
        return returnValue
    }
}