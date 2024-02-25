import watch from "../glue/watch.js"
import KeyboardSettings from "../model/keyboard-settings.js"
import Component from "./component.js"
import Keyboard from "./keyboard.js"

export default class KeyboardGroup extends Component {

    static CHANGE = 'change'
    static style = 'component/keyboard-group.css'
    #keyboard = Keyboard.create()
    #statusEl = document.createElement('div')
    #session

    constructor() {
        super()
        this.intitialized = false
        this.#statusEl.classList.add("status")
        this.shadowRoot.append(this.#statusEl)
        this.shadowRoot.append(this.#keyboard)
        watch(this, "session", this.binding(this.#onSessionChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(KeyboardGroup.style)
        this.intitialized = true
        this.#update()
    }

    #onSessionChange(signal) {
        if (
            signal.property === "activeView"
            || signal.path[0].property === "path"
            || signal.path[0].property === "length"
            || signal.path[0].origin instanceof KeyboardSettings
            || signal.path[0].property === "keyboardFocus"
        ) this.#update()
    }

    set session(value) {
        this.#session = value 
        this.#update() 
    }

    get session() {
        return this.#session
    }


    #getOscillatorName(oscillator) {
        switch (oscillator) {
            case "am":
                return "AM"
            case "fm":
                return "FM"
            case "transpose":
                return "Pitch"
            case "em":
                return "Exponent"
            case "sx":
                return "Scale"   
            case "gain":
            default:
                return "Gain"   
        }
    }

    #update() {
        if (!this.#session) return
        this.#keyboard.start = this.#session.keyboardSettings.start
        this.#keyboard.keys = this.#session.keyboardSettings.keys
        this.#keyboard.subdivisions = this.#session.keyboardSettings.subdivisions

        const validPath = this.#session.getValidSubpath(this.#session.keyboardFocus)

        const status = []
        if ( validPath.length>=2) {
            const ref = this.#session.getPathReference(validPath)
            if (ref.length) this.#keyboard.frequency = 1/ref.length
            else if (ref.oscillator && ref.oscillator.length) this.#keyboard.frequency = 1/ref.oscillator.length
            else this.#keyboard.frequency = 0
            const path = []
            status.push(this.#session.name)
            let pref = this.#session
            for(let i = 0; i<validPath.length; i++) {
                if (i == 0) {
                    pref = pref.findChannel(validPath[i])
                    status.push(pref.name)
                } else if (i == 1) {
                    pref = pref.findVoice(validPath[i])
                    status.push(pref.name)
                    if (pref) pref = pref.oscillator
                } else {
                    pref = pref[validPath[i]]
                    status.push(this.#getOscillatorName(validPath[i]))
                }
            }
    
        }
        if (status.length) this.#statusEl.textContent = `Keyboard focus: ${status.join(" / ")}`
        else this.#statusEl.textContent = `Keyboard focus: none`
    }

    destroy() {
        super.destroy()
    }
}