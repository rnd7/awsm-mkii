import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"

export default class KeyboardSettings extends Entity {

    #keys = T(Number, 24)
    #start = T(Number, 1/110)
    #increment = T(Number, 1)
    #subdivisions = T(Number, 12)
    #startDriver = T(String, "note")


    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get keys() {
        return this.#keys 
    }
    
    set keys(value) {
        this.#keys = value
    }

    get start() {
        return this.#start
    }
    
    set start(value) {
        this.#start = value
    }

    get increment() {
        return this.#increment
    }
    
    set increment(value) {
        this.#increment = value
    }

    get subdivisions() {
        return this.#subdivisions
    }
    
    set subdivisions(value) {
        this.#subdivisions = value
    }

    get startDriver() {
        return this.#startDriver 
    }
    
    set startDriver(value) {
        this.#startDriver = value
    }
    
}