import watch from "../glue/watch.js"
import beautifyTime from "../music/beautify-time.js"
import Component from "./component.js"
import FMEditor from "./fm-editor.js"
import Button from "./button.js"
import WaveSplineEditor from "./wave-spline-editor.js"

export default class OscillatorEditor extends Component {
    
    static ZERO = 'zero'
    static style = 'component/oscillator-editor.css'
    #last
    #parent
    #reference 
    #settings
    #zeroButton = Button.create()
    #waveSplineContainer = document.createElement('div')
    #waveSplineEditor = WaveSplineEditor.create()
    #fmEditor = FMEditor.create()

    constructor() {
        super()
        this.intitialized = false

        this.#zeroButton.header = "Phase"
        this.#zeroButton.label = "zero"
        this.#zeroButton.mode = "toggle"
        this.shadowRoot.append(this.#zeroButton)
        this.#zeroButton.addEventListener(Button.UP, this.binding(this.#onZeroClick))

        this.#waveSplineContainer.append(this.#waveSplineEditor)
        this.shadowRoot.append(this.#waveSplineContainer)

        watch(this, "reference", this.binding(this.#onReferenceChange))
        watch(this, "settings", this.binding(this.#onSettingsChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(OscillatorEditor.style)
        this.intitialized = true
    }

    #onZeroClick(e) {
        this.dispatchEvent(
            new CustomEvent(
                OscillatorEditor.ZERO, 
                {
                    composed: true,
                    detail: this.#reference.id
                }
            )
        )
    }

    set last(value) {
        this.#last = value
        this.#update()
    }

    get last() {
        return this.#last
    }

    set parent(value) {
        this.#parent = value
        this.#update()
    }

    get parent() {
        return this.#parent
    }

    set reference(value) {
        this.#reference = value
    }

    get reference() {
        return this.#reference
    }

    set settings(value) {
        this.#settings = value
    }

    get settings() {
        return this.#settings
    }

    #onReferenceChange(signal) {
        if (signal.path.length && signal.path[0].property === "phase") return
        if (signal.path.length == 1 || signal.path[0].property == "viewZoom") this.#update()
    }

    #onSettingsChange(signal) {
        if (signal.path.length == 1) this.#update()
    }

    #update() {
        if (!this.#reference || !this.#parent) return
        let last = this.#last // validPath.slice(-1)[0]
        let parent = this.#parent // this.#session.getPathReference(validPath.slice(0,-1))
        const ref = this.#reference // this.#session.getPathReference(validPath)

        if (last === "fm") this.#fmEditor.waveSplineOscillator = parent
        if (last === "fm") {
            if (!this.#fmEditor.parentElement) {
                // add fm control
                this.#waveSplineContainer.insertBefore(this.#fmEditor, this.#waveSplineEditor)
            }
        } else {
            if (this.#fmEditor.parentElement) {
                this.#fmEditor.remove()
            }
        }

        if (last === "fm") {
            this.#waveSplineEditor.zero = 0.5
            this.#waveSplineEditor.minYLabel = -1
            this.#waveSplineEditor.maxYLabel = 1
        } else if (last === "transpose") {
            this.#waveSplineEditor.zero = 0.5
            this.#waveSplineEditor.minYLabel = -1
            this.#waveSplineEditor.maxYLabel = 1
        } else if (last === "am") {
            this.#waveSplineEditor.zero = 0.5
            this.#waveSplineEditor.minYLabel = -1
            this.#waveSplineEditor.maxYLabel = 1
        } else if (last === "em") {
            this.#waveSplineEditor.zero = 0
            this.#waveSplineEditor.minYLabel = 0
            this.#waveSplineEditor.maxYLabel = 1
        } else if (last === "sx") {
            this.#waveSplineEditor.zero = 0
            this.#waveSplineEditor.minYLabel = 0
            this.#waveSplineEditor.maxYLabel = 1
        } else if (last === "gain") {
            this.#waveSplineEditor.zero = 0 
            this.#waveSplineEditor.minYLabel = 0
            this.#waveSplineEditor.maxYLabel = 1
            
        }
        const time = beautifyTime(ref.length * ref.wave.viewZoom)
        this.#waveSplineEditor.maxXLabel = `${time.value} ${time.unit}`
        this.#waveSplineEditor.waveSplineOscillator = ref
        this.#waveSplineEditor.settings = this.#settings
    }

}