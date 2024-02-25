import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Component from "./component.js"
import RangeDriver from "./rotary-driver/range-driver.js"
import RotaryGroup from "./rotary-group.js"

export default class FMEditor extends Component {

    static CHANGE = 'change'
    static style = 'component/fm-editor.css'


    #fmRangeRotary = RotaryGroup.create()
    #waveSplineOscillator
    

    constructor() {
        super()
        this.intitialized = false
        this.#fmRangeRotary.drivers = [
            new RangeDriver()
        ]
        this.shadowRoot.append(this.#fmRangeRotary)

        this.#fmRangeRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onFMRangeChange))
       
        watch(this, "waveSplineOscillator", this.binding(this.#onWaveSplineOscillatorChange))
        this.#init()
    }

    #onFMRangeChange(e) {
        this.#waveSplineOscillator.fmRange = this.#fmRangeRotary.value
    }

    async #init() {
        await this.appendStyleLink(FMEditor.style)
        this.intitialized = true
    }

    get waveSplineOscillator() {
        return this.#waveSplineOscillator
    }
    
    set waveSplineOscillator(value) {
        this.#waveSplineOscillator = value
        this.#update()
    }

    #onWaveSplineOscillatorChange(signal) {
        if (signal.path[0].property === "phase" || signal.path.length > 1) return
        this.#update()
    }

    #update() {
        this.#fmRangeRotary.value = this.#waveSplineOscillator.fmRange
    }

    destroy() {
        unwatch(this, "waveSplineOscillator", this.binding(this.#onWaveSplineOscillatorChange))
        super.destroy()
    }

}