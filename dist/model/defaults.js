import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"
import Voice from "./voice.js"
import WaveSplineOscillator from "./wave-spline-oscillator.js"

export default class Defaults extends Entity {

    #voice = T(Voice, {
        gain: 0.5,
        oscillator: {length: 1/110, lengthDriver: "note", wave:{points:[{x:0, y:0}, {x:.5, y:1}]}}
    })
    #am = T(WaveSplineOscillator, {length: 1/110, lengthDriver: "note", wave:{points:[{x:.5, y:1}]}})
    #fm = T(WaveSplineOscillator, {length: 2, tempoSync: true, lengthDriver: "bar", wave:{points:[{x:.5, y:.5}]}})
    #gain = T(WaveSplineOscillator, {length: 2, tempoSync: true, lengthDriver: "fraction", wave:{points:[{x:.5, y:1}]}})
    #em = T(WaveSplineOscillator, {length: 2, tempoSync: true, lengthDriver: "fraction", wave:{points:[{x:.5, y:1}]}})
    #sx = T(WaveSplineOscillator, {length: 2, tempoSync: true, lengthDriver: "fraction", wave:{points:[{x:.5, y:1}]}})
    #transpose = T(WaveSplineOscillator, {length: 2, tempoSync: true, lengthDriver: "fraction", wave:{points:[{x:.5, y:.5}]}})

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get voice() {
        return this.#voice 
    }
    
    set voice(value) {
        this.#voice = value
    }

    get am() {
        return this.#am
    }
    
    set am(value) {
        this.#am = value
    }

    get fm() {
        return this.#fm
    }
    
    set fm(value) {
        this.#fm = value
    }

    get gain() {
        return this.#gain
    }
    
    set gain(value) {
        this.#gain = value
    }

    get em() {
        return this.#em
    }
    
    set em(value) {
        this.#em = value
    }

    get sx() {
        return this.#sx
    }
    
    set sx(value) {
        this.#sx = value
    }

    get transpose() {
        return this.#transpose
    }
    
    set transpose(value) {
        this.#transpose = value
    }

    
}