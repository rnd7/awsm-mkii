
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Dynamics from "../model/dynamics.js"
import Session from "../model/session.js"
import SessionMix from "./session-mix.js"
import Component from "./component.js"
import KeyboardSettingsEditor from "./keyboard-settings-editor.js"
import Button from "./button.js"
import BeatDriver from "./rotary-driver/beat-driver.js"
import BPMDriver from "./rotary-driver/bpm-driver.js"
import RotaryGroup from "./rotary-group.js"

export default class SessionEditor extends Component {
    static SOLO = 'solo'
    static ZERO = 'zero'
    static CHANGE = 'change'
    static style = 'component/session-editor.css'

    
    #stateToggle = Button.create()
    #zeroButton = Button.create()

    #tempo = RotaryGroup.create()
    #channelMix = SessionMix.create()
    #keyboardSettingsEditor = KeyboardSettingsEditor.create()
    #session

    #siblingsToggle = Button.create()
    

    constructor() {
        super()
        this.intitialized = false


        this.#stateToggle.header = "State"
        this.#stateToggle.mode = "toggle"
        this.shadowRoot.append(this.#stateToggle)
        this.#stateToggle.addEventListener(Button.UP, this.binding(this.#onStateToggle))

        this.#zeroButton.header = "Phase"
        this.#zeroButton.label = "zero"
        this.#zeroButton.mode = "toggle"
        this.shadowRoot.append(this.#zeroButton)
        this.#zeroButton.addEventListener(Button.UP, this.binding(this.#onZeroClick))



        this.#tempo.drivers = [
            new BPMDriver(),
            new BeatDriver({name:"Beat length"})
        ]
    
        this.#tempo.addEventListener(RotaryGroup.DRIVER_CHANGE, this.binding(this.#onTempoDriverChange))
        this.shadowRoot.append(this.#tempo)


        this.shadowRoot.append(this.#channelMix)
      
        this.shadowRoot.append(this.#keyboardSettingsEditor)

        

        this.#siblingsToggle.header = "View Navigation"
        this.#siblingsToggle.mode = "toggle"
        this.#siblingsToggle.addEventListener(Button.UP, this.binding(this.#onSiblingsToggle))
        this.shadowRoot.append(this.#siblingsToggle)


        this.#tempo.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onTempoChange))
       

        watch(this, "session", this.binding(this.#onSessionChange))
        this.#init()
    }


    #onTempoChange(e) {
        this.#session.settings.tempo = this.#tempo.value
    }
    #onTempoDriverChange(e) {
        this.#session.settings.tempoDriver = this.#tempo.driver
    }

    #onZeroClick(e) {
        this.dispatchEvent(
            new CustomEvent(
                SessionEditor.ZERO, 
                {
                    composed: true,
                    detail: this.#session.id
                }
            )
        )
    }

    #onStateToggle(e) {
        if (
            this.#session.state === Session.PLAYING
            || this.#session.state === Session.PLAY
            || this.#session.state === Session.TRIGGER_PLAY
        ) {
            this.#session.state = Session.TRIGGER_PAUSE
        } else if (
            this.#session.state === Session.PAUSED
            || this.#session.state === Session.TRIGGER_PAUSE
            || this.#session.state === Session.PAUSE
        ) {
            this.#session.state = Session.TRIGGER_PLAY
        }
    }

    #onSiblingsToggle(e) {
        if (this.#session.navigationMode === Session.COMPACT) {
            this.#session.navigationMode = Session.MULTILINE
        } else if (this.#session.navigationMode === Session.MULTILINE) {
            this.#session.navigationMode = Session.SIBLINGS
        } else {
            this.#session.navigationMode = Session.COMPACT
        }
    }

    async #init() {
        await this.appendStyleLink(SessionEditor.style)
        this.intitialized = true
    }

    set session(value) {
        this.#session = value
        this.#channelMix.session = this.#session
        this.#keyboardSettingsEditor.session = this.#session
        this.#update()
    }

    get session() {
        return this.#session
    }


    #onSessionChange(signal) {
        if (
            signal.path[0].origin instanceof Dynamics
            || signal.path[0].property === "state"
            || signal.path[0].property === "tempo"
            || signal.path[0].property === "tempoDriver"
            || signal.path[0].property === "showSiblings"
        ) this.#update()
    }

    #update() {
        if (this.#session) {
           
            
            if (this.#session.settings.tempoDriver) this.#tempo.driver = this.#session.settings.tempoDriver

           
            this.#stateToggle.label = this.#session.state
            this.#siblingsToggle.label = this.#session.navigationMode
            this.#tempo.value = this.#session.settings.tempo
        }
    
    }

    destroy() {
        unwatch(this, "settings", this.binding(this.#onSessionChange))
        super.destroy()

    }

}