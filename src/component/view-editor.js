import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import ChannelEditor from "./channel-editor.js"
import Component from "./component.js"
import ViewNavigation from "./view-navigation.js"
import OscillatorEditor from "./oscillator-editor.js"
import SessionEditor from "./session-editor.js"
import VoiceEditor from "./voice-editor.js"

export default class ViewEditor extends Component {

    static CHANGE = 'change'
    static style = 'component/view-editor.css'

    #container = document.createElement('div')
    #content = document.createElement('div')
    #navigation = ViewNavigation.create()
    #settingsEditor = SessionEditor.create()
    #channelEditor = ChannelEditor.create()
    #voiceEditor = VoiceEditor.create()
    #oscillatorEditor = OscillatorEditor.create()
    #statusIndicator = document.createElement("div")

    #session
    #view
    #active

    #activeContent

    constructor() {
        super()
        this.intitialized = false
        this.shadowRoot.append(this.#statusIndicator)
        this.shadowRoot.append(this.#container)
        this.#container.classList.add('container')

        this.#container.append(this.#navigation)
        this.#container.append(this.#content)
        this.#statusIndicator.classList.add("status-indicator")

        this.#navigation.addEventListener(ViewNavigation.MODE, this.binding(this.#onNavigationModeChange))
        this.#voiceEditor.addEventListener(VoiceEditor.SOLO, this.binding(this.#onSoloToggle))

        watch(this, "session", this.binding(this.#onSessionChange))
        watch(this, "view", this.binding(this.#onViewChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(ViewEditor.style)
        this.intitialized = true
    }
    
    set session(value) {
        this.#session = value
    }

    get session() {
        return this.#session
    }

    set view(value) {
        this.#view = value
    }

    get view() {
        return this.#view
    }

    set active(value) {
        this.#active = value
        this.addToRenderQueue(this.binding(this.#update))
    }

    get active() {
        return this.#active
    }

    #onSoloToggle(event) {
        this.#session.voiceSolo(event.detail)
    }

    #onNavigationModeChange(event) {
        if (this.#navigation.mode === ViewNavigation.NAVIGATE) {
            this.#container.append(this.#content)
        } else {
            this.#content.remove()
        }
    }

    #onSessionChange(signal) {
        if (signal.path.length > 1) return
        this.addToRenderQueue(this.binding(this.#update))
    }

    #onViewChange(signal) {
        if (signal.path.length > 1) return
        this.addToRenderQueue(this.binding(this.#update))
    }

    #update() {
        if (!this.#session || !this.#view) return
        this.#navigation.session = this.#session
        this.#navigation.view = this.#view

        const validPath = this.#session.getValidSubpath(this.#view.path)

        let content

        if (this.#active) this.#statusIndicator.classList.add("active")
        else this.#statusIndicator.classList.remove("active")

        if (validPath.length == 0) {
            this.#settingsEditor.session = this.#session
            content = this.#settingsEditor
        } else if (validPath.length == 1) {
            const id = validPath[0]
            const channel = this.#session.findChannel(id)
            this.#channelEditor.channel = channel
            content = this.#channelEditor
        } else if (validPath.length == 2) {
            const channelId = validPath[0]
            const channel = this.#session.findChannel(channelId)
            const voiceId = validPath[1]
            const voice = channel.findVoice(voiceId)
            this.#voiceEditor.voice = voice
            content = this.#voiceEditor
        } else {
            this.#oscillatorEditor.settings = this.#session.settings
            this.#oscillatorEditor.last = validPath.slice(-1)[0]
            this.#oscillatorEditor.parent = this.#session.getPathReference(validPath.slice(0,-1))
            this.#oscillatorEditor.reference = this.#session.getPathReference(validPath)
            content = this.#oscillatorEditor
        }

        if (content !== this.#activeContent) {
            if (this.#activeContent) this.#activeContent.remove()
            this.#activeContent = content
            this.#content.append(this.#activeContent)
        }
    }

    destroy() {
        unwatch(this, "session", this.binding(this.#onSessionChange))
        unwatch(this, "view", this.binding(this.#onViewChange))
        super.destroy()
    }
}