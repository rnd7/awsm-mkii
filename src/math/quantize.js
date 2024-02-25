export default function quantize(value, quantize = Number.MAX_SAFE_INTEGER, threshold = 0, override = false) {
    if (override || quantize >= Number.MAX_SAFE_INTEGER) return value
    let t = threshold * .5 + .5
    return ((t + value * quantize) | 0) / quantize
}