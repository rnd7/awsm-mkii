import {A, T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import randomName from "../utils/random-name.js"
import Entity from "./entity.js"
import WaveSplineOscillator from "./wave-spline-oscillator.js"

export default class Voice extends Entity {
    static IDLE = "idle"
    static TRIGGER_ATTACK = "trigger-attack"
    static ATTACK = "attack"
    static SUSTAIN = "sustain"
    static TRIGGER_RELEASE = "trigger-release"
    static RELEASE = "release"
    static TRIGGER_DELETE = "trigger-delete"
    static DELETE_RELEASE = "delete-release"
    static DELETE = "delete"

    #oscillator = T(WaveSplineOscillator, {})

    #on = T(Number, 0)
    #off = T(Number, Number.MAX_SAFE_INTEGER)

    #gain = T(Number, 1)

    #attack = T(Number, 1)
    #release = T(Number, 1)
    #path = A(String, [])

    #name = T(String, randomName())

    #bus = T(String, "main")

    #state = T(String, Voice.IDLE)

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get oscillator() {
        return this.#oscillator
    }
    
    set oscillator(value) {
        this.#oscillator  = value
    }
    
    get name() {
        return this.#name
    }
    
    set name(value) {
        this.#name = value
    }

    get gain() {
        return this.#gain
    }
    
    set gain(value) {
        this.#gain = value
    }
    
    get state() {
        return this.#state
    }
    
    set state(value) {
        this.#state = value
    }
    
    get on() {
        return this.#on
    }
    
    set on(value) {
        this.#on = value
    }
    
    get off() {
        return this.#off
    }
    
    set off(value) {
        this.#off = value
    }

    get attack() {
        return this.#attack
    }
    
    set attack(value) {
        this.#attack = value
    }

    get release() {
        return this.#release
    }
    
    set release(value) {
        this.#release = value
    }

    get path() {
        return this.#path
    }
    
    set path(value) {
        this.#path = value
    }

    get bus() {
        return this.#bus
    }
    
    set bus(value) {
        this.#bus = value
    }
}