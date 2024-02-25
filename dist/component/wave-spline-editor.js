import watch from "../glue/watch.js"
import Component from "./component.js"
import Button from "./button.js"
import BarDriver from "./rotary-driver/bar-driver.js"
import ExponentDriver from "./rotary-driver/exponent-driver.js"
import FractionDriver from "./rotary-driver/fraction-driver.js"
import FrequencyDriver from "./rotary-driver/frequency-driver.js"
import GainDriver from "./rotary-driver/gain-driver.js"
import GridDriver from "./rotary-driver/grid-driver.js"
import NoteDriver from "./rotary-driver/note-driver.js"
import QuantizeDriver from "./rotary-driver/quantize-driver.js"
import TimeDriver from "./rotary-driver/time-driver.js"
import RotaryGroup from "./rotary-group.js"
import WaveSplineGraph from "./wave-spline-graph.js"

export default class WaveSplineEditor extends Component {

    static CHANGE = 'change'
    static style = 'component/wave-spline-editor.css'

    #waveSplineOscillator
    #waveSplineGraph = WaveSplineGraph.create()

    #container = document.createElement('div')
    #viewContainer = document.createElement('div')
    #waveSplineContainer = document.createElement('div')
    #tempoLock = Button.create()
    #frequency = RotaryGroup.create()
    #exponentRotary = RotaryGroup.create()
    #phaseShiftRotary = RotaryGroup.create()
    #transformCenterRotary = RotaryGroup.create()
    #transformRangeRotary = RotaryGroup.create()
    #viewZoomRotary = RotaryGroup.create()
    #viewPositionRotary = RotaryGroup.create()
    #quantizeXRotary = RotaryGroup.create()
    #quantizeYRotary = RotaryGroup.create()
    #gridXRotary = RotaryGroup.create()
    #gridYRotary = RotaryGroup.create()
    #settings

    #frequencyFractionDriver = new FractionDriver()
    #frequencyBarDriver = new BarDriver()

    constructor() {
        super()
        this.intitialized = false
        this.#frequency.drivers = [
            new FrequencyDriver(), 
            new NoteDriver(),
            new TimeDriver(),
            this.#frequencyFractionDriver,
            this.#frequencyBarDriver
        ]
        
        this.#exponentRotary.drivers = [
            new ExponentDriver()
        ]
        this.#phaseShiftRotary.drivers = [
            new GainDriver({name: "Phase offset"})
        ]
        this.#viewZoomRotary.drivers = [
            new GainDriver({name: "View Zoom"})
        ]
        this.#viewPositionRotary.drivers = [
            new GainDriver({name: "View Position"})
        ]

        this.#transformCenterRotary.drivers = [
            new GainDriver({name:"Scale Center"})
        ]
        this.#transformRangeRotary.drivers = [
            new GainDriver({name:"Scale Range"})
        ]
        this.#gridXRotary.drivers = [
            new GridDriver({name:"Horizontal Grid"})
        ]
        this.#gridYRotary.drivers = [
            new GridDriver({name:"Vertical Grid"})
        ]
        this.#quantizeXRotary.drivers = [
            new QuantizeDriver({name:"Quantize Time"})
        ]
        this.#quantizeYRotary.drivers = [
            new QuantizeDriver({name:"Quantize Amplitude"})
        ]

        this.#viewContainer.classList.add("settings-container")
        this.#viewContainer.append(this.#viewZoomRotary)
        this.#viewContainer.append(this.#viewPositionRotary)
        this.#viewContainer.append(this.#gridXRotary)
        this.#viewContainer.append(this.#gridYRotary)
        this.shadowRoot.append(this.#viewContainer)

        this.#waveSplineContainer.classList.add("wave-spline-container")
        this.#waveSplineContainer.append(this.#waveSplineGraph)
        this.shadowRoot.append(this.#waveSplineContainer)

        this.#container.classList.add("settings-container")
        this.shadowRoot.append(this.#container)

        this.#tempoLock.header = "Tempo"
        this.#tempoLock.label = "Sync"
        this.#tempoLock.footer = ""
        this.#tempoLock.mode = "toggle"
        this.#tempoLock.addEventListener(Button.UP, this.binding(this.#onTempoLockClick))
        this.#container.append(this.#tempoLock)

        this.#container.append(this.#frequency)

        this.#container.append(this.#exponentRotary)
        this.#container.append(this.#transformCenterRotary)
        this.#container.append(this.#transformRangeRotary)
        
        this.#container.append(this.#phaseShiftRotary)
    
        this.#container.append(this.#quantizeXRotary)
        this.#container.append(this.#quantizeYRotary)

        this.#frequency.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onFrequencyChange))
        this.#frequency.addEventListener(RotaryGroup.DRIVER_CHANGE, this.binding(this.#onFrequencyDriverChange))

        this.#transformCenterRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onTransformCenterChange))
        this.#transformRangeRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onTransformRangeChange))

        this.#exponentRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onExponentRotaryChange))
        this.#phaseShiftRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onPhaseShiftChange))
        this.#viewZoomRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onViewZoomChange))
        this.#viewPositionRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onViewPositionChange))
        this.#quantizeXRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onQuantizeXRotaryChange))
        this.#quantizeYRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onQuantizeYRotaryChange))
        this.#gridXRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onGridXRotaryChange))
        this.#gridYRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onGridYRotaryChange))
        watch(this, "waveSplineOscillator", this.binding(this.#onWaveSplineOscillatorChange))
        watch(this, "settings", this.binding(this.#onSettingsChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(WaveSplineEditor.style)
        this.intitialized = true
    }

    #onTempoLockClick(e) {
        this.#waveSplineOscillator.tempoSync = !this.#waveSplineOscillator.tempoSync
    }

    #onFrequencyChange(e) {
        this.#waveSplineOscillator.length = this.#frequency.value
    }

    #onTransformCenterChange(e) {
        this.#waveSplineOscillator.wave.transformCenter.x = this.#transformCenterRotary.value
    }

    #onTransformRangeChange(e) {
        this.#waveSplineOscillator.wave.transformRange.x = this.#transformRangeRotary.value
    }

    #onPhaseShiftChange(e) {
        this.#waveSplineOscillator.phaseShift = this.#phaseShiftRotary.value
    }

    #onViewZoomChange(e) {
        this.#waveSplineOscillator.wave.viewZoom = this.#viewZoomRotary.value
    }

    #onViewPositionChange(e) {
        this.#waveSplineOscillator.wave.viewPosition = this.#viewPositionRotary.value
    }

    #onFrequencyDriverChange(e) {
        this.#waveSplineOscillator.lengthDriver = this.#frequency.driver
    }

    #onExponentRotaryChange(e) {
        this.#waveSplineOscillator.wave.e = this.#exponentRotary.value
    }

    #onQuantizeXRotaryChange(e) {
        this.#waveSplineOscillator.wave.quantizeX = this.#quantizeXRotary.value
    }

    #onQuantizeYRotaryChange(e) {
        this.#waveSplineOscillator.wave.quantizeY = this.#quantizeYRotary.value
    }

    #onGridXRotaryChange(e) {
        this.#waveSplineOscillator.wave.gridX = this.#gridXRotary.value
    }

    #onGridYRotaryChange(e) {
        this.#waveSplineOscillator.wave.gridY = this.#gridYRotary.value
    }

    set zero(value) {
        this.#waveSplineGraph.zero = value
    }

    get zero() {
        return this.#waveSplineGraph.zero 
    }

    set minYLabel(value) {
        this.#waveSplineGraph.minYLabel = value
    }

    get minYLabel() {
        return this.#waveSplineGraph.minYLabel 
    }

    set maxYLabel(value) {
        this.#waveSplineGraph.maxYLabel = value
    }

    get maxYLabel() {
        return this.#waveSplineGraph.maxYLabel 
    }

    set maxXLabel(value) {
        this.#waveSplineGraph.maxXLabel = value
    }

    get maxXLabel() {
        return this.#waveSplineGraph.maxXLabel 
    }

    set waveSplineOscillator(value) {
        this.#waveSplineOscillator = value
    }

    get waveSplineOscillator() {
        return this.#waveSplineOscillator
    }

    set settings(value) {
        this.#settings = value
    }

    get settings() {
        return this.#settings
    }

    #onSettingsChange(signal) {
        this.#frequencyBarDriver.tempo = this.#settings.tempo
        this.#frequencyFractionDriver.tempo = this.#settings.tempo
        this.#update()
    }

    #onWaveSplineOscillatorChange(signal) {
        if (signal.path[0].property === "phase") this.#updatePlayhead()
        else this.#update()
    }

    #updatePlayhead() {

        if (this.#waveSplineOscillator.length > 0.5 ) {
            this.#waveSplineGraph.playhead = (this.#waveSplineOscillator.phase + this.#waveSplineOscillator.phaseShift) % 1
        } else {
            this.#waveSplineGraph.playhead = -1
        }

    }

    #update() {
        if (this.#waveSplineOscillator && this.#waveSplineOscillator.wave) {

            this.#tempoLock.label = this.#waveSplineOscillator.tempoSync ? "Sync":"Free"

            this.#frequency.value = this.#waveSplineOscillator.length
            this.#frequency.driver = this.#waveSplineOscillator.lengthDriver
            this.#waveSplineGraph.waveSpline = this.#waveSplineOscillator.wave
            this.#exponentRotary.value = this.#waveSplineOscillator.wave.e
            this.#phaseShiftRotary.value = this.#waveSplineOscillator.phaseShift
            this.#viewZoomRotary.value = this.#waveSplineOscillator.wave.viewZoom
            
            this.#viewPositionRotary.value = this.#waveSplineOscillator.wave.viewPosition
            this.#transformCenterRotary.value = this.#waveSplineOscillator.wave.transformCenter.x
            this.#transformRangeRotary.value = this.#waveSplineOscillator.wave.transformRange.x
            this.#quantizeXRotary.value = this.#waveSplineOscillator.wave.quantizeX
            this.#quantizeYRotary.value = this.#waveSplineOscillator.wave.quantizeY
            this.#gridXRotary.value = this.#waveSplineOscillator.wave.gridX
            this.#gridYRotary.value = this.#waveSplineOscillator.wave.gridY

            this.addToRenderQueue(this.binding(this.#updateDOM))
        }

    }
    #updateDOM() {
        if (this.#waveSplineOscillator.wave.viewZoom == 1 && this.#viewPositionRotary.parentElement) {
            this.#viewPositionRotary.remove()
        } else if (this.#waveSplineOscillator.wave.viewZoom != 1 && !this.#viewPositionRotary.parentElement) {
            this.#viewContainer.insertBefore(this.#viewPositionRotary,this.#gridXRotary)
        }

        if (!this.#waveSplineOscillator.sx && this.#transformCenterRotary.parentElement) {
            this.#transformCenterRotary.remove()
        } else if (this.#waveSplineOscillator.sx && !this.#transformCenterRotary.parentElement) {
            this.#container.insertBefore(this.#transformCenterRotary, this.#quantizeXRotary)
        }

        if (!this.#waveSplineOscillator.sx && this.#transformRangeRotary.parentElement) {
            this.#transformRangeRotary.remove()
        } else if (this.#waveSplineOscillator.sx && !this.#transformRangeRotary.parentElement) {
            this.#container.insertBefore(this.#transformRangeRotary, this.#quantizeXRotary)
        }

    }
}