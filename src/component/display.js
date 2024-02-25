import Component from "./component.js"

export default class Display extends Component {

    static UP = 'up'
    static DOWN = 'down'
    static CHANGE = 'change'
    static style = 'component/display.css'

    #precisionEl = document.createElement('div')
    #valueEl = document.createElement('div')
    #headerEl = document.createElement('div')
    #footerEl = document.createElement('div')
    #modeEl = document.createElement('div')
    #unitEl = document.createElement('div')
    #containerEl = document.createElement('div')
    #valueContainerEl = document.createElement('div')

    #precision = ""
    #value = "0"
    #label = ""
    #unit = "Hz"
    #footer = ""

    #modes = []
    #mode

    #isDown
    #clickable = false

    constructor() {
        super()
        this.intitialized = false
        this.#containerEl.classList.add("container")
        this.#headerEl.classList.add("header")
        this.#footerEl.classList.add("footer")
        this.#modeEl.classList.add("mode")
        this.#valueContainerEl.classList.add("value-container")
        this.#precisionEl.classList.add("precision")
        this.#valueEl.classList.add("value")
        this.#unitEl.classList.add("unit")
        this.#containerEl.appendChild(this.#headerEl)
        this.#valueContainerEl.appendChild(this.#precisionEl)
        this.#valueContainerEl.appendChild(this.#valueEl)
        this.#valueContainerEl.appendChild(this.#unitEl)
        this.#containerEl.appendChild(this.#valueContainerEl)
        this.#containerEl.appendChild(this.#footerEl)
        this.shadowRoot.append(this.#containerEl)

        this.#containerEl.addEventListener("pointerdown", this.binding(this.#onPointerDown))
        this.#containerEl.addEventListener("pointerup", this.binding(this.#onPointerUp))

        this.#init()
    }

    #onPointerDown(e) {
        if (this.#isDown) return 
        this.#isDown = e.pointerId
        this.#containerEl.setPointerCapture(e.pointerId)
        this.dispatchEvent(
            new CustomEvent(
                Display.DOWN, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }
    
    #onPointerUp(e) {
        if (this.#isDown !== e.pointerId) return
        this.#containerEl.releasePointerCapture(e.pointerId)
        this.#isDown = null
        this.dispatchEvent(
            new CustomEvent(
                Display.UP, 
                {
                    bubbles: true, 
                    composed: true
                }
            )
        )
    }

    async #init() {
        await this.appendStyleLink(Display.style)
        this.intitialized = true
        this.addToRenderQueue(this.binding(this.#render)) 
    }


    set value(value) {
        this.#value = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get value() {
        return this.#value
    }

    set label(value) {
        this.#label = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get label() {
        return this.#label
    }

    set unit(value) {
        this.#unit = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get unit() {
        return this.#unit
    }

    set precision(value) {
        this.#precision = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get precision() {
        return this.#precision
    }

    set footer(value) {
        this.#footer = value
    }

    get footer() {
        return this.#footer
    }

    set modes(value) {
        this.#modes = value
    }

    get modes() {
        return this.#modes
    }

    set mode(value) {
        this.#mode = value
    }

    get mode() {
        return this.#mode
    }

    set clickable(value) {
        this.#clickable = value
        this.addToRenderQueue(this.binding(this.#render))
    }

    get clickable() {
        return this.#clickable
    }


    #render() {
        this.#headerEl.textContent = this.#label
        this.#precisionEl.textContent = this.#precision
        this.#valueEl.textContent = this.#value
        this.#unitEl.textContent = this.#unit
        this.#footerEl.textContent = this.#footer
        if (this.#clickable && !this.shadowRoot.host.classList.contains("clickable")) this.shadowRoot.host.classList.add("clickable")
        else if (!this.#clickable && this.shadowRoot.host.classList.contains("clickable")) this.shadowRoot.host.classList.remove("clickable")
 
    }

    destroy() {

        this.#containerEl.remove()
        super.destroy()
    }

}