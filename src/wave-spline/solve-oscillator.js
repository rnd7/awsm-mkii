import normalize from "../math/normalize.js"
import solveWaveSpline from "./solve-wave-spline.js"

/*
    recursive solver
    returns float between min and max
*/
const MIN_NON_ZERO = 0.001
const MIN_E = 0.333
export default function solveOscilator(sampleRate, osc, {min = -1, max = 1} = {}) {
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