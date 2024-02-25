import {T, O, A} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import randomName from "../utils/random-name.js"
import Entity from "./entity.js"

export default class View extends Entity {

    #name = T(String, randomName())
    #path = A(String, [])
    #navigationCollapsed = false

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get path() {
        return this.#path
    }
    
    set path(value) {
        this.#path = value
    }

    get navigationCollapsed() {
        return this.#navigationCollapsed
    }
    
    set navigationCollapsed(value) {
        this.#navigationCollapsed = value
    }

    get name() {
        return this.#name
    }
    
    set name(value) {
        this.#name = value
    }

    
}