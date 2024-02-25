import compareFloat from "../math/compare-float.js"
import transformWaveSplinePoint from "./transform-wave-spline-point.js"

export default function processWaveSplinePoints(points, cx=.5, cy=.5, sx=1, sy=1, rx=1, ry=1) {
    
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