import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Dynamics from "../model/dynamics.js"
import Component from "./component.js"
import MetricsDisplay from "./metrics-display.js"
import Button from "./button.js"
import GainDriver from "./rotary-driver/gain-driver.js"
import RotaryGroup from "./rotary-group.js"
import VoiceEditor from "./voice-editor.js"

export default class ChannelEditor extends Component {

    static CHANGE = 'change'
    static ZERO = 'zero'
    static style = 'component/channel-editor.css'

    #voiceEditor = VoiceEditor.create()

    #zeroButton = Button.create()
    #gainRotary = RotaryGroup.create()
    #metricsDisplay = MetricsDisplay.create()
    #potentialRotary = RotaryGroup.create()
    #thresholdRotary = RotaryGroup.create()
    #scaleRotary = RotaryGroup.create()
    
    #channel

    constructor() {
        super()
        this.intitialized = false

        this.#zeroButton.header = "Phase"
        this.#zeroButton.label = "zero"
        this.#zeroButton.mode = "toggle"
        this.shadowRoot.append(this.#zeroButton)
        this.#zeroButton.addEventListener(Button.UP, this.binding(this.#onZeroClick))

        this.shadowRoot.append(this.#metricsDisplay)


        this.#gainRotary.drivers = [
            new GainDriver()
        ]
        this.shadowRoot.append(this.#gainRotary)

        this.#potentialRotary.drivers = [
            new GainDriver({name:"Potential"})
        ]
        this.shadowRoot.append(this.#potentialRotary)


        this.#thresholdRotary.drivers = [
            new GainDriver({name: "Squeeze Threshold"})
        ]
        this.shadowRoot.append(this.#thresholdRotary)


        this.#scaleRotary.drivers = [
            new GainDriver({name: "Squeeze Scale", max: 4})
        ]
        this.shadowRoot.append(this.#scaleRotary)





        watch(this, "channel", this.binding(this.#onChannelChange))
        this.#init()
    }

    #onZeroClick(e) {
        this.dispatchEvent(
            new CustomEvent(
                ChannelEditor.ZERO, 
                {
                    composed: true,
                    detail: this.#channel.id
                }
            )
        )
    }

    async #init() {
        await this.appendStyleLink(ChannelEditor.style)
        this.#gainRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onGainChange))
        this.#potentialRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onPotentialChange))
        this.#thresholdRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onThresholdChange))
        this.#scaleRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onScaleChange))
        
        this.intitialized = true
    }

    #onThresholdChange(e) {
        this.#channel.dynamics.threshold = this.#thresholdRotary.value
    }

    #onPotentialChange(e) {
        this.#channel.dynamics.potential = this.#potentialRotary.value
    }

    #onScaleChange(e) {
        this.#channel.dynamics.scale = this.#scaleRotary.value
    }


    #onGainChange(e) {
        this.#channel.gain = this.#gainRotary.value
    }

    get channel() {
        return this.#channel
    }
    
    set channel(value) {
        this.#channel = value
        this.#metricsDisplay.audioMetrics = this.#channel.audioMetrics
        this.#update()
    }

    set settings(value) {
        this.#voiceEditor.settings = value
    }


    #onChannelChange(signal) {
        if (
            signal.path[0].origin instanceof Dynamics
            || signal.path.length == 1
        ) this.#update()
        
    }

    #update() {
        if (this.#channel) {
            const voice = this.#channel.voices.find(voice => voice.id === this.#channel.activeVoice)
            this.#voiceEditor.voice = voice
            this.#potentialRotary.value = this.#channel.dynamics.potential
            this.#thresholdRotary.value = this.#channel.dynamics.threshold
            this.#scaleRotary.value = this.#channel.dynamics.scale
        }
       
        this.#gainRotary.value = this.#channel.gain
    
    }

    destroy() {
        unwatch(this, "channel", this.binding(this.#onChannelChange))
        super.destroy()

    }

}