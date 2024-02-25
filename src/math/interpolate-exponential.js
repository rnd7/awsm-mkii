import interpolateLinear from "./interpolate-linear.js"

export default function interpolateExponential(a, b, e, q) {
    if (e == 1) return interpolateLinear(a, b, q) // is linear
    if (q < .5) return interpolateLinear(a, b, Math.pow((q * 2), e) / 2)
    return interpolateLinear(a, b, 1 - Math.pow(((1 - q) * 2), e) / 2)
}