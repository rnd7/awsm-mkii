
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Component from "./component.js"
import WaveSplineEditor from "./wave-spline-editor.js"
import Voice from "../model/voice.js"
import RotaryGroup from "./rotary-group.js"
import TimeDriver from "./rotary-driver/time-driver.js"
import GainDriver from "./rotary-driver/gain-driver.js"
import beautifyTime from "../music/beautify-time.js"
import Button from "./button.js"

export default class VoiceEditor extends Component {

    static ZERO = 'zero'
    static KILL = 'kill'
    static CHANGE = 'change'
    static SOLO = 'solo'
    static style = 'component/voice-editor.css'

    #content = document.createElement('div')

    #waveSplineEditor = WaveSplineEditor.create()

    #stateToggle = Button.create()
    #zeroButton = Button.create()
    #soloToggle = Button.create()
    #gainRotary = RotaryGroup.create()
    #attackEditor = RotaryGroup.create() // RampEditor.create()
    #releaseEditor = RotaryGroup.create()// RampEditor.create()

    #voice

    constructor() {
        super()
        this.intitialized = false

        this.#soloToggle.header = "Bus"
        this.#soloToggle.mode = "toggle"
        this.shadowRoot.append(this.#soloToggle)
        this.#soloToggle.addEventListener(Button.UP, this.binding(this.#onSoloToggle))

        this.#stateToggle.header = "State"
        this.#stateToggle.mode = "toggle"
        this.shadowRoot.append(this.#stateToggle)
        this.#stateToggle.addEventListener(Button.UP, this.binding(this.#onStateToggle))

        this.#zeroButton.header = "Phase"
        this.#zeroButton.label = "zero"
        this.#zeroButton.mode = "toggle"
        this.shadowRoot.append(this.#zeroButton)
        this.#zeroButton.addEventListener(Button.UP, this.binding(this.#onZeroClick))

        this.#gainRotary.drivers = [
            new GainDriver({name: "Gain"})
        ]
        this.shadowRoot.append(this.#gainRotary)
        this.#gainRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onGainChange))

        this.#attackEditor.drivers = [
            new TimeDriver({name: "Attack"})
        ]
        this.shadowRoot.append(this.#attackEditor)
        this.#attackEditor.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onAttackChange))

        this.#releaseEditor.header = "Release"
        this.#releaseEditor.drivers = [
            new TimeDriver({name: "Release"})
        ]

        this.#releaseEditor.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onReleaseChange))
        this.shadowRoot.append(this.#releaseEditor)
        
        this.#waveSplineEditor.zero = 0.5
        this.#waveSplineEditor.minYLabel = -1
        this.#waveSplineEditor.maxYLabel = 1
        this.shadowRoot.append(this.#waveSplineEditor)
        watch(this, "voice", this.binding(this.#onVoiceChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(VoiceEditor.style)
        this.intitialized = true
        this.#update()
        this.#updateTime()
    }

    #onZeroClick(e) {
        this.dispatchEvent(
            new CustomEvent(
                VoiceEditor.ZERO, 
                {
                    composed: true,
                    detail: this.#voice.id
                }
            )
        )
    }

    #onGainChange(e) {
        this.#voice.gain = this.#gainRotary.value
    }

    #onAttackChange(e) {
        this.#voice.attack = this.#attackEditor.value
    }

    #onReleaseChange(e) {
        this.#voice.release = this.#releaseEditor.value
    
    }
    
    #onSoloToggle(e) {
        this.dispatchEvent(
            new CustomEvent(
                VoiceEditor.SOLO, 
                {
                    detail: this.#voice.id,
                    composed: true
                }
            )
        )
    }

    #onStateToggle(e) {
        if (
            this.#voice.state === Voice.ATTACK
            || this.#voice.state === Voice.SUSTAIN
        ) {
            this.#voice.state = Voice.TRIGGER_RELEASE
        } else if (
            this.#voice.state === Voice.RELEASE
            || this.#voice.state === Voice.IDLE
        ) {
            this.#voice.state = Voice.TRIGGER_ATTACK
        }
    }

    get voice() {
        return this.#voice
    }
    
    set voice(value) {
        this.#voice = value
    }

    set settings(value) {
        this.#waveSplineEditor.settings = value
    }
    
    #onVoiceChange(signal) {
        if (signal.path[0].property === "phase") return
        if (signal.path.length == 1) this.#update()
        if (signal.path.length >= 2) this.#updateTime()
        
    }

    #updateTime() {
        const time = beautifyTime(this.#voice.oscillator.length * this.#voice.oscillator.wave.viewZoom)
        this.#waveSplineEditor.maxXLabel = `${time.value} ${time.unit}`
    }

    #update() {
        if (this.#voice) {
            if (this.#voice.bus === "solo") {
                this.#soloToggle.label = "solo"
                this.#soloToggle.mode = "solo"
            } else {
                this.#soloToggle.label = "mix"
                this.#soloToggle.mode = "toggle"
            }
            this.#stateToggle.label = this.#voice.state
            //this.#oscillatorEditor.path = this.#voice.path
            this.#waveSplineEditor.waveSplineOscillator = this.#voice.oscillator

            this.#gainRotary.value = this.#voice.gain
            this.#attackEditor.value = this.#voice.attack
            this.#releaseEditor.value = this.#voice.release
            this.#content.classList.remove("hidden")
        } else {
            this.#content.classList.add("hidden")
        }
    }

    destroy() {
        unwatch(this, "voice")
        this.#waveSplineEditor.destroy()
        this.#attackEditor.destroy()
        this.#releaseEditor.destroy()
        super.destroy()
    }

}