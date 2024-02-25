import Component from "./component.js"

export default class Button extends Component {

    static style = 'component/button.css'

    static UP = 'up'
    static DOWN = 'down'
    
    #label = ""
    #header = ""
    #footer = ""
    #wrap = false
    #invisible = false
    #action
    #id
    #path

    #mode = "default"
    
    #buttonEl = document.createElement("button")
    #headerEl = document.createElement("div")
    #labelEl = document.createElement("div")
    #footerEl = document.createElement("div")

    #isDown

    constructor() {
        super()
        this.intitialized = false

        this.#headerEl.classList.add("header")
        this.#buttonEl.append(this.#headerEl)

        this.#labelEl.classList.add("label")
        this.#buttonEl.append(this.#labelEl)

        this.#footerEl.classList.add("footer")
        this.#buttonEl.append(this.#footerEl)

        this.#init()
    }

    async #init() {
        await this.appendStyleLink(Button.style)
        this.shadowRoot.append(this.#buttonEl)
        this.addToRenderQueue(this.binding(this.#render)) 
        this.#buttonEl.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#buttonEl.addEventListener("pointerup", this.binding(this.#onPointerUp))
        this.intitialized = true
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.#buttonEl.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                Button.DOWN, 
                {
                    detail: this,
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#isDown = null
        this.#buttonEl.releasePointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                Button.UP, 
                {
                    detail: this,
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }
    
    set wrap(value) {
        this.#wrap = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get wrap() {
        return this.#wrap
    }

    set invisible(value) {
        this.#invisible = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get invisible() {
        return this.#invisible
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

    set action(value) {
        this.#action = value
    }

    get action() {
        return this.#action
    }

    set id(value) {
        this.#id = value
    }

    get id() {
        return this.#id
    }

    set path(value) {
        this.#path = value
    }

    get path() {
        return this.#path
    }

    #render() {
        if (this.#wrap) this.shadowRoot.host.classList.add("wrap")
        else this.shadowRoot.host.classList.remove("wrap")
        if (this.#invisible) this.shadowRoot.host.classList.add("invisible")
        else this.shadowRoot.host.classList.remove("invisible")
        this.#labelEl.textContent = this.#label
        this.#headerEl.textContent = this.#header
        this.#footerEl.textContent = this.#footer
        if (this.#mode === "toggle") this.#buttonEl.classList.add("toggle")
        else this.#buttonEl.classList.remove("toggle")
        if (this.#mode === "active") this.#buttonEl.classList.add("active")
        else this.#buttonEl.classList.remove("active")
        if (this.#mode === "insert") this.#buttonEl.classList.add("insert")
        else this.#buttonEl.classList.remove("insert")
        if (this.#mode === "delete") this.#buttonEl.classList.add("delete")
        else this.#buttonEl.classList.remove("delete")
        if (this.#mode === "path") this.#buttonEl.classList.add("path")
        else this.#buttonEl.classList.remove("path")
        if (this.#mode === "logo") this.#buttonEl.classList.add("logo")
        else this.#buttonEl.classList.remove("logo")
        if (this.#mode === "solo") this.#buttonEl.classList.add("solo")
        else this.#buttonEl.classList.remove("solo")
        if (this.#mode === "inactive") this.#buttonEl.classList.add("inactive")
        else this.#buttonEl.classList.remove("inactive")
    }

    destroy() {
        super.destroy()
    }
}