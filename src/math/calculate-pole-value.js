import Point from "../model/point.js"
import { TAU } from "./contants.js"
import rotatePoint from "./rotate-point.js"

export default function calculatePoleValue(pole, poles, position) {
    const segmentAngle = TAU / poles
    let rotated = rotatePoint(new Point(), position, pole * segmentAngle )
    let len = Math.max(0, Math.min(1, (rotated.y+1)/2))
    return len
}