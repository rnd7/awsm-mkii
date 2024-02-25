
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Dynamics from "../model/dynamics.js"
import Button from "./button.js"
import Component from "./component.js"
import MetricsDisplay from "./metrics-display.js"
import MultiPoleFader from "./multi-pole-fader.js"
import GainDriver from "./rotary-driver/gain-driver.js"
import RotaryGroup from "./rotary-group.js"

export default class SessionMix extends Component {

    static CHANGE = 'change'
    static style = 'component/session-mix.css'


    #soloToggle = Button.create()
    #metricsDisplay = MetricsDisplay.create()
    #channelMix = MultiPoleFader.create()
    #gainRotary = RotaryGroup.create()
    #potentialRotary = RotaryGroup.create()
    #thresholdRotary = RotaryGroup.create()
    #scaleRotary = RotaryGroup.create()
    #session
    

    constructor() {
        super()
        this.intitialized = false

        this.#soloToggle.header = "Solo"
        this.#soloToggle.mode = "toggle"
        this.shadowRoot.append(this.#soloToggle)
        this.#soloToggle.addEventListener(Button.UP, this.binding(this.#onSoloToggle))

        this.shadowRoot.append(this.#metricsDisplay)

        this.#channelMix.addEventListener(MultiPoleFader.CHANGE, this.binding(this.#onMixChange))
        this.shadowRoot.append(this.#channelMix)

        this.#gainRotary.drivers = [
            new GainDriver({name:"Main Volume"})
        ]
        this.shadowRoot.append(this.#gainRotary)

        /*this.#potentialRotary.drivers = [
            new GainDriver({name:"Potential"})
        ]
        this.shadowRoot.append(this.#potentialRotary)*/


        this.#thresholdRotary.drivers = [
            new GainDriver({name: "Squeeze Threshold"})
        ]
        this.shadowRoot.append(this.#thresholdRotary)


        this.#scaleRotary.drivers = [
            new GainDriver({name: "Squeeze Scale", max: 4})
        ]
        this.shadowRoot.append(this.#scaleRotary)



        watch(this, "session", this.binding(this.#onSessionChange))
        this.#init()
    }

    #onSoloToggle(e) {
        this.#session.voiceSolo("")
    }

    #onGainChange(e) {
        this.#session.main = this.#gainRotary.value
    }

    #onPotentialChange(e) {
        this.#session.dynamics.potential = this.#potentialRotary.value
    }
    #onThresholdChange(e) {
        this.#session.dynamics.threshold = this.#thresholdRotary.value
    }
    #onScaleChange(e) {
        this.#session.dynamics.scale = this.#scaleRotary.value
    }

    #onMixChange(e) {
        
        this.#session.channelMix.x = this.#channelMix.position.x
        this.#session.channelMix.y = this.#channelMix.position.y
        
    }


    async #init() {
        await this.appendStyleLink(SessionMix.style)

        this.#gainRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onGainChange))
        this.#potentialRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onPotentialChange))
        this.#thresholdRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onThresholdChange))
        this.#scaleRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onScaleChange))
        this.intitialized = true
    }

    get session() {
        return this.#session
    }
    
    set session(value) {
        this.#session = value
        this.#metricsDisplay.audioMetrics = this.#session.audioMetrics
        this.#update()
    }

    #onSessionChange(signal) {
        if (
            signal.path[0].origin instanceof Dynamics
            || signal.path.length == 1
        ) this.#update()
    }

    #update() {
        this.#gainRotary.value = this.#session.main
        this.#channelMix.poles = this.#session.channels.length
        this.#channelMix.position.x = this.#session.channelMix.x
        this.#channelMix.position.y = this.#session.channelMix.y
        this.#potentialRotary.value = this.#session.dynamics.potential
        this.#scaleRotary.value = this.#session.dynamics.scale
        this.#thresholdRotary.value = this.#session.dynamics.threshold
        if (this.#session.solo === "") {
            this.#soloToggle.label = "off"
            this.#soloToggle.mode = "inactive"
        } else {
            this.#soloToggle.label = "on"
            this.#soloToggle.mode = "solo"
        }

    
    }

    destroy() {
        unwatch(this, "session", this.binding(this.#onSessionChange))
        super.destroy()

    }

}