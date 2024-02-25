import { TAU } from "./contants.js"

export default function wrapAngle(value) {
    return  (value + TAU) % TAU
}