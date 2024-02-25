import updateUIList from "../data/update-ui-list.js"
import Signal from "../glue/signal.js"
import Component from "./component.js"
import DatabaseSessionItem from "./database-session-item.js"

export default class DatabaseSessionList extends Component {
    static TRIGGER_LOAD = 'trigger-load'
    static CHANGE = 'change'
    static style = 'component/database-session-list.css'

    #db
    #session
    #container = document.createElement("container")
    #statusIndicator = document.createElement("div")
    
    constructor() {
        super()
        this.intitialized = false

        this.#statusIndicator.classList.add("status-indicator")
        this.shadowRoot.append(this.#statusIndicator)
        this.#container.classList.add("container")
        this.shadowRoot.append(this.#container)
        this.#container.addEventListener(DatabaseSessionItem.UP, this.binding(this.#onSessionUp))
        this.#init()
    }
    async #init() {
        await this.appendStyleLink(DatabaseSessionList.style)
    
        this.intitialized = true
    }

    #onSessionUp(e) {
        this.dispatchEvent(
            new CustomEvent(
                DatabaseSessionList.TRIGGER_LOAD, 
                {
                    bubbles: true, 
                    composed: true,
                    detail: e.target.id
                }
            )
        )
    }

    set session(value) {
        this.#session = value
        this.#update()
    }

    get session() {
        return this.#session
    }

    set db(value) {
        if (this.#db) Signal.unsubscribe(this.#db, this.binding(this.#onDBCHange))
        this.#db = value
        Signal.subscribe(this.#db, this.binding(this.#onDBCHange))
        this.#update()
    }

    get db() {
        return this.#db
    }

    #onDBCHange() {
        this.#update()
    }

    async #update() {
        const sessions = await this.#db.list()
        sessions.forEach(session => {
            session.active = (this.#session && session.id === this.#session.id)
        })
        updateUIList(this.#container, DatabaseSessionItem, sessions)
    }

    destroy() {
        super.destroy()
    }

}