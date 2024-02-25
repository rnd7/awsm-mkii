import { T, A } from "../glue/t.js"
import wrap from "../glue/wrap.js"
import Entity from "./entity.js"
import Point from "./point.js"
import WaveSplinePoint from "./wave-spline-point.js"

export default class WaveSpline extends Entity {
    #e = T(Number, 1)
    #points = A(WaveSplinePoint)
    #quantizeX = T(Number, Number.MAX_SAFE_INTEGER)
    #quantizeXThreshold = T(Number, -1)
    #quantizeY = T(Number, Number.MAX_SAFE_INTEGER)
    #quantizeYThreshold = T(Number, 0)
    #gridX = T(Number, Number.MAX_SAFE_INTEGER)
    #gridXThreshold = T(Number, 0)
    #gridY = T(Number, Number.MAX_SAFE_INTEGER)
    #gridYThreshold = T(Number, 0)

    #viewZoom = T(Number, 1)
    #viewPosition = T(Number, 0)

    #transformCenter = T(Point, {x: 0.5, y: 0.5})
    #transformScale = T(Point, {x: 1, y: 1})
    #transformRange = T(Point, {x: 1.0, y: 1.0})

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get points() {
        return this.#points
    }
    
    set points(value) {
        this.#points = value
    }

    
    get transformCenter() {
        return this.#transformCenter
    }
    
    set transformCenter(value) {
        this.#transformCenter = value
    }
    
    get transformScale() {
        return this.#transformScale
    }
    
    set transformScale(value) {
        this.#transformScale = value
    }
    
    get transformRange() {
        return this.#transformRange
    }
    
    set transformRange(value) {
        this.#transformRange = value
    }
    
    get e() {
        return this.#e
    }
    
    set e(value) {
        this.#e = value
    }

    get quantizeX() {
        return this.#quantizeX
    }
    
    set quantizeX(value) {
        this.#quantizeX = value
    }

    get quantizeXThreshold() {
        return this.#quantizeXThreshold
    }
    
    set quantizeXThreshold(value) {
        this.#quantizeXThreshold = value
    }

    get quantizeY() {
        return this.#quantizeY
    }
    
    set quantizeY(value) {
        this.#quantizeY = value
    }

    get quantizeYThreshold() {
        return this.#quantizeYThreshold
    }
    
    set quantizeYThreshold(value) {
        this.#quantizeYThreshold = value
    }

    get gridX() {
        return this.#gridX
    }
    
    set gridX(value) {
        this.#gridX = value
    }

    get gridXThreshold() {
        return this.#gridXThreshold
    }
    
    set gridXThreshold(value) {
        this.#gridXThreshold = value
    }

    get gridY() {
        return this.#gridY
    }
    
    set gridY(value) {
        this.#gridY = value
    }

    get gridYThreshold() {
        return this.#gridYThreshold
    }
    
    set gridYThreshold(value) {
        this.#gridYThreshold = value
    }

    get viewZoom() {
        return this.#viewZoom
    }
    
    set viewZoom(value) {
        this.#viewZoom = value
    }

    get viewPosition() {
        return this.#viewPosition
    }
    
    set viewPosition(value) {
        this.#viewPosition = value
    }

    insertPoint(value) {
        this.points.push(value)
        this.sort()
    }

    removePoint(value) {
        this.points.splice(this.#points.indexOf(value), 1)
    }

    sort() {
        this.points.sort((a, b)=>{
            if (a.x === b.x) return (a.id < b.id) ? -1 : 1
            return (a.x < b.x) ? -1 : 1
        })
    }
}