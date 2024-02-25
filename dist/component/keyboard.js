
import hslToRgb from "../color/hsl-to-rgb.js"
import rgbaToCss from "../color/rgba-to-css.js"
import multiplyExponentialQuotient from "../math/multiply-exponential-quotient.js"
import beautifyFrequency from "../music/beautify-frequency.js"
import { ALTERNATIVE_NOTE_NAMES, Note, findClosestNote, getNote } from "../music/notes.js"
import Component from "./component.js"



export default class Keyboard extends Component {

    static KEYDOWN = 'keydown'
    static KEYUP = 'keyup'
    static KEYBEND = 'keybend'
    static style = 'component/keyboard.css'

    #canvas = document.createElement('canvas')
    #ctx
    
    #keys = 24
    #start = 1/440
    #increment = 1
    #subdivisions = 12

    #value = false
    #width
    #height
    #backgroundColor = hslToRgb({h: 0, s: 0, l: .5})
    #deepColor = hslToRgb({h: 0, s: 0, l: .125})
    #handleColor = hslToRgb({h: 0, s: 0, l: 1})
    #frequency = -1

    #pointers = new Map()

    constructor() {
        super()
        this.intitialized = false
        this.#canvas.setAttribute("draggable", false)
        this.#canvas.setAttribute("width", 60)
        this.#canvas.setAttribute("height", 60)
        this.#ctx = this.#canvas.getContext("2d")
        this.observe(this.shadowRoot.host)
        this.shadowRoot.append(this.#canvas)

        this.#init()
    }

    async #init() {
        await this.appendStyleLink(Keyboard.style)
        this.#canvas.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.addEventListener("pointermove", this.binding(this.#onPointerMove))
        this.#canvas.addEventListener("pointerup", this.binding(this.#onPointerUp))
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
        if (e.button != 0) return
        e.preventDefault()
        
        this.#pointers.set(e.pointerId, {
            pointerId: e.pointerId,
            downPosition: this.#eventToCanvas(e),
            keydown: this.#keyFromEvent(e),
            bend: 0,
            pressure: 0
        })
        this.#canvas.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                Keyboard.KEYDOWN, 
                {
                    composed: true,
                    detail: this.#pointers.get(e.pointerId)
                }
            )
        )
    }
    
    #onPointerUp(e) {
        this.#canvas.releasePointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                Keyboard.KEYUP, 
                {
                    composed: true,
                    detail: this.#pointers.get(e.pointerId)
                }
            )
        )
        this.#pointers.delete(e.pointerId)
    }

    #onPointerMove(e) {
        if (this.#pointers.has(e.pointerId)) {
            const pointer = this.#pointers.get(e.pointerId)
            const epos = this.#eventToCanvas(e)
            const deltaX = epos.x - pointer.downPosition.x 
            const deltaY = epos.y - pointer.downPosition.y
            pointer.bend = deltaX / this.keyWidth
            pointer.pressure = deltaY / this.keyHeight * 2
            this.dispatchEvent(
                new CustomEvent(
                    Keyboard.KEYBEND, 
                    {
                        composed: true,
                        detail: this.#pointers.get(e.pointerId)
                    }
                )
            )
        }
    }

    #eventToCanvas(e) {
        const rect = this.#canvas.getBoundingClientRect()
        return  {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    #keyFromEvent(e) {
        const pos = this.#eventToCanvas(e)
        const absolute = pos.x/this.keyWidth
        const index = Math.floor(absolute)
        const note = this.#getNoteByIndex(index)
        return {
            index,
            absolute,
            ...note
        }
    }

    set frequency(value) {
        this.#frequency = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get frequency() {
        return this.#frequency
    }

    set value(value) {
        this.#value = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get value() {
        return this.#value
    }

    get keyWidth() {
        return this.#width / this.#keys
    }

    get keyHeight() {
        return this.#height
    }

    set keys(value) {
        this.#keys = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }

    get keys() {
        return this.#keys
    }

    set start(value) {
        this.#start = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get start() {
        return this.#start
    }

    set subdivisions(value) {
        this.#subdivisions = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get subdivisions() {
        return this.#subdivisions
    }

    set increment(value) {
        this.#increment = value
        this.addToRenderQueue(this.binding(this.#renderCanvas))
    }
    
    get increment() {
        return this.#increment
    }

    #calculate() {
        this.addToRenderQueue(this.binding(this.#renderCanvas))
        
    }

    #getNoteByIndex(index) {
        let freq = multiplyExponentialQuotient(1/this.#start, {n: index*this.#increment, o: this.#subdivisions})
        return getNote(freq)
    }

    #renderCanvas() {
        if (this.#canvas.width != this.#width) this.#canvas.width = this.#width
        if (this.#canvas.height != this.#height) this.#canvas.height = this.#height

        this.#ctx.clearRect(0, 0, this.#width, this.#height)

        let keyW = this.keyWidth

        this.#ctx.save()
        this.#ctx.font = "9px sans-serif"
        const showFreq = (this.#ctx.measureText("2.222 kHz").width < keyW - 4)? true: false
        const showNote = (this.#ctx.measureText("D#9").width < keyW - 4)?true: false
        this.#ctx.restore()
        
        let highlight = -1
        if (this.#frequency > 0) {

            const closest = new Note(findClosestNote(this.#frequency))
            if (Math.abs(closest.match - this.#frequency) < .001) {
                highlight = closest.index
            }
        }

        for (let i=0; i<this.#keys; i++) {
            const note = this.#getNoteByIndex(i)
            let col = rgbaToCss(this.#handleColor)
            let highlightColor = rgbaToCss(this.#deepColor)
            let name = ''
            if (note.precision === Note.EQ) {
                if (note.color) {
                    highlightColor = rgbaToCss(this.#handleColor)
                    col = rgbaToCss(this.#deepColor)
                }
               
                name = `${note.name.toUpperCase()}${note.octave}`
            } else {
                name = ALTERNATIVE_NOTE_NAMES[(i%this.#subdivisions)]
            }
            

            this.#ctx.save()
            this.#ctx.beginPath();
            let x = i*keyW+1
            let y = 0
            let w = keyW-2
            let h = this.#height
            
            this.#ctx.fillStyle = col
            this.#ctx.rect(x, y, w, h)
            this.#ctx.fill()
            this.#ctx.restore()

            if (showNote) {
                this.#ctx.save()
                this.#ctx.fillStyle = rgbaToCss(this.#backgroundColor)
                this.#ctx.font = "9px sans-serif"
                this.#ctx.textBaseline = "middle"
                this.#ctx.textAlign = "center"
                this.#ctx.fillText(name, (x+w/2)|0, (y+h-10)|0)
                this.#ctx.restore()
            }

            if ( showFreq) { 
                let freqObj = beautifyFrequency(note.frequency)
                let freqStr = `${freqObj.value} ${freqObj.unit}`
                this.#ctx.save()
                this.#ctx.fillStyle = rgbaToCss(this.#backgroundColor)
                this.#ctx.font = "9px sans-serif"
                this.#ctx.textBaseline = "middle"
                this.#ctx.textAlign = "center"
                this.#ctx.fillText(freqStr, (x+w/2)|0, (y+h-20)|0)
                this.#ctx.restore()
            }

           
            if (Math.abs(note.frequency - this.#frequency) < .01 || highlight === note.index) {
                this.#ctx.save()
                this.#ctx.beginPath()
                this.#ctx.fillStyle = highlightColor
                this.#ctx.rect(x + 3, y + 3, w - 6, 4)
                this.#ctx.fill()
                this.#ctx.restore()
            }
        }
    }

    destroy() {
        this.#canvas.removeEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#canvas.removeEventListener("pointermove", this.binding(this.#onPointerMove))
        this.#canvas.removeEventListener("pointerup", this.binding(this.#onPointerUp))
        super.destroy()
    }

}