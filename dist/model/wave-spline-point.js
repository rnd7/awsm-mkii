import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"

export default class WaveSplinePoint extends Entity {
    #x = T(Number, 0)
    #y = T(Number, 0)
    #e = T(Number, 1)
    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get x() {
        return this.#x
    }
    
    set x(value) {
        this.#x = value
    }

    get y() {
        return this.#y
    }
    
    set y(value) {
        this.#y = value
    }

    get e() {
        return this.#e
    }
    
    set e(value) {
        this.#e = value
    }
}