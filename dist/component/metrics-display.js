import unwatch from "../glue/unwatch.js"
import Component from "./component.js"

export default class MetricsDisplay extends Component {

    static CHANGE = 'change'
    static style = 'component/metrics-display.css'

    #canvas = document.createElement('canvas')
    #ctx
    
    #padding = 4
    #lineWidth = 2

    #innerWidth
    #innerHeight
    #top
    #left

    #audioMetrics

    #header = ""
    #headerEl = document.createElement("div")
    #footerEl = document.createElement("div")
    #freeze = false

    constructor() {
        super()
        this.intitialized = false

        this.#headerEl.classList.add("header")
        this.shadowRoot.append(this.#headerEl)

        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 60)
        this.#canvas.setAttribute("height", 36)
        this.#ctx = this.#canvas.getContext("2d")
        this.shadowRoot.append(this.#canvas)

        this.#footerEl.classList.add("footer")
        this.shadowRoot.append(this.#footerEl)
        
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))

        this.#init()
    }

    #onPointerUp(e) {
        this.freeze = !this.freeze
    }

    async #init() {
        await this.appendStyleLink(MetricsDisplay.style)
        this.#calculate()
        this.#renderLabels()
        this.#renderLoop()
        this.intitialized = true
    }

    resize(contentRect) {
        super.resize(contentRect)
        this.#calculate()
    }

    set audioMetrics(value) {
        this.#audioMetrics = value
    }

    get audioMetrics() {
        return this.#audioMetrics
    }

    get header() {
        return this.#header
    }

    set header(value) {
        this.#header = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get header() {
        return this.#header
    }

    set freeze(value) {
        this.#freeze = value
        this.addToRenderQueue(this.binding(this.#renderLabels))
    }

    get freeze() {
        return this.#freeze
    }

    #calculate() {
        this.#innerWidth = this.#canvas.width - this.#padding * 2
        this.#innerHeight = this.#canvas.height - this.#padding * 2
        this.#top = this.#padding
        this.#left = this.#padding
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    #renderLoop() {
        requestAnimationFrame(()=>{
            this.#renderCanvas()
            this.#renderLoop()
        })
    }

    #renderCanvas() {
        
        if (this.#freeze) return
        this.#headerEl.textContent = this.#header || "Oscilloscope"
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)
        if (!this.#audioMetrics) return
        this.#audioMetrics.callback()
        let frame = this.#audioMetrics.frame
        let hFactor = this.#innerWidth/frame.length
        let vFactor = this.#innerHeight/0xFF
        this.#ctx.save()
        this.#ctx.beginPath()
        this.#ctx.lineJoin = "round"
        this.#ctx.strokeStyle = "#FFFFFF"
        this.#ctx.lineWidth = this.#lineWidth
        for (let i = 0; i < frame.length; i++) {
            const val = frame[i]
            const x = this.#left + i * hFactor
            const y = this.#top + (0xFF-val) * vFactor
            if (x==0) {
                this.#ctx.moveTo(x,y)
            } else {
                this.#ctx.lineTo(x,y)
            }
        }
        this.#ctx.stroke()
        this.#ctx.restore()
    }

    #renderLabels() {
        if (this.#freeze) {
            this.#footerEl.textContent = "paused"
        } else {
            this.#footerEl.textContent = ""
        }
    }

    destroy() {
        unwatch(this)
        super.destroy()
    }

}