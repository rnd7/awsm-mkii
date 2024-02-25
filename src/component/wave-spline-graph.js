
import hslToRgb from "../color/hsl-to-rgb.js"
import rgbaToCss from "../color/rgba-to-css.js"
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import calculateDistance from "../math/calculate-distance.js"
import normalize from "../math/normalize.js"
import quantize from "../math/quantize.js"
import Point from "../model/point.js"
import findClosest from "../wave-spline/find-closest.js"
import solveWaveSpline from "../wave-spline/solve-wave-spline.js"
import Component from "./component.js"

export default class WaveSplineGraph extends Component {

    static CHANGE = 'change'
    static style = 'component/wave-spline-graph.css'

    #canvas = document.createElement('canvas')
    #ctx
    
    #waveSpline// = new WaveSpline()
    #horizontalPadding = 6
    #verticalPadding = 6
    #width
    #height
    #deepColor = hslToRgb({h: 0, s: 0, l: .25})
    #handleColor = hslToRgb({h: 0, s: 0, l: 1})
    #lineWidth = 2
    #gridWidth = 1
    #handleRadius = 3
    #zero = 0.5
    #minYLabel = "0"
    #maxYLabel = "1"
    #maxXLabel = "1"
    #playhead = 0

    #deleteThreshold = 20
    #selectionThreshold = 60
    #doubleTapDelay = 250
    #doubleTapDistance = 15

    #lastTap = 0
    #lastTapPosition = new Point()

    #last = new Point()

    #selection = []

    #innerWidth
    #innerHeight
    #top
    #left

    #isDown

    #headerEl = document.createElement('div')
    #maxXLabelEl = document.createElement('div')
    #minYLabelEl = document.createElement('div')
    #maxYLabelEl = document.createElement('div')
    #footerEl = document.createElement('div')

    constructor() {
        super()
        this.intitialized = false
        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 60)
        this.#canvas.setAttribute("height", 60)
        this.#ctx = this.#canvas.getContext("2d")

