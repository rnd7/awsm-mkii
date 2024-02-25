import Subscription from "./subscription.js"

export default class Signal {
    static DELAY = 0
    static queue = new Set()
    static origin = new WeakMap()
    static timeout

    static subscribe(origin, callback) {
        if (!(callback instanceof Function)) throw new Error("Callback function required")
        if (!Signal.origin.has(origin)) Signal.origin.set(origin, new Set())
        Signal.origin.get(origin).add(callback)
        return new Subscription(origin, callback)
    }

    static unsubscribe(origin, callback) {
        if (Signal.origin.has(origin)) {
            Signal.origin.get(origin).delete(callback)
            if (!Signal.origin.get(origin).size) Signal.origin.delete(origin)
        }
    }

    static flush() {
        for (let signal of Signal.queue) {
            signal.callback(signal)
        }
        Signal.timeout = null
        Signal.queue = new Set()
    }

    static broadcast(origin, signal = {}) {
        if (Signal.origin.has(origin)) {
            for (const callback of Signal.origin.get(origin)) {
                Signal.queue.add(new Signal({
                    path: signal.path,
                    origin,
                    callback,
                    property: signal.property
                }))
            }
            if (!Signal.timeout) Signal.timeout = setTimeout(Signal.flush, Signal.DELAY)
        }
    }
    
    #origin
    #path
    #callback
    #property
    constructor({origin = null, path = [], callback = ()=>{}, property=null} = {}) {
        this.#origin = origin
        this.#path = [...path, {origin, property}]
        this.#property = property
        this.#callback = callback
    }

    get origin() {
        return this.#origin
    }
    get path() {
        return this.#path
    }
    get callback() {
        return this.#callback
    }
    get property() {
        return this.#property
    }
}