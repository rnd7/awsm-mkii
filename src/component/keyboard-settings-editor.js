import watch from "../glue/watch.js"
import KeyboardSettings from "../model/keyboard-settings.js"
import Button from "./button.js"
import Component from "./component.js"
import FrequencyDriver from "./rotary-driver/frequency-driver.js"
import KeysDriver from "./rotary-driver/keys-driver.js"
import NoteDriver from "./rotary-driver/note-driver.js"
import SubdivisionDriver from "./rotary-driver/subdivision-driver.js"
import RotaryGroup from "./rotary-group.js"

export default class KeyboardSettingsEditor extends Component {

    static CHANGE = 'change'
    static style = 'component/keyboard-settings-editor.css'

    #keysRotary = RotaryGroup.create()
    #start = RotaryGroup.create()
    #subdivisions = RotaryGroup.create()
    #session

    constructor() {
        super()
        this.intitialized = false

        this.#start.drivers = [
            new NoteDriver({name: "Keyboard note"}),
            new FrequencyDriver({name: "Keyboard frequency"}), 
        ]
        this.#keysRotary.drivers = [
            new KeysDriver({name: "Keyboard keys"})
        ]
        this.#subdivisions.drivers = [
            new SubdivisionDriver({name: "Octave Subdivisions"})
        ]


        this.shadowRoot.append(this.#start)
        this.shadowRoot.append(this.#keysRotary)
        this.shadowRoot.append(this.#subdivisions)
        
        this.#start.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onStartChange))
        this.#start.addEventListener(RotaryGroup.DRIVER_CHANGE, this.binding(this.#onStartDriverChange))
        this.#keysRotary.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onKeysChange))
        this.#subdivisions.addEventListener(RotaryGroup.CHANGE, this.binding(this.#onSubdivisionsChange))
        watch(this, "session", this.binding(this.#onSessionChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(KeyboardSettingsEditor.style)
        this.intitialized = true
        this.#update()
    }

    #onStartChange(e) {
        this.#session.keyboardSettings.start = this.#start.value
    
    }

    #onStartDriverChange(e) {
        this.#session.keyboardSettings.startDriver = this.#start.driver
    
    }

    #onKeysChange(e) {
        this.#session.keyboardSettings.keys = this.#keysRotary.value
    }

    #onSubdivisionsChange(e) {
        this.#session.keyboardSettings.subdivisions = this.#subdivisions.value
    }

    #onSessionChange(signal) {
        if (signal.path[0].origin instanceof KeyboardSettings) this.#update()
    }

    set session(value) {
        this.#session = value 
    }

    get session() {
        return this.#session
    }

    #update() {
        if (!this.#session) return
        this.#start.value = this.#session.keyboardSettings.start
        this.#start.driver = this.#session.keyboardSettings.startDriver
        this.#keysRotary.value =  this.#session.keyboardSettings.keys
        this.#subdivisions.value =  this.#session.keyboardSettings.subdivisions
    }

    destroy() {
        super.destroy()
    }

}