        this.observe(this.#canvas)

        this.#maxYLabelEl.classList.add("max-y")
        this.#headerEl.append(this.#maxYLabelEl)

        this.#headerEl.classList.add("header")
        this.shadowRoot.append(this.#headerEl)

        this.shadowRoot.append(this.#canvas)

        this.#minYLabelEl.classList.add("min-y")
        this.#footerEl.append(this.#minYLabelEl)

        this.#maxXLabelEl.classList.add("max-x")
        this.#footerEl.append(this.#maxXLabelEl)

        this.#footerEl.classList.add("footer")
        this.shadowRoot.append(this.#footerEl)

        watch(this, "waveSpline", this.binding(this.#onWaveSplineChange))

        this.#canvas.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.#canvas.addEventListener("pointercancel", this.binding(this.#onPointerCancel))
        this.#canvas.addEventListener("lostpointercapture", this.binding(this.#onPointerLost))
       
        this.#updateValues()
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(WaveSplineGraph.style)
        this.#calculate()
        this.intitialized = true
    }

    resize(contentRect) {
        super.resize(contentRect)
        this.#width = contentRect.width
        this.#height = contentRect.height
        this.#calculate()
    }

    #onPointerDown(e) {
        if (this.#isDown) return
        if (e.button != 0) return
        const now = Date.now()
        if (
            now - this.#lastTap < this.#doubleTapDelay 
            && calculateDistance(this.#lastTapPosition, {x: e.clientX, y: e.clientY}) < this.#doubleTapDistance
        ) {
            this.#lastTap = 0
            this.#lastTapPosition.x = 0
            this.#lastTapPosition.y = 0
            this.#insertOrDelete(e)
        } else {
            this.#isDown = e.pointerId
            this.#lastTap = Date.now()
            this.#lastTapPosition.x = e.clientX
            this.#lastTapPosition.y = e.clientY
            this.#selectClosest(e)
            if (this.#selection.length) {
                this.#canvas.setPointerCapture(e.pointerId)
                this.addEventListener("pointermove", this.binding(this.#onPointerMove))
            } 
        }
        this.#last.x = e.clientX
        this.#last.y = e.clientY
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.#canvas.releasePointerCapture(e.pointerId)
        this.#positionFromEvent(e)
        this.#endDrag(e)
    }
    
    #onPointerCancel(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.#canvas.releasePointerCapture(e.pointerId)
        this.#endDrag(e)
    }
    
    #onPointerLost(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.#canvas.releasePointerCapture(e.pointerId)
        this.#endDrag(e)
    }
    
    #onPointerMove(e) {
        if (this.#isDown !== e.pointerId) return
        this.#positionFromEvent(e)
    }

    #endDrag(e) {
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
        if(calculateDistance(this.#lastTapPosition, {x: e.clientX, y: e.clientY}) > 0) {
            this.#alignToGrid(this.#selection)
        }
    }

    #waveSplineToDiagram(point) {
        let from = Math.max(0, Math.min(1, this.#waveSpline.viewPosition * (1-this.#waveSpline.viewZoom)))
        let range = this.#waveSpline.viewZoom
        let to = from + range
        return {
            x: this.#innerWidth * ((point.x - from) / range),
            y: this.#innerHeight * (1-point.y)
        }
    }

    #eventToWaveSpline(e) {
        const p = this.#eventToDiagram(e)
        
        let from = Math.max(0, Math.min(1, this.#waveSpline.viewPosition * (1-this.#waveSpline.viewZoom)))
        let range = this.#waveSpline.viewZoom
        p.x = from + (p.x / this.#innerWidth) * range
        p.y /= this.#innerHeight
        p.y = 1-p.y
        return p
    }

    #eventToDiagram(e) {
        const p = this.#eventToCanvas(e)
        p.x -= this.#left 
        p.y -= this.#top
        return p
    }

    #eventToCanvas(e) {
        const rect = this.#canvas.getBoundingClientRect()
        return  {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    #insertOrDelete(e) {
        const closest = this.#findClosest(e)
        let insert = true
        const dposition = this.#eventToDiagram(e)
        if (closest) {
            const point = this.#waveSplineToDiagram(closest)
            const dist = calculateDistance(point, dposition)
            if (dist < this.#deleteThreshold) {
                insert = false
            }
        }
        if (insert) {
            const wposition = this.#alignPoint(this.#eventToWaveSpline(e))
            this.#waveSpline.points.push(wposition)
            this.#waveSpline.sort()
        } else if (closest) {
            this.#waveSpline.points.splice(this.#waveSpline.points.indexOf(closest), 1)
        }
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
    }

    #findClosest(e) {
        const wposition = this.#eventToWaveSpline(e)
        return findClosest(wposition, this.#waveSpline.points, {x: this.#innerWidth / this.#waveSpline.viewZoom, y: this.#innerHeight})
    }
    
    #selectClosest(e) {
        const closest = this.#findClosest(e)
        let selected
        if (closest) {
            const distance = calculateDistance(this.#waveSplineToDiagram(closest), this.#eventToDiagram(e))
            if (distance < this.#selectionThreshold) {
                selected = closest
            }

        }
        if (selected) this.#selection = [selected]
        else this.#selection = []
        
    }

    #alignPoint(point) {
        point.x = quantize(point.x, this.#waveSpline.gridX, this.#waveSpline.gridXThreshold) 
        point.y = quantize(point.y, this.#waveSpline.gridY, this.#waveSpline.gridYThreshold) 
        return point
    }


    #alignToGrid(points) {

        points.forEach(point=>this.#alignPoint(point))
        this.#waveSpline.sort()

    }

    #positionFromEvent(e) {
        let range = this.#waveSpline.viewZoom

        const dx = (e.clientX - this.#last.x) / (this.#innerWidth / range)
        const dy = (e.clientY - this.#last.y) / -this.#innerHeight

        this.#last.x = e.clientX
        this.#last.y = e.clientY

        this.#selection.forEach((point) => {
            point.x = (point.x + dx + 1) % 1
            point.y = Math.min(1, Math.max(0, point.y + dy))
        })

        this.#waveSpline.sort()

        this.dispatchEvent(
            new CustomEvent(
                WaveSplineGraph.CHANGE, 
                {
                    composed: true
                }
            )
        )
    }

    set playhead(value) {   
        if (this.#playhead === value) return
        this.#playhead = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get playhead() {
        return this.#playhead
    }

    set zero(value) {   
        this.#zero = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
        this.addToRenderQueue(this.binding(this.#updateValues))
    }
    
    get zero() {
        return this.#zero
    }

    set maxYLabel(value) {   
        this.#maxYLabel = value
        this.addToRenderQueue(this.binding(this.#updateValues))
    }
    
    get maxYLabel() {
        return this.#maxYLabel
    }

    set minYLabel(value) {   
        this.#minYLabel = value
        this.addToRenderQueue(this.binding(this.#updateValues))
    }
    
    get minYLabel() {
        return this.#minYLabel
    }

    set maxXLabel(value) {   
        this.#maxXLabel = value
        this.addToRenderQueue(this.binding(this.#updateValues))
    }
    
    get maxXLabel() {
        return this.#maxXLabel
    }

    set waveSpline(value) {   
        this.#waveSpline = value
    }
    
    get waveSpline() {
        return this.#waveSpline
    }

    #onWaveSplineChange(signal) {
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    #calculate() {
        this.#innerWidth = this.#width - this.#horizontalPadding * 2
        this.#innerHeight = this.#height - this.#verticalPadding * 2
        this.#top = this.#verticalPadding
        this.#left = this.#horizontalPadding
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    #updateValues() {
        this.#maxYLabelEl.textContent = this.#maxYLabel
        this.#minYLabelEl.textContent = this.#minYLabel
        this.#maxXLabelEl.textContent = this.#maxXLabel
    }


    #renderCanvas() {
        if (this.#canvas.width != this.#width) this.#canvas.width = this.#width
        if (this.#canvas.height != this.#height) this.#canvas.height = this.#height

        let oversampling = 2
        let p

        let from = Math.max(0, Math.min(1, this.#waveSpline.viewPosition * (1-this.#waveSpline.viewZoom)))
        let range = this.#waveSpline.viewZoom
        let to = from + range

        const wo = this.#innerWidth * oversampling
        this.#ctx.clearRect(0, 0, this.#width, this.#height)
        

        // zero
        {
            this.#ctx.save()
            this.#ctx.strokeStyle = "#909090"
            this.#ctx.lineWidth = this.#lineWidth/2
            const y = Math.round(this.#top + this.#innerHeight * (1-this.#zero))
            this.#ctx.beginPath()
            this.#ctx.moveTo(this.#left, y)
            this.#ctx.lineTo(this.#left + this.#innerWidth, y)
            this.#ctx.stroke()
            this.#ctx.restore()
        
        }

        // min
        if (this.#zero > 0) {
            this.#ctx.save()
            this.#ctx.strokeStyle = "#303030"
            this.#ctx.lineWidth = this.#lineWidth/2
            const y = this.#top + this.#innerHeight
            this.#ctx.beginPath()
            this.#ctx.moveTo(this.#left, y)
            this.#ctx.lineTo(this.#left + this.#innerWidth, y)
            this.#ctx.stroke()
            this.#ctx.restore()
    
        }
      
        // max
        if (this.#zero < 1) {
            this.#ctx.save()
            this.#ctx.strokeStyle = "#303030"
            this.#ctx.lineWidth = this.#lineWidth/2
            const y = this.#top
            this.#ctx.beginPath()
            this.#ctx.moveTo(this.#left, y)
            this.#ctx.lineTo(this.#left + this.#innerWidth, y)
            this.#ctx.stroke()
            this.#ctx.restore()
    
        }

        if (!this.#waveSpline) return

        this.#ctx.save()

        // horizontal grid
        if (
            this.#waveSpline.gridX < Number.MAX_SAFE_INTEGER 
        ) {
            const it = this.#innerWidth / this.#waveSpline.gridX / this.#waveSpline.viewZoom
            for (let i = 0; i <= this.#waveSpline.gridX; i++) {
                const x = Math.round(
                    this.#left + i * it - from * this.#innerWidth / this.#waveSpline.viewZoom
                )
                if (x >= this.#left && x <= this.#left+this.#innerWidth) {
                    this.#ctx.beginPath()
                    this.#ctx.strokeStyle = "#303030" // rgbaToCss(this.#deepColor)
                    this.#ctx.lineWidth = this.#gridWidth
                    this.#ctx.moveTo(x, this.#top)
                    this.#ctx.lineTo(x, this.#top + this.#innerHeight)
                    this.#ctx.stroke()
                }
            }
        }

        // vertical grid
        if (
            this.#waveSpline.gridY < Number.MAX_SAFE_INTEGER 
        ) {
            const it = this.#innerHeight / this.#waveSpline.gridY
            for (let i = 0; i <= this.#waveSpline.gridY; i++) {
                const y = Math.round(this.#top + i * it)
                this.#ctx.beginPath()
                this.#ctx.strokeStyle = "#303030" // rgbaToCss(this.#deepColor)
                this.#ctx.lineWidth = this.#gridWidth
                this.#ctx.moveTo(this.#left, y)
                this.#ctx.lineTo(this.#left+this.#innerWidth, y)
                this.#ctx.stroke()
            }
        }

        // Transform range
        this.#ctx.save()
        const leftRange = Math.max(
            this.#left,
            this.#left + (this.#waveSpline.transformCenter.x - this.#waveSpline.transformRange.x) * this.#innerWidth/range
        )
        if (leftRange >= this.#left && leftRange <= this.#left+this.#innerWidth) {
            this.#ctx.beginPath()
            this.#ctx.strokeStyle = '#003477'
            this.#ctx.lineWidth = this.#lineWidth
            this.#ctx.setLineDash([2,4]);
            this.#ctx.moveTo(leftRange, this.#top)
            this.#ctx.lineTo(leftRange, this.#top + this.#innerHeight)
            this.#ctx.stroke() 
        }
        const rightRange = Math.min(
            this.#left + this.#innerWidth,
            this.#left + (this.#waveSpline.transformCenter.x + this.#waveSpline.transformRange.x) * this.#innerWidth/range
        )
        if (rightRange >= this.#left && rightRange <= this.#left+this.#innerWidth) {
            this.#ctx.beginPath()
            this.#ctx.strokeStyle = '#003477'
            this.#ctx.lineWidth = this.#lineWidth
            this.#ctx.setLineDash([2,4]);
            this.#ctx.moveTo(rightRange, this.#top)
            this.#ctx.lineTo(rightRange, this.#top + this.#innerHeight)
            this.#ctx.stroke()
        }
        this.#ctx.restore()

        // Transform center
        this.#ctx.save()
        const scaleCenter = Math.max(
            this.#left,
            Math.min(
                this.#left + this.#innerWidth,
                this.#left + this.#waveSpline.transformCenter.x * this.#innerWidth/range
            )
        )

        if (scaleCenter >= this.#left && scaleCenter <= this.#left+this.#innerWidth) {
            this.#ctx.beginPath()
            this.#ctx.strokeStyle = '#003477'
            this.#ctx.lineWidth = this.#lineWidth
            this.#ctx.setLineDash([4,2]);
            this.#ctx.moveTo(scaleCenter, this.#top)
            this.#ctx.lineTo(scaleCenter, this.#top + this.#innerHeight)
            this.#ctx.stroke()
        }
        this.#ctx.restore()

        // quantized Wavespline
        if (
            !this.#waveSpline.quantizeX < Number.MAX_SAFE_INTEGER ||
            !this.#waveSpline.quantizeY < Number.MAX_SAFE_INTEGER
        ) {
            // render quantized no oversampling
            for (let x = 0; x < this.#innerWidth; x++) {
                const px = x / this.#innerWidth
    
                let t = normalize(px, {min: from, max:to}) 
    
                let y = solveWaveSpline(this.#waveSpline, t%1)
                let c = {x: this.#left + x, y: y}
                c.y = this.#top +  normalize((1-c.y ), {max: this.#innerHeight})
                if (p) {
                    this.#ctx.beginPath()
                    this.#ctx.strokeStyle = rgbaToCss(this.#deepColor)
                    this.#ctx.lineWidth = this.#lineWidth
                    this.#ctx.moveTo(p.x, p.y)
                    this.#ctx.lineTo(c.x, c.y)
                    this.#ctx.stroke()
                }
                p = c
            }
        }
        p = null

        // Wavespline
        for (let x = 0; x < wo; x++) {
            const px = x / wo
            let t = normalize(px, {min: from, max:to}) 
            let y = solveWaveSpline(this.#waveSpline, t%1, 1, 1, 1, true)
            let c = {x: this.#left + x / oversampling, y: y}
            c.y = this.#top +  normalize((1-c.y ), {max: this.#innerHeight})
            if (p) {
                this.#ctx.beginPath()
                this.#ctx.strokeStyle = rgbaToCss(this.#handleColor)
                this.#ctx.lineWidth = this.#lineWidth
                this.#ctx.moveTo(p.x, p.y)
                this.#ctx.lineTo(c.x, c.y)
                this.#ctx.stroke()
            }
            p = c
        
        }
        this.#ctx.restore()

        // playhead
        this.#ctx.save()
        const playheadPos = this.#left + this.#playhead * this.#innerWidth/range
        if (playheadPos >= this.#left && playheadPos <= this.#left+this.#innerWidth) {
            this.#ctx.beginPath()
            this.#ctx.strokeStyle = '#cc0000'
            this.#ctx.lineWidth = this.#lineWidth
            this.#ctx.moveTo(playheadPos, this.#top)
            this.#ctx.lineTo(playheadPos, this.#top + this.#innerHeight)
            this.#ctx.stroke()
        }
        this.#ctx.restore()

        // wavespline points
        for (let i = 0; i < this.#waveSpline.points.length; i++) {
            let s = this.#waveSpline.points[i]
            let x = this.#left + (s.x - from) * this.#innerWidth/range
            if (x >= this.#left && x <= this.#left+this.#innerWidth) {
                this.#ctx.save()
                this.#ctx.beginPath();
                this.#ctx.fillStyle = rgbaToCss(this.#handleColor)
                this.#ctx.arc(x , this.#top + (1-s.y) * this.#innerHeight, this.#handleRadius, 0, 2 * Math.PI)
                this.#ctx.fill()
                this.#ctx.restore()
            }
        }
    }

    destroy() {
        unwatch(this)
        this.#waveSpline = null
        this.#canvas.removeEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
        this.#canvas.removeEventListener("pointerup", this.binding(this.#onPointerUp))
        super.destroy()
    }
}