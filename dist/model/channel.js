import {A, T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import randomName from "../utils/random-name.js"
import AudioMetrics from "./audio-metrics.js"
import Dynamics from "./dynamics.js"
import Entity from "./entity.js"
import Voice from "./voice.js"

export default class Channel extends Entity {
    static ACTIVE = "active"
    static TRIGGER_RELEASE = "trigger-release"
    static RELEASE = "release"
    static DELETE = "delete"
    #voices = A(Voice, [])
    #gain = T(Number, 1.)
    #activeVoice = T(String, "")
    #name = T(String, randomName())
    #state = T(String, Channel.ACTIVE)
    #release = T(Number, .1)
    #dynamics = T(Dynamics, {})
    #audioMetrics = new AudioMetrics()

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get name() {
        return this.#name
    }
    
    set name(value) {
        this.#name = value
    }

    get state() {
        return this.#state
    }
    
    set state(value) {
        this.#state = value
    }

    get release() {
        return this.#release
    }
    
    set release(value) {
        this.#release = value
    }

    get voices() {
        return this.#voices
    }
    
    set voices(value) {
        this.#voices = value
    }

    get gain() {
        return this.#gain
    }
    
    set gain(value) {
        this.#gain = value
    }

    get activeVoice() {
        return this.#activeVoice
    }
    
    set activeVoice(value) {
        this.#activeVoice = value
    }

    get dynamics() {
        return this.#dynamics
    }
    
    set dynamics(value) {
        this.#dynamics = value
    }

    get audioMetrics() {
        return this.#audioMetrics
    }

    findActiveVoice() {
        return this.findVoice(this.activeVoice)
    }

    findVoice(id) {
        return this.voices.find(voice => voice.id === id)
    }
    
}