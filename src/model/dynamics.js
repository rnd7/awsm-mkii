import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"

export default class Dynamics extends Entity {

    #threshold = T(Number, .5)
    #scale = T(Number, 1)
    #potential = T(Number, 0)

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get threshold() {
        return this.#threshold 
    }
    
    set threshold(value) {
        this.#threshold = value
    }

    get scale() {
        return this.#scale
    }
    
    set scale(value) {
        this.#scale = value
    }

    get potential() {
        return this.#potential
    }
    
    set potential(value) {
        this.#potential = value
    }
}