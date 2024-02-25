import Component from "./component.js"
import Display from "./display.js"
import RotaryDriver from "./rotary-driver/rotary-driver.js"
import Rotary from "./rotary.js"


export default class RotaryGroup extends Component {

    static CHANGE = 'change'
    static DRIVER_CHANGE = 'driver-change'
    static style = 'component/rotary-group.css'


    #rotary = Rotary.create()
    #display = Display.create()
    #value


    #drivers = [RotaryDriver]
    #driver = RotaryDriver.id


    constructor() {
        super()
        this.intitialized = false
        this.shadowRoot.append(this.#rotary)
        this.shadowRoot.append(this.#display)

        this.#rotary.addEventListener(Rotary.CHANGE, this.binding(this.#onRotaryChange))
        this.#display.addEventListener(Display.UP, this.binding(this.#onDisplayClick))

        this.#init()
    }

    async #init() {
        await this.appendStyleLink(RotaryGroup.style)
        this.intitialized = true
        this.#updateValue()
        this.addToRenderQueue(this.binding(this.#renderCanvas)) 
    }

    #onRotaryChange(e) {
        if (this.#driver) {
            this.#value = this.#driver.fromLocal(this.#rotary.value)
        }
    }

    #onDisplayClick(e) {
        this.nextDriver()
    }

    nextDriver() {
        const index = (this.#drivers.indexOf(this.#driver) + 1) % this.#drivers.length
        this.driver = this.#drivers[index].id
        this.dispatchEvent(
            new CustomEvent(
                RotaryGroup.DRIVER_CHANGE, {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    previousDriver() {
        const index = (this.#drivers.indexOf(this.#driver) + this.#drivers.length - 1) % this.#drivers.length
        this.driver = this.#drivers[index].id
        this.dispatchEvent(
            new CustomEvent(
                RotaryGroup.DRIVER_CHANGE, {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    set drivers(value) {
        this.#drivers = value
        if (this.driver) this.driver = this.#driver.id
        else this.driver = this.#drivers[0].id
        this.#updateDrivers()
    }

    get drivers() {
        return this.#drivers
    }

    set driver(id) {
        this.#driver = this.#drivers.find((driver)=>{return driver.id === id})
        this.#updateLabels()
        this.#updateValue()
        this.#updateDrivers()
    }

    get driver() {
        if (!this.#driver) return ""
        return this.#driver.id
    }

    set value(value) {
        this.#value = value
        this.#updateValue()
    }

    get value() {
        return this.#value
       
    }

    get rotary() {
        return this.#rotary
    }

    #updateDrivers() {

        this.#display.modes = this.#drivers.map(driver=>driver.name)
        this.#display.mode = this.#driver.name
        
    }

    #updateLabels() {
        if (this.#driver) {
            this.#rotary.min = this.#driver.min
            this.#rotary.center = this.#driver.center
            this.#rotary.minLabel = this.#driver.minLabel
            this.#rotary.max = this.#driver.max
            this.#rotary.step = this.#driver.step
            this.#rotary.maxLabel = this.#driver.maxLabel
            this.#rotary.header = this.#driver.name
            this.#rotary.scale = this.#driver.scale
            
            if (this.#drivers.length > 1) {
                this.#display.clickable = true
                this.#display.footer = `Mode: ${this.#drivers.indexOf(this.#driver)+1}/${this.#drivers.length}`
            } else {
                this.#display.clickable = false
                this.#display.footer = ""

            }
        }
    }

    #updateValue() {
        if (this.#driver) {
            const valueSet = this.#driver.render(this.#value)
            this.#display.precision = valueSet.precision
            this.#display.unit = valueSet.unit
            this.#display.value = valueSet.valueString
            this.#rotary.value = valueSet.value
        }
    }

    #renderCanvas() {
 
    }

    destroy() {
        this.#rotary.removeEventListener(Rotary.CHANGE, this.binding(this.#onRotaryChange))
        this.#display.removeEventListener(Display.UP, this.binding(this.#onDisplayClick))
        this.#rotary.destroy()
        this.#display.destroy()
        super.destroy()
    }

}