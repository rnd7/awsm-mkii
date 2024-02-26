import hslToRgb from "../color/hsl-to-rgb.js"
import updateUIList from "../data/update-ui-list.js"
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Component from "./component.js"
import Button from "./button.js"
import DatabaseSessionList from "./database-session-list.js"
import ViewEditor from "./view-editor.js"

export default class LayoutManager extends Component {

    static NEW_SESSION = "new-session"
    static DELETE_SESSION = "delete-session"
    static DUPLICATE_SESSION = "duplicate-session"
    static EXPORT_SESSION = "export-session"
    static CHANGE = 'change'
    static style = 'component/layout-manager.css'

    #container = document.createElement('div')
    #navigationContainer = document.createElement('div')
    #navigation = document.createElement('div')

    #navigationContent = document.createElement('div')
    #storageEditor = DatabaseSessionList.create()
    #session
    
    #statusIndicator = document.createElement("div")


    constructor() {
        super()
        this.intitialized = false

        this.shadowRoot.append(this.#navigationContainer)
        this.#navigationContainer.classList.add('navigation-container')
        this.#navigationContainer.append(this.#statusIndicator)
        this.#statusIndicator.classList.add("status-indicator")

        this.#navigationContainer.append(this.#navigation)
        this.#navigation.classList.add('navigation')

        this.#navigation.append(this.#navigationContent)
        this.#navigationContent.classList.add('navigation-content')


        this.shadowRoot.append(this.#container)
        this.#container.classList.add('container')
        this.#container.classList.add('hscroll')

        watch(this, "session", this.binding(this.#onSessionChange))
        this.#container.addEventListener("pointerdown", this.binding(this.#onContainerUp)) 
        this.#navigation.addEventListener(Button.UP, this.binding(this.#onNavigationUp))
       
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(LayoutManager.style)
        this.intitialized = true

        this.#update()
    }

    #onNavigationUp(e) {

        if (e.target.action === "select-view") {
            this.#session.mode = "view"
            this.#session.activeView = e.target.id
            const node = this.#container.children[e.target.id]
            //Array.from(this.#container.children).findIndex(x=>{console.log(x.view.id, e.target.id);return x.view.id === e.target.id})
            console.log(node)
            node.scrollIntoView()
        } else if (e.target.action === "add-view") {
            this.#session.views.push({})
            this.#session.activeView = this.#session.views.length - 1
        } else if (e.target.action === "delete-view") {
            this.#session.views.splice(this.#session.activeView, 1)
            this.#session.activeView = Math.min(this.#session.views.length - 1, this.#session.activeView)
        } else if ( e.target.action === "show-storage") {
            this.#session.mode = "storage"
        } else if ( e.target.action === "show-view") {
            if (this.#session) {
                this.#session.mode = "view"
            }
        } else if ( e.target.action === "new-session") {
            this.dispatchEvent(
                new CustomEvent(
                    LayoutManager.NEW_SESSION, 
                    {
                        bubbles: true, 
                        composed: true
                    }
                )
            )
        } else if ( e.target.action === "delete-session") {
            this.dispatchEvent(
                new CustomEvent(
                    LayoutManager.DELETE_SESSION, 
                    {
                        bubbles: true, 
                        composed: true
                    }
                )
            )
        } else if ( e.target.action === "duplicate-session") {
            this.dispatchEvent(
                new CustomEvent(
                    LayoutManager.DUPLICATE_SESSION, 
                    {
                        bubbles: true, 
                        composed: true
                    }
                )
            )
        } else if ( e.target.action === "export-session") {
            this.dispatchEvent(
                new CustomEvent(
                    LayoutManager.EXPORT_SESSION, 
                    {
                        bubbles: true, 
                        composed: true
                    }
                )
            )
        }
    }

    #onContainerUp(e) {
        let target = Array.from(this.#container.children).indexOf(e.target)
        if (target<0) return 
        this.#session.activeView = target
    
    }
    
    set session(value) {
        this.#session = value
        this.#storageEditor.session = this.#session
    }

    get session() {
        return this.#session
    }

    set db(value) {
        this.#storageEditor.db = value
    }
    
    get db() {
        return this.#storageEditor.db
    }

    #onSessionChange(signal) {
        if (signal.path.length > 1) return
        this.#update()
    }

    #update() {
        let list = []
        if (!this.#session) {
            list.push(/*{
                header: "",
                footer: "",
                label: "AWSM",
                mode: "logo",
                invisible: false,
                wrap: false
            },*/{
                header: "AWSM",
                footer: "",
                label: "Database",
                mode: "logo",
                action: "show-view",
                invisible: false,
                wrap: false
            },{
                header: "Session",
                footer: "",
                label: "New",
                mode: "insert",
                action: "new-session",
                invisible: false,
                wrap: false
            })
        } else if (this.#session.mode === "storage") {
            list.push(/*{
                header: "",
                footer: "",
                label: "AWSM",
                mode: "logo",
                invisible: false,
                wrap: false
            },*/{
                header: "AWSM",
                footer: "Mode: 2/2",
                label: "Database",
                mode: "logo",
                action: "show-view",
                invisible: false,
                wrap: false
            },{
                header: "Session",
                footer: this.#session.name,
                label: "Duplicate",
                mode: "insert",
                action: "duplicate-session",
                invisible: false,
                wrap: false
            },{
                header: "Session",
                footer: this.#session.name,
                label: "Export",
                mode: "insert",
                action: "export-session",
                invisible: false,
                wrap: false
            },{
                header: "Session",
                footer: "",
                label: "New",
                mode: "insert",
                action: "new-session",
                invisible: false,
                wrap: false
            },{
                header: "Session",
                footer: this.#session.name,
                label: "Delete",
                mode: "delete",
                action: "delete-session",
                invisible: false,
                wrap: false
            })
        } else if (this.#session.mode === "view") {


            const views = this.#session.views.map((view, index) => {return {
                session: this.#session, 
                view,
                active: this.#session.activeView == index
            }})
            updateUIList(this.#container, ViewEditor, views)

            list = this.#session.views.map(
                (view, index) => {
                    return {
                        header: "View",
                        label: view.name,
                        footer: "",
                        mode: (this.#session.activeView == index) ? "active":"default",
                        action: "select-view",
                        id: index,
                        invisible: false,
                wrap: false
                    }
                }
            )

            list.unshift(/*{
                header: "",
                footer: "",
                label: "AWSM",
                mode: "logo",
                invisible: false,
                wrap: false
            },*/{
                header: "AWSM",
                footer: "Mode: 1/2",
                label: "Perform",
                mode: "logo",
                action: "show-storage",
                invisible: false,
                wrap: false
            })
            list.push({
                header: "View",
                label: "Add",
                footer: "",
                mode: "insert",
                action: "add-view",
                invisible: false,
                wrap: false
            })
            if (this.#session.activeView >= 0 && this.#session.activeView < this.#session.views.length) {
                list.push({
                    header: "View",
                    label: "Delete",
                    footer: this.#session.views[this.#session.activeView].name,
                    mode: "delete",
                    action: "delete-view",
                    invisible: false,
                    wrap: false
                })
            }
        }
    
        updateUIList(this.#navigationContent, Button, list)
        this.addToRenderQueue(this.binding(this.#updateDom))

    }

    #updateDom() {
    
        if (!this.#session || this.#session.mode === "storage") {
            if (!this.#storageEditor.parentNode) this.shadowRoot.append(this.#storageEditor)
            if (this.#container.parentNode) this.#container.remove()
        } else {
            if (!this.#container.parentNode) this.shadowRoot.append(this.#container)
            if (this.#storageEditor.parentNode) this.#storageEditor.remove()
            
        }
    }

    destroy() {
        unwatch(this, "session", this.binding(this.#onSessionChange))
        super.destroy()
    }
}