import generateId from "../data/generate-id.js"
import {T} from "../glue/t.js"

export default class Entity {
    #id = T(String, generateId())
    constructor(data = {}) {
        Object.assign(this, data)
    }

    get id() {
        return this.#id
    }
    
    set id(value) {
        this.#id = value
    }
}