import calcQ from "../math/calculate-q.js"
import interpolateExponential from "../math/interpolate-exponential.js"
import quantize from "../math/quantize.js"
import findPair from "./find-pair.js"
import processWaveSplinePoints from "./process-wave-spline-points.js"

let c = 0
export default function solveWaveSpline(wave, x, e = 1, sx=1, sy=1, overrideQuantize=false) {
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