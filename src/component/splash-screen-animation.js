
import rgbaToCss from "../color/rgba-to-css.js"
import WaveSpline from "../model/wave-spline.js"
import solveWaveSpline from "../wave-spline/solve-wave-spline.js"
import Component from "./component.js"

export default class SplashScreenAnimation extends Component {

    static style = 'component/splash-screen-animation.css'
    static UP = 'up'
    static DOWN = 'down'

    #header = ""
    #footer = ""
    #label = ""

    #mode = "logo"

    #ctx

    #canvasEl = document.createElement("canvas")
    #headerEl = document.createElement("div")
    #labelEl = document.createElement("div")
    #footerEl = document.createElement("div")

    #isDown


    constructor() {
        super()
        this.intitialized = false

        this.#canvasEl.classList.add("canvas")
        this.#ctx = this.#canvasEl.getContext("2d")
        this.shadowRoot.append(this.#canvasEl)

        this.#headerEl.classList.add("header")
        this.shadowRoot.append(this.#headerEl)

        this.#labelEl.classList.add("label")
        this.shadowRoot.append(this.#labelEl)


        this.#footerEl.classList.add("footer")
        this.shadowRoot.append(this.#footerEl)

        this.#dataset = this.#generate()

        this.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(SplashScreenAnimation.style)
        this.intitialized = true
        this.#render()
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                SplashScreenAnimation.DOWN, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                SplashScreenAnimation.UP, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    set header(value) {
        this.#header = value
        this.addToRenderQueue(this.binding(this.#update))
    }

    get header() {
        return this.#header
    }

    set label(value) {
        this.#label = value
        this.addToRenderQueue(this.binding(this.#update))
    }

    get label() {
        return this.#label
    }

    set footer(value) {
        this.#footer = value
        this.addToRenderQueue(this.binding(this.#update))
    }

    get footer() {
        return this.#footer
    }

    set mode(value) {
        this.#mode = value
        this.addToRenderQueue(this.binding(this.#update))
    }

    get mode() {
        return this.#mode
    }

    #update() {
        
        this.classList.add("icon")
        this.#headerEl.textContent = this.#header
        this.#labelEl.textContent = this.#label
        this.#footerEl.textContent = this.#footer

    }

    #layers = 7
    #minPoints = 4
    #maxPoints = 7

    #generate() {
        const layers = []
        for (let l = 0; l < this.#layers; l++) {
            const points = this.#minPoints + Math.random() * (this.#maxPoints - this.#minPoints)
            const layer = []
            for (let p = 0; p < points-1; p++) {
                layer.push({x: 1/points*p, y: Math.random(), e: 2.341}) //  1 + Math.random() * 2})
            }
            layers.push(new WaveSpline({points:layer}))
        }
        return layers
    }

    #dataset = []
    
    #maxV = 0.001
    #minA = 0.000007
    #maxA = 0.0007

    #minPhase = .000007
    #maxPhase = .0007
    
    #render() {
        requestAnimationFrame(()=>{
            const d = this.#canvasEl.getBoundingClientRect()
            if (this.#canvasEl.width != d.width) this.#canvasEl.width = d.width
            if (this.#canvasEl.height != d.height) this.#canvasEl.height = d.height
            const h = d.height *.5
            const oy =  d.height * 0.25
            this.#ctx.clearRect(0,0, d.width, d.height)
            this.#ctx.save()
            this.#ctx.globalCompositeOperation = "screen";
            for (let i = 0; i<this.#dataset.length; i++) {
                if (!this.#dataset[i].phase) this.#dataset[i].phase = 0
                if (!this.#dataset[i].direction) this.#dataset[i].direction = (Math.random())>.5?1:-1
                let p = null
                this.#ctx.beginPath()

                const grd = this.#ctx.createLinearGradient(0, 0, 0, d.height);
                grd.addColorStop(0.0, rgbaToCss({r:0,g:0,b:0,a:i/this.#dataset.length * .01}) );
                grd.addColorStop(0.5, rgbaToCss({r:255,g:255,b:255,a:i/this.#dataset.length * .05}) );
                grd.addColorStop(1, rgbaToCss({r:0,g:0,b:0,a:i/this.#dataset.length * .01}) );
                this.#ctx.fillStyle = grd 
                this.#ctx.lineWidth = 2
                if (this.#dataset[i].direction < 0) this.#ctx.moveTo(-2, -2)
                else this.#ctx.moveTo(-2, d.height+2)
                
                for (let x = 0; x < d.width; x++) {
                    let y = solveWaveSpline(this.#dataset[i], (x/d.width + this.#dataset[i].phase + 1)%1)
                    
                    let c = {x: x, y: y*h + oy}
                    this.#ctx.lineTo(c.x, c.y)
                
                }
                if (this.#dataset[i].direction < 0) this.#ctx.lineTo(d.width+2, -2)
                else this.#ctx.lineTo(d.width+2, d.height+2)
               
                this.#ctx.closePath()
                this.#ctx.fill()
                
                
                if (!this.#dataset[i].vp) {
                    this.#dataset[i].vp = this.#minPhase + Math.random() * (this.#maxPhase - this.#minPhase)
                    if (Math.random()>0.5) this.#dataset[i].vp *=-1
                }
                this.#dataset[i].phase = (this.#dataset[i].phase + this.#dataset[i].vp + 1) % 1
                for (let p = 0; p < this.#dataset[i].points.length; p++) {
                    if (!this.#dataset[i].points[p].vy) {
                        this.#dataset[i].points[p].vy = this.#minA + Math.random() * (this.#maxA -this.#minA)
                        if (Math.random()>0.5) this.#dataset[i].points[p].vy *=-1
                    }
                    if ( this.#dataset[i].points[p].y + this.#dataset[i].points[p].vy > 1 || this.#dataset[i].points[p].y + this.#dataset[i].points[p].vy < 0) this.#dataset[i].points[p].vy *= -1
                    this.#dataset[i].points[p].y = Math.max(0, Math.min(1, (this.#dataset[i].points[p].y + this.#dataset[i].points[p].vy)))
                }
            
            }
            
            this.#ctx.restore()

            this.#render()
        })
      
    }

    destroy() {
        super.destroy()

    }
}