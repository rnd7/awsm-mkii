
import hslToRgb from "../color/hsl-to-rgb.js"
import rgbaToCss from "../color/rgba-to-css.js"
import calculateAngleBetween from "../math/calculate-angle-between.js"
import calculateAngle from "../math/calculate-angle.js"
import calculateCirclePoint from "../math/calculate-circle-point.js"
import { TAU } from "../math/contants.js"
import translatePoint from "../math/translate-point.js"
import wrapAngle from "../math/wrap-angle.js"
import Component from "./component.js"

export default class Rotary extends Component {

    static CHANGE = 'change'
    static style = 'component/rotary.css'

    #canvas = document.createElement('canvas')
    #ctx
    
    #angleOffset =  -Math.PI/2
    #fromAngle = -.8 * Math.PI
    #toAngle = .8 * Math.PI
    #value = 0
    #min = -1
    #max = 1
    #center = 0
    //#paddingFactor = .2
    #padding = 5
    #labelSpacing = 14
    #step = 0
    #radius
    #diameter
    #width
    #height
    #innerRadius
    #segmentAngle
    #segmentHeight
    #perimeterColor = hslToRgb({h: 0, s: 0, l: 1})
    #backgroundColor = hslToRgb({h: 0, s: 0, l: .5})
    #handleColor = hslToRgb({h: 0, s: 0, l: 1})
    #lineWidth = 2
    #handleRadius = 3
    #minLabel = ""
    #maxLabel = ""
    #header = ""
    #footer = ""
    #headerEl = document.createElement("div")
    #footerEl = document.createElement("div")
    #minEl = document.createElement("div")
    #maxEl = document.createElement("div")

    #scale = 1

    #isDown

    constructor() {
        super()
        this.intitialized = false

        this.#headerEl.classList.add("header")
        this.shadowRoot.append(this.#headerEl)

        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 78)
        this.#canvas.setAttribute("height", 36)
        this.#ctx = this.#canvas.getContext("2d")
        this.shadowRoot.append(this.#canvas)

        this.#footerEl.classList.add("footer")
        this.#minEl.classList.add("min")
        this.#footerEl.append(this.#minEl)
        this.#maxEl.classList.add("max")
        this.#footerEl.append(this.#maxEl)
        this.shadowRoot.append(this.#footerEl)

        this.#init()
    }

    async #init() {
        await this.appendStyleLink(Rotary.style)
        this.#calculate()
        this.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.addEventListener("pointermove", this.binding(this.#onPointerMove))
        this.addEventListener("pointercancel", this.binding(this.#onPointerCancel))
        this.addEventListener("lostpointercapture", this.binding(this.#onPointerLost))
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.intitialized = true
    }


    #onPointerDown(e) {
        if (this.#isDown) return 
        if (e.button != 0) return
        this.#isDown = e.pointerId
        this.setPointerCapture(e.pointerId)
        
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        if (e.button != 0) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
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
        let w = this.#canvas.width 
        let h = this.#canvas.height

        const angle = calculateAngle(p) - this.#angleOffset


        let start =  wrapAngle(this.#fromAngle)
        let end =  wrapAngle(this.#toAngle)
        let range = calculateAngleBetween(this.#fromAngle, this.#toAngle)
        let value = calculateAngleBetween(start, angle)
        let propValue =  value / range
        let inverseRange = TAU - range
        //this.#value = Math.min(1,Math.max(0, propValue))
        let result
        if (propValue < 1+inverseRange/TAU/2) {
            result = Math.min(1, propValue)
        } else if (propValue > 1+inverseRange/TAU/2) {
            result = 0
        } else {
            result = Math.min(1, Math.max(0, propValue))
        }

        if (this.#scale != 1) {
            result = Math.pow(result, 1/this.#scale)
        }

        this.#value = result
    
        this.addToRenderQueue(this.binding(this.#renderCanvas))
        this.dispatchEvent(
            new CustomEvent(
                Rotary.CHANGE, 
                {
                    composed: true
                }
            )
        )
    }

    get value() {
        let result = this.#value * (this.#max-this.#min) + this.#min
        if (this.step > 0) {
            result = Math.round(result / this.step) * this.step
        }
        return result
    }



    set value(value) {
        this.#value = Math.max(0, Math.min(1,(value - this.#min) / (this.#max-this.#min)))
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }


    get step() {
        return this.#step
    }

    set step(value) {
        this.#step = value
    }


    get min() {
        return this.#min
    }

    set min(value) {
        this.#min = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get minLabel() {
        return this.#minLabel
    }

    set minLabel(value) {
        this.#minLabel = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get max() {
        return this.#max
    }

    set max(value) {
        this.#max = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get maxLabel() {
        return this.#maxLabel
    }

    set maxLabel(value) {
        this.#maxLabel = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get center() {
        return this.#center
    }

    set center(value) {
        this.#center = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get scale() {
        return this.#scale
    }

    set scale(value) {
        this.#scale = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    set angleOffset(value) {
        this.#angleOffset = Math.max(1, value)
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get angleOffset() {
        return this.#angleOffset
    }

    get radius() {
        return this.#radius
    }

    get diameter() {
        return this.#diameter
    }

    get header() {
        return this.#header
    }

    set header(value) {
        this.#header = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }



    #calculate() {
        this.#diameter = Math.min(
            this.#canvas.width - this.#padding * 2, 
            this.#canvas.height - this.#padding * 2
        )
        this.#radius = this.#diameter / 2
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    #renderCanvas() {

        let w = this.#canvas.width
        let h = this.#canvas.height
        if (!w || !h) return console.log(w,h)
        let c = {x: w/2, y: h/2}
        
        let val = Math.max(0, Math.min(1,(this.value - this.#min) / (this.#max-this.#min)))

        if (this.#scale != 1) {
            val = Math.pow(val, this.#scale)
        }

        let start =  this.#fromAngle + this.#angleOffset
        let end =  this.#toAngle + this.#angleOffset
        let overallRange = calculateAngleBetween(start, end) 
        let range = overallRange * val
        
        let valueAngle = start + range

        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
        this.#ctx.save()

        // circle
        this.#ctx.beginPath();
        this.#ctx.lineWidth = this.#lineWidth
        this.#ctx.strokeStyle = "#909090" // rgbaToCss(this.#backgroundColor)
        this.#ctx.arc(c.x, c.y, this.radius, start, end);
        this.#ctx.stroke();

        // circle
        this.#ctx.beginPath();
        this.#ctx.lineWidth = this.#lineWidth
        this.#ctx.strokeStyle = rgbaToCss(this.#perimeterColor)

        let valRange = Math.abs(this.#max - this.#min)
        let propCenter =  (this.#center-this.#min) / valRange 
        let centerAngle = start + (propCenter * overallRange)
        let ccw = (centerAngle > valueAngle)

        this.#ctx.arc(c.x, c.y, this.radius, centerAngle, valueAngle, ccw);
        this.#ctx.stroke();

        
        let s = translatePoint(calculateCirclePoint(this.radius, valueAngle), c)
        // handle
        this.#ctx.save()
        this.#ctx.beginPath();
        this.#ctx.fillStyle = rgbaToCss(this.#handleColor)
        this.#ctx.arc(s.x , s.y, this.#handleRadius, 0, 2 * Math.PI);
        this.#ctx.fill();

        this.#ctx.restore()

        this.#headerEl.textContent = this.#header

        const minLabel = this.minLabel || this.min
        const maxLabel = this.maxLabel || this.max
        this.#minEl.textContent = minLabel
        this.#maxEl.textContent = maxLabel
       
    }

    destroy() {

        this.#canvas.removeEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
        this.#canvas.removeEventListener("pointerup", this.binding(this.#onPointerUp))
        super.destroy()
    }

}