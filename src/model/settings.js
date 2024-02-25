import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"

export default class Settings extends Entity {

    #tempo = T(Number, 120 / 60 / 4) // time per beat
    #tempoDriver = T(String, "bpm")

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get tempo() {
        return this.#tempo 
    }
    
    set tempo(value) {
        this.#tempo = value
    }

    get tempoDriver() {
        return this.#tempoDriver 
    }
    
    set tempoDriver(value) {
        this.#tempoDriver = value
    }
    
}