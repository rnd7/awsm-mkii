export default function findPair(points, x) {
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