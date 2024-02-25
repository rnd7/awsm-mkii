/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/math/interpolate-linear.js
function interpolateLinear(a, b, q) {
    return  a + (b - a) * q;
}
;// CONCATENATED MODULE: ./src/math/normalize.js
function normalize(value, {min = 0, max = 1} = {}) {
    return value * (max-min) + min
}
;// CONCATENATED MODULE: ./src/math/calculate-q.js
function calcQ(a, b, x) {
    const dx = (1 + (b - a)) % 1
    const xn = ((1 + (x - a)) % 1) / dx
    return xn
}
;// CONCATENATED MODULE: ./src/math/interpolate-exponential.js


function interpolateExponential(a, b, e, q) {
    if (e == 1) return interpolateLinear(a, b, q) // is linear
    if (q < .5) return interpolateLinear(a, b, Math.pow((q * 2), e) / 2)
    return interpolateLinear(a, b, 1 - Math.pow(((1 - q) * 2), e) / 2)
}
;// CONCATENATED MODULE: ./src/math/quantize.js
function quantize(value, quantize = Number.MAX_SAFE_INTEGER, threshold = 0, override = false) {
    if (override || quantize >= Number.MAX_SAFE_INTEGER) return value
    let t = threshold * .5 + .5
    return ((t + value * quantize) | 0) / quantize
}
;// CONCATENATED MODULE: ./src/wave-spline/find-pair.js
function findPair(points, x) {
    const len = points.length
    if (!len) return []
    if (len == 1) return [points[0], points[0]]
    let a = len-1
    let b = 0
    for (let i = 0; i<len; i++) {
        if (points[i].x > x ) {
            b = i
            break
        }
        a = i
    }
    return [points[a], points[b]]
}
;// CONCATENATED MODULE: ./src/math/compare-float.js
function compareFloat(a,b, tolerance = 1e-8) {
    return Math.abs(a - b) < tolerance
}
;// CONCATENATED MODULE: ./src/wave-spline/transform-wave-spline-point.js
function transformWaveSplinePoint(point, cx=.5, cy=.5, sx=1, sy=1, rx=1, ry=1) {
    if (sx == 1 && sy == 1) return point
    if (point.x < cx - rx || point.x > cx + rx) return point
    return {
        x: ((point.x-cx)*sx+cx),
        y: ((point.y-cy)*sy+cy),
        e: point.e
    }
}
;// CONCATENATED MODULE: ./src/wave-spline/process-wave-spline-points.js



function processWaveSplinePoints(points, cx=.5, cy=.5, sx=1, sy=1, rx=1, ry=1) {
    
    const len = points.length
    let out = []
    let point = {x: -1, y: 0, e: 0}
    let x = -1
    let y = 0
    let e = 0
    let stackCount = 0
    let cur
    for (let i = 0; i<len; i++) {
        cur = transformWaveSplinePoint(points[i], cx, cy, sx, sy, rx, ry)
        if (compareFloat(cur.x, x)) {
            y += cur.y
            e += cur.e
            stackCount++
        } else {
            if (stackCount) {
                y /= stackCount
                e /= stackCount
                out.push({x,y,e})
            }
            x = cur.x
            y = cur.y
            e = cur.e
            stackCount = 1
        }
        if (i == len-1 && stackCount) {
            y /= stackCount
            e /= stackCount
            out.push({x,y,e})
        }
    }

    return out
}
;// CONCATENATED MODULE: ./src/wave-spline/solve-wave-spline.js






let c = 0
function solveWaveSpline(wave, x, e = 1, sx=1, sy=1, overrideQuantize=false) {
    if (!wave) return 0
    x = quantize(
        x,
        wave.quantizeX,
        wave.quantizeXThreshold,
        overrideQuantize
    )
    sx = wave.transformScale.x * sx
    sy = wave.transformScale.y * sy
    const points = processWaveSplinePoints(wave.points, wave.transformCenter.x, wave.transformCenter.y, sx, sy, wave.transformRange.x, wave.transformRange.y)
    const [a, b] = findPair(points, x)
    if (!a || !b) return 0
    let y
    if (a === b) {
        y = a.y
    } else {
        const q = calcQ(a.x, b.x, x)
        if (q < .5) y = interpolateExponential(a.y, b.y, Math.max(0.3, e * wave.e * a.e), q)
        else y = interpolateExponential(a.y, b.y, Math.max(0.3, e * wave.e * b.e), q)
    }

    return quantize(
        y, 
        wave.quantizeY, 
        wave.quantizeYThreshold,
        overrideQuantize
    )
}
;// CONCATENATED MODULE: ./src/wave-spline/solve-oscillator.js



/*
    recursive solver
    returns float between min and max
*/
const MIN_NON_ZERO = 0.001
const MIN_E = 0.333
function solveOscilator(sampleRate, osc, {min = -1, max = 1} = {}) {
    let fm = 0
    let transpose = 0
    let em = 1
    let fmRange = 2
    let am = 1
    let sx = 1
    let sy = 1
    let gain = 1

    if (osc.fm) fm = solveOscilator(sampleRate, osc.fm) * -1
    if (osc.transpose) transpose = solveOscilator(sampleRate, osc.transpose) * -1
    if (osc.fmRange) fmRange = osc.fmRange

    let freqFactor = Math.pow(fmRange, fm)
    let transposeFactor = Math.pow(2, transpose)

    const phaseIncrement = 1/(osc.length * sampleRate * freqFactor * transposeFactor)

    osc.phase = ((osc.phase + phaseIncrement)) % 1

    if (osc.em) em = Math.max(0, solveOscilator(sampleRate, osc.em, {min: 0, max: 1}))
    if (osc.sx) sx = Math.max(MIN_NON_ZERO, solveOscilator(sampleRate, osc.sx, {min: 0, max: 1}))
    if (osc.sy) sy = Math.max(MIN_NON_ZERO, solveOscilator(sampleRate, osc.sy, {min: 0, max: 1}))
    let value = solveWaveSpline(osc.wave, (osc.phaseShift + osc.phase)%1, em, sx, sy)

    if (osc.am) am = solveOscilator(sampleRate, osc.am, {min, max})
    if (osc.gain) gain = solveOscilator(sampleRate, osc.gain, {min: 0, max: 1})
    
    return normalize(value, {min, max}) * am * gain
}
;// CONCATENATED MODULE: ./src/wave-spline/solve-voice.js


function solveVoice(sampleRate, voice) {
    return solveOscilator(sampleRate, voice.oscillator)
}


;// CONCATENATED MODULE: ./src/wave-spline/sync-oscillator.js
function syncOscillator(oscillator, reference) {
    if (!oscillator || !reference) return
    oscillator.phase = reference.phase
    syncOscillator(oscillator.am, reference.am)
    syncOscillator(oscillator.fm, reference.fm)
    syncOscillator(oscillator.em, reference.em)
    syncOscillator(oscillator.sx, reference.sx)
    syncOscillator(oscillator.sy, reference.sy)
    syncOscillator(oscillator.gain, reference.gain)
    syncOscillator(oscillator.transpose, reference.transpose)
}
;// CONCATENATED MODULE: ./src/wave-spline/sync-voice.js


function syncVoice(voice, reference) {
    if (!voice || !reference) return
    syncOscillator(voice.oscillator, reference.oscillator)
}
;// CONCATENATED MODULE: ./src/audio/wave-spline-processor.js






class WaveSplineProcessor extends AudioWorkletProcessor {

    #voices = []
    #buffer = new Float32Array(128)
    #maxTransitionTime = 1/60 
    #transition = 0
    #keepAlive = true
    #play = true

    constructor(...args) {
        super(...args)
        this.port.onmessage = (message) => {
            if (message.data.type === "voice") {
                this.onVoiceData(message.data.voice, message.data.sync)
            } else if (message.data.type === "update") {
                this.onVoiceUpdate(message.data.voice)
            } else if (message.data.type === "destroy") {
                this.onDestroy()
            } else if (message.data.type === "sync") {
                this.port.postMessage({type: "sync", voice: this.#voices[this.#voices.length-1]})
            } else if (message.data.type === "play") {
                this.#play = true
            } else if (message.data.type === "pause") {
                this.#play = false
            } 
        }
        
    }

    onVoiceData(voice, sync) {
        if (this.#voices.length>2)this.#voices.pop()
        if (sync && this.#voices.length) syncVoice(voice, this.#voices[this.#voices.length-1])
        this.#voices.push(voice)
    }

    onVoiceUpdate(value) {
        this.#voices.forEach((voice=>{
            Object.assign(voice, value)
        }))
    }

    onDestroy() {
        this.port.onmessage = null
        this.port.close()
        this.#voices = []
        this.#transition = 0
        this.#keepAlive = false
    }

    process(inputs, outputs, parameters) {
        for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
            const output = outputs[outputIndex]
            for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
                const channel = output[channelIndex]
                if (outputIndex == 0 && channelIndex == 0 && channel.length != this.#buffer.length) this.#buffer = new Float32Array(channel.length)
                for (let frame = 0; frame < channel.length; frame++) {
                    if (channelIndex == 0 && outputIndex == 0) {
                        let val = 0
                        if (this.#play) {
                            if (this.#voices.length == 1) {
                                val = solveVoice(sampleRate, this.#voices[0])
    
                            } else if (this.#voices.length >= 2) {
                                const transitionFrames = Math.min(this.#maxTransitionTime, this.#voices[0].oscillator.length) * sampleRate
                                const q = this.#transition / transitionFrames
                                val = interpolateLinear(
                                    solveVoice(sampleRate, this.#voices[0]),
                                    solveVoice(sampleRate, this.#voices[1]),
                                    q
                                )
                                if (this.#voices.length >= 3) {
                                    solveVoice(sampleRate, this.#voices[2])
                                }
                                this.#transition++
                                if (this.#transition >= transitionFrames) {
                                    this.#voices.shift()
                                    this.#transition = 0
                                }
                            }
                        }
                        
                        this.#buffer[frame] = val
                    } 
                    channel[frame] = this.#buffer[frame]
                
                }
            }
        }

        return this.#keepAlive
    }
}
registerProcessor("wave-spline-processor", WaveSplineProcessor);
/******/ })()
;