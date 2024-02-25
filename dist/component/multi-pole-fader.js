import hslToRgb from "../color/hsl-to-rgb.js"
import rgbaToCss from "../color/rgba-to-css.js"
import calculateAngle from "../math/calculate-angle.js"
import { TAU } from "../math/contants.js"
import calculateLength from "../math/calculate-length.js"
import Point from "../model/point.js"
import Component from "./component.js"
import calculateCirclePoint from "../math/calculate-circle-point.js"
import translatePoint from "../math/translate-point.js"
import interpolatePoint from "../math/interpolate-point.js"
import Signal from "../glue/signal.js"
import calculatePoleValue from "../math/calculate-pole-value.js"


export default class MultiPoleFader extends Component {

    static CHANGE = 'change'
    static style = 'component/multi-pole-fader.css'

    #canvas = document.createElement('canvas')
    #ctx
    #poles = 6
    #position = new Point({x:0, y:0})
    
    #angleOffset = -Math.PI/2
    #padding = 16
    #radius
    #diameter
    #segmentAngle
    #perimeterSegments
    #perimeterSegmentAngle
    #magnitude


    #perimeterColor = hslToRgb({h: 0, s: 0, l: 1})
    #handleColor = hslToRgb({h: 0, s: 0, l: 1})
    #lineWidth = 2
    #handleRadius = 4


    #brightness = 1

    #isDown

    constructor() {
        super()
        this.intitialized = false
        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 78)
        this.#canvas.setAttribute("height", 60)
        this.#ctx = this.#canvas.getContext("2d")
        this.shadowRoot.append(this.#canvas)
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(MultiPoleFader.style)
        this.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.addEventListener("pointermove", this.binding(this.#onPointerMove))
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.addEventListener("lostpointercapture", this.binding(this.#onPointerLost))
        this.addEventListener("pointercancel", this.binding(this.#onPointerCancel))
        Signal.subscribe(this.#position, this.binding(this.#onPositionChange))
        this.#calculate()
        this.intitialized = true
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.setPointerCapture(e.pointerId)
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
        this.#positionFromEvent(e)
    }

    #onPointerCancel(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
    }

    #onPointerLost(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
    }
    
    #onPointerMove(e) {
        if (this.#isDown !== e.pointerId) return
        this.#positionFromEvent(e)
    }

    #positionFromEvent(e) {
        let rect = this.#canvas.getBoundingClientRect();
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top

        // proportional
        let p = {
            x: ((x - this.#canvas.width / 2) / this.radius),
            y: ((y - this.#canvas.height / 2) / this.radius)
        }
       
        const distance = calculateLength(p.x, p.y) 
        if (distance > 1) {
            // limit to perimeter
            const angle = calculateAngle(p)
            this.#position.x = Math.cos(angle);
            this.#position.y = Math.sin(angle);
        } else {
            this.#position.x = p.x
            this.#position.y = p.y
        }
        this.dispatchEvent(
            new CustomEvent(
                MultiPoleFader.CHANGE, 
                {
                    composed: true
                }
            )
        )
    }

    get position() {
        return this.#position
    }
    
    #onPositionChange() {
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    set brightness(value) {
        this.#brightness = Math.max(1, value)
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get brightness() {
        return this.#brightness
    }

    set angleOffset(value) {
        this.#angleOffset = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get angleOffset() {
        return this.#angleOffset
    }

    set poles(value) {
        if (this.#poles == value) return
        this.#poles = value
        this.#calculate()
    }
    
    get poles() {
        return this.#poles
    }

    get radius() {
        return this.#radius
    }

    get diameter() {
        return this.#diameter
    }

    get segmentAngle() {
        return this.#segmentAngle
    }
    
    get perimeterSegments() {
        return this.#perimeterSegments
    }

    get perimeterSegmentAngle() {
        return this.#perimeterSegmentAngle
    }

    get magnitude() {
        return this.#magnitude
    }

    #calculate() {
        this.#diameter = Math.min(
            this.#canvas.width - this.#padding * 2, 
            this.#canvas.height - this.#padding * 2
        )
        this.#radius = this.#diameter / 2
        if (this.poles > 0) {
            this.#segmentAngle = TAU / this.#poles
            if (!(this.#poles % 2)) {
                this.#perimeterSegments = this.#poles  
                this.#perimeterSegmentAngle = this.#segmentAngle
            } else {
                this.#perimeterSegments = this.#poles * 2
                this.#perimeterSegmentAngle = this.#segmentAngle / 2
            }
            this.#magnitude = Math.max(1, this.#poles / 2)
        }
    
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    calculatePoleValue(pole) {
        return calculatePoleValue(pole, this.#poles, this.#position)
    }

    #renderCanvas() {
        let w = this.#canvas.width
        let h = this.#canvas.height
        let cx = w/2
        let cy = h/2
        let c = {x: w/2, y: h/2}

        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
        this.#ctx.save()
        
        // circle
        this.#ctx.beginPath();
        this.#ctx.lineWidth = this.#lineWidth
        this.#ctx.strokeStyle = rgbaToCss(this.#perimeterColor)
        this.#ctx.arc(c.x, c.y, this.radius, 0, 2 * Math.PI);
        this.#ctx.stroke();

        if (this.#poles > 0) {
          // axis      
            for (let i = 0; i < this.poles; i++) {
                const angle = this.angleOffset + i * this.segmentAngle
                let s = translatePoint(calculateCirclePoint(this.radius, angle), c)
                let e = translatePoint(calculateCirclePoint(this.radius, angle + Math.PI), c)
                this.#ctx.save()
                this.#ctx.beginPath();
                let col = i*128/this.poles
                this.#ctx.lineWidth = this.#lineWidth / 2
                this.#ctx.strokeStyle = "#808080"
                this.#ctx.moveTo (s.x, s.y);    
                this.#ctx.lineTo (e.x, e.y);
                this.#ctx.stroke();
                this.#ctx.restore()
            }

            // poles      
            for (let i = 0; i < this.poles; i++) {
                const angle = this.angleOffset + i * this.segmentAngle
                let s = translatePoint(calculateCirclePoint(this.radius, angle), c)
                let e = translatePoint(calculateCirclePoint(this.radius, angle + Math.PI), c)
                let q = this.calculatePoleValue(i)
                let t = interpolatePoint(s, e, q)
                this.#ctx.save()
                this.#ctx.beginPath()
                this.#ctx.fillStyle = "#909090"
                this.#ctx.arc(t.x, t.y, this.#handleRadius / 2, 0, 2 * Math.PI)
                this.#ctx.fill()
                this.#ctx.restore()

                this.#ctx.save()
                this.#ctx.fillStyle = "#909090"
                let tp = translatePoint(calculateCirclePoint(this.radius + 10, angle + Math.PI), c)
                this.#ctx.font = "9px sans-serif"
                this.#ctx.textBaseline = "middle"
                this.#ctx.textAlign = "center"
                this.#ctx.fillText(i+1, tp.x, tp.y)
                this.#ctx.restore()


            }

            // handle
            this.#ctx.save()
            this.#ctx.beginPath();
            this.#ctx.fillStyle = rgbaToCss(this.#handleColor)
            this.#ctx.arc(cx + this.#position.x * this.radius, cy + this.#position.y * this.radius, this.#handleRadius, 0, 2 * Math.PI);
            this.#ctx.fill()
            this.#ctx.restore()
        }
    }

    destroy() {
        Signal.unsubscribe(this.#position, this.binding(this.#onPositionChange))
        this.#canvas.removeEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
        this.#canvas.removeEventListener("pointerup", this.binding(this.#onPointerUp))
        super.destroy()
    }

}