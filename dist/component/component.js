import camelToKebab from "../utils/camel-to-kebab.js"

export default class Component extends HTMLElement {
    static prefix = "awsm"
    static register = new Set()

    static get componentName() {
        return [this.prefix, camelToKebab(this.name)].join('-')
    }

    static create(opts) {
        const name = this.componentName
        if (!this.register.has(name)) {
            customElements.define(name, this)
            this.register.add(name)
        }
        const el = document.createElement(name)
        if (opts) el.fromObject(opts)
        return el
    }

    #bindings = new Map()
    #renderQueue = new Set()
    #animationFrame
    #initialized = true
    #renderTriggered = false
    #resizeObserver

    constructor({resizeObserver = true} = {}) {
        super()
        if (resizeObserver) {
            this.#resizeObserver = new ResizeObserver(this.binding(this.#onResize))
        }
        this.attachShadow({ mode: 'open' })
    }

    observe(el) {
        this.#resizeObserver.observe(el)
    }

    set intitialized(value) {
        this.#initialized = value
        if (this.#initialized && this.#renderTriggered) this.#triggerRender()
    }

    get intitialized() {
        return this.#initialized
    }

    #onResize(entries) {
        for (let entry of entries) {

            if (entry.contentBoxSize?.length > 0) {
                this.resize({width: entry.contentBoxSize[0].inlineSize, height: entry.contentBoxSize[0].blockSize})
                break
            }
        }
    }

    resize({width = 0, height = 0}) {
    }

    async appendStyleLink(url) {
        const styleEl = await new Promise((resolve, reject) => {
            const styleEl = document.createElement('link');
            styleEl.type = 'text/css'
            styleEl.rel = 'stylesheet'
            styleEl.onload = () => resolve(styleEl)
            styleEl.onerror = () => reject()
            styleEl.href = url
            this.shadowRoot.append(styleEl)
        })
        return styleEl
    }

    binding(fn) {
        if (!this.#bindings) return
        if (!this.#bindings.has(fn)) {
            this.#bindings.set(fn, fn.bind(this))
        }
        return this.#bindings.get(fn)
    }

    /* Render on animation frame */
    addToRenderQueue(fn) {
        if (!this.#renderQueue) return
        this.#renderQueue.add(fn)
        this.#triggerRender()
    }

    /* Force immediate render. */
    render() {
        if (this.#animationFrame) cancelAnimationFrame(this.#animationFrame)
        this.#render()
    }

    destroy() {
        this.#bindings = null
        this.#renderQueue = null
        cancelAnimationFrame(this.#animationFrame)
        this.remove()
    }

    #triggerRender() {
        this.#renderTriggered = false
        if (this.#animationFrame) return
        if (this.#initialized) this.#animationFrame = requestAnimationFrame(this.binding(this.#render))
        else this.#renderTriggered = true
    }

    #render() {
        this.#animationFrame = null
        for (const fn of this.#renderQueue) fn()
        this.#renderQueue = new Set()
    }

}