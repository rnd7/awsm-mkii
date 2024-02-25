import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"

export default class Point extends Entity {
    #x = T(Number, 0)
    #y = T(Number, 0)
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
}