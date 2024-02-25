import wrapAngle from "./wrap-angle.js"
import { TAU } from "./contants.js"

export default function calculateAngleBetween(a, b) {
    a = wrapAngle(a)
    b = wrapAngle(b)
    const delta = (b - a + TAU) % TAU
    return delta
}