import {T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"
import WaveSpline from "./wave-spline.js"

export default class WaveSplineOscillator extends Entity {
    #length = T(Number, 1)
    #lengthDriver = T(String, "frequency")
    #tempoSync = T(Boolean, false)
    #wave = T(WaveSpline, {})
    #phase = T(Number,0)
    #phaseShift = T(Number, 0)
    #fm = T(WaveSplineOscillator)
    #fmRange = T(Number, 2)
    #am = T(WaveSplineOscillator)
    #em = T(WaveSplineOscillator)
    #sx = T(WaveSplineOscillator)
    #sy = T(WaveSplineOscillator)
    #gain = T(WaveSplineOscillator)
    #transpose = T(WaveSplineOscillator)
    
    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get length() {
        return this.#length
    }
    
    set length(value) {
        this.#length = value
    }

    get tempoSync() {
        return this.#tempoSync
    }
    
    set tempoSync(value) {
        this.#tempoSync = value
    }
    
    get wave() {
        return this.#wave
    }
    
    set wave(value) {
        this.#wave = value
    }

    get fm() {
        return this.#fm
    }
    
    set fm(value) {
        this.#fm = value
    }

    get fmRange() {
        return this.#fmRange
    }
    
    set fmRange(value) {
        this.#fmRange = value
    }

    get transpose() {
        return this.#transpose
    }
    
    set transpose(value) {
        this.#transpose = value
    }
    
    get am() {
        return this.#am
    }
    
    set am(value) {
        this.#am = value
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

    get sy() {
        return this.#sy
    }
    
    set sy(value) {
        this.#sy = value
    }

    get gain() {
        return this.#gain
    }
    
    set gain(value) {
        this.#gain = value
    }

    get phase() {
        return this.#phase
    }
    
    set phase(value) {
        this.#phase = value
    }

    get phaseShift() {
        return this.#phaseShift
    }
    
    set phaseShift(value) {
        this.#phaseShift = value
    }

    get lengthDriver() {
        return this.#lengthDriver
    }
    
    set lengthDriver(value) {
        this.#lengthDriver = value
    }

}