import interpolateLinear from "./interpolate-linear.js";

export default function interpolatePoint(a, b, q) {
    return {
        x: interpolateLinear(a.x, b.x, q),
        y: interpolateLinear(a.y, b.y, q)
    }
}