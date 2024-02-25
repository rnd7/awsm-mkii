
import Component from "./component.js"

export default class SplashScreenItem extends Component {

    static style = 'component/splash-screen-item.css'
    static UP = 'up'
    static DOWN = 'down'

    #label = ""
    #header = ""
    #footer = ""

    #mode = "default"

    #labelEl = document.createElement("div")
    #headerEl = document.createElement("div")
    #footerEl = document.createElement("div")

    #isDown


    constructor() {
        super()
        this.intitialized = false


        this.#labelEl.classList.add("label")
        this.#labelEl.textContent = "AWSM"
        this.shadowRoot.append(this.#labelEl)

        this.#footerEl.classList.add("footer")
        this.#footerEl.textContent = "MKII"
        this.shadowRoot.append(this.#footerEl)

        this.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(SplashScreenItem.style)
        this.intitialized = true
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                SplashScreenItem.DOWN, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.releasePointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                SplashScreenItem.UP, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    set label(value) {
        this.#label = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get label() {
        return this.#label
    }

    set header(value) {
        this.#header = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get header() {
        return this.#header
    }

    set footer(value) {
        this.#footer = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get footer() {
        return this.#footer
    }

    set mode(value) {
        this.#mode = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get mode() {
        return this.#mode
    }

    #render() {

        if (this.#mode === "logo") this.classList.add("logo")
        else this.classList.remove("logo")
        if (this.#mode === "icon") this.classList.add("icon")
        else this.classList.remove("icon")

        this.#labelEl.textContent = this.#label
        this.#headerEl.textContent = this.#header
        this.#footerEl.textContent = this.#footer

    }

    destroy() {
        super.destroy()

    }
}