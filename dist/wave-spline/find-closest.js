import calculateDistance from "../math/calculate-distance.js"

export default function findClosest(p, points, weight = {x:1, y:1}) {
    let best = Number.POSITIVE_INFINITY
    let result = null
    const len = points.length
    for (let i = 0; i<len; i++) {
        const point = points[i]
        const dist = calculateDistance(p, point, weight)
        if (dist < best) {
            best = dist
            result = point
        }
    }
    return result
}