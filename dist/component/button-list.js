
import updateUIList from "../data/update-ui-list.js"
import Component from "./component.js"
import Button from "./button.js"


export default class ButtonList extends Component {

    static style = 'component/button-list.css'
    #container = document.createElement('div')
    #items

    constructor() {
        super()
        this.intitialized = false
        this.#container.classList.add("container")
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(ButtonList.style)
        this.intitialized = true
        this.shadowRoot.append(this.#container)
        this.addToRenderQueue(this.binding(this.#render)) 
    }

    set items(value) {
        this.#items = value
        this.addToRenderQueue(this.binding(this.#render)) 
    }

    get items() {
        return this.#items
    }

    #render() {
        if (this.#items) {
            updateUIList(this.#container, Button, this.#items)
        }
    }

    destroy() {
        updateUIList(this.#container, Button, [])
        super.destroy()
    }

}