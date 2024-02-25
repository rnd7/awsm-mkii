import clone from "../data/clone.js"
import updateUIList from "../data/update-ui-list.js"
import watch from "../glue/watch.js"
import Channel from "../model/channel.js"
import resetChannel from "../model/reset-channel.js"
import resetVoice from "../model/reset-voice.js"
import Session from "../model/session.js"
import Voice from "../model/voice.js"
import Component from "./component.js"
import Button from "./button.js"
import ButtonList from "./button-list.js"

const INSERT_OSCILLATOR = "insert-oscillator"
const NAVIGATE = "navigate"

export default class ViewNavigation extends Component {

    static CHANGE = 'change'
    static MODE = 'mode'
    static NAVIGATE ='navigate'
    static INSERT_OSCILLATOR = "insert-oscillator"
    static UP = 'up'
    static style = 'component/view-navigation.css'

    #container = document.createElement('div')
    #mode = NAVIGATE
    #view

    #session

    constructor() {
        super()
        this.intitialized = false
        this.#container.classList.add("container")

        this.#container.addEventListener(Button.UP, this.binding(this.#onButtonUp))
        watch(this, "session", this.binding(this.#onSessionChange))
        watch(this, "view", this.binding(this.#onViewChange))
        this.#init()
    }

    async #init() {
        await this.appendStyleLink(ViewNavigation.style)
        this.intitialized = true
        this.shadowRoot.append(this.#container)
        this.addToRenderQueue(this.binding(this.#render)) 
    }

    #onButtonUp(e) {
        e.stopPropagation()
        const children = Array.from(this.#container.children)

        if (e.detail.action === "session") {
            this.#view.path = []
        }
        if (e.detail.action === "add-channel") {
            this.#session.channels.push({})
            const channelId = this.#session.channels[this.#session.channels.length-1].id
            this.#view.path = [channelId]
        }
        if (e.detail.action === "channel") {
            this.#view.path =  [e.detail.id]
        }
        if (e.detail.action === "add-voice") {
            const channel = this.#session.findChannel(this.#view.path[0])
            channel.voices.push(clone(this.#session.defaults.voice, true))
            channel.voices[channel.voices.length-1].state = Voice.TRIGGER_ATTACK
            const voiceId = channel.voices[channel.voices.length-1].id
            this.#view.path = [this.#view.path[0], voiceId]
        }
        if (e.detail.action === "add-oscillator") {
            const ref = this.#session.getPathReference(this.#view.path)
            let empty = {}
            if (e.detail.id === "fm") empty = clone(this.#session.defaults.fm, true)
            else if (e.detail.id === "am") empty = clone(this.#session.defaults.am, true)
            else if (e.detail.id === "em") empty = clone(this.#session.defaults.em, true)
            else if (e.detail.id === "sx") empty = clone(this.#session.defaults.sx, true)
            else if (e.detail.id === "gain") empty =  clone(this.#session.defaults.gain, true)
            else if (e.detail.id === "transpose") empty =  clone(this.#session.defaults.transpose, true)
            ref[e.detail.id] = empty
            this.mode = NAVIGATE
            this.#view.path.push(e.detail.id)
        }
        if (e.detail.action === "select-oscillator") {
            this.mode = NAVIGATE
            this.#view.path = e.detail.path
        }
        if (e.detail.action === "choose-oscillator") {
            const ref = this.#session.getPathReference(this.#view.path)
            this.mode = INSERT_OSCILLATOR
        }
        if (e.detail.action === "voice") {
            this.mode = NAVIGATE
            this.#view.path = [this.#view.path[0], e.detail.id]
        } 
        if (e.detail.action === "toggle-collapse") {
            this.mode = NAVIGATE
            this.#view.navigationCollapsed = !this.#view.navigationCollapsed
        }
        if (e.detail.action === "delete-oscillator") {
            
            const ref = this.#session.getPathReference(this.#view.path.slice(0,-1))
            ref[e.detail.id] = null
            this.#session.validateAllPaths()
        }
        if (e.detail.action === "duplicate-voice") {
            const channel = this.#session.findChannel(this.#view.path[0])
            const voice = clone(channel.findVoice(this.#view.path[1]), true)
            resetVoice(voice)
            channel.voices.push(voice)
            channel.voices[channel.voices.length-1].state = Voice.TRIGGER_ATTACK
            const voiceId = channel.voices[channel.voices.length-1].id
            this.#view.path = [this.#view.path[0], voiceId]
        }
        if (e.detail.action === "duplicate-channel") {
            const channel = clone(this.#session.findChannel(this.#view.path[0]), true)
            resetChannel(channel)
            this.#session.channels.push(channel)

            const channelId = this.#session.channels[this.#session.channels.length-1].id
            this.#view.path = [channelId]
        }
        if (e.detail.action === "delete-voice") {
            
            const channel = this.#session.findChannel(this.#view.path[0])
            const voice = channel.findVoice(this.#view.path[1])
            voice.state = Voice.TRIGGER_DELETE

        }
        if (e.detail.action === "delete-channel") {
            
            const channel = this.#session.findChannel(this.#view.path[0])
            channel.state = Channel.TRIGGER_RELEASE
        
        }
        this.dispatchEvent(
            new CustomEvent(
                ViewNavigation.UP, 
                {
                    detail: children.indexOf(e.detail),
                    bubbles: true, 
                    composed: true
                }
            )
        )
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

    set mode(value) {
        this.#mode = value
        this.dispatchEvent( new CustomEvent(
            ViewNavigation.MODE, 
            {
                detail: this.#mode,
                composed: true
            }
        ))
        this.addToRenderQueue(this.binding(this.#render)) 
    }

    get mode() {
        return this.#mode
    }

    set active(index) {
        const children = Array.from(this.#container.children)
        for(let i = 0; i < children.length; i++) {
            children[i].active = (i == index)
        }
    }

    get active() {
        const children = Array.from(this.#container.children)
        for(let i = 0; i < children.length; i++) {
            if (children[i].active) return i
        }
        return -1
    }

    #onSessionChange(signal) {
        if (signal.path[0].property === "phase") return
        this.addToRenderQueue(this.binding(this.#render)) 
        
    }

    #onViewChange(signal) {
        if (signal.path.length > 1) return
        this.addToRenderQueue(this.binding(this.#render)) 
    }

    #getOscillatorFooter(oscillator) {
        const f = []
        if (oscillator.am) f.push('A')
        if (oscillator.fm) f.push('F')
        if (oscillator.transpose) f.push('P')
        if (oscillator.em) f.push('E')
        if (oscillator.sx) f.push('S')
        if (oscillator.gain) f.push('G')
        return f.join("")
    }

    #getOscillatorName(oscillator) {
        switch (oscillator) {
            case "am":
                return "AM"
            case "fm":
                return "FM"
            case "transpose":
                return "Pitch"
            case "em":
                return "Exponent"
            case "sx":
                return "Scale"   
            case "gain":
            default:
                return "Gain"   
        }
    }

    #getVoiceFooter(voice) {
        return this.#getOscillatorFooter(voice.oscillator)
    }

    #render() {
        const rows = []
        const actionList = {items:[]}
        if (this.#session && this.#view) {
            
            const showSiblings = this.#session.navigationMode === Session.SIBLINGS
            const validPath = this.#session.getValidSubpath(this.#view.path)

            if (this.#view.navigationCollapsed) {
                if (validPath.length == 0) {
                    actionList.items.push({header: "Session", footer: `${this.#session.channels.length}`, action: "toggle-collapse", label: this.#session.name, mode: "active", invisible: false, wrap: false})
                } else if (validPath.length == 1) {
                    let activeChannel = this.#session.findChannel(validPath[0])
                    actionList.items.push({header: "Channel", footer: `${activeChannel.voices.length}`, action: "toggle-collapse", label: activeChannel.name, mode: "active", id: activeChannel.id, invisible: false, wrap: false})
                } else if (validPath.length == 2) {
                    let activeChannel = this.#session.findChannel(validPath[0])
                    let activeVoice = activeChannel.findVoice(validPath[1])
                    actionList.items.push({header: "Voice", footer: this.#getVoiceFooter(activeVoice), action: "toggle-collapse", label: activeVoice.name, mode: "active", id:activeVoice.id, invisible: false, wrap: false})
                } else if (validPath.length > 2) {
                    let ref =  this.#session.getPathReference(validPath)
                    
                    let type = validPath[validPath.length-1].toUpperCase()
                    actionList.items.push({header: "Oscillator", footer: this.#getOscillatorFooter(ref), action: "toggle-collapse", label: type, mode: "active", id:validPath[validPath.length-1], invisible: false, wrap: false})
                }
            } else {
                if (this.#mode === NAVIGATE) {
                    let sessionList = {items:[]}
                    
                    // Session
                    if (validPath.length == 0) {
                        sessionList.items.push({header: "Session", mode: "active", footer: `${this.#session.channels.length}`, action: "toggle-collapse", label: this.#session.name, invisible: false, wrap: false})
                    } else {
                        sessionList.items.push({header: "Session", mode: "path", footer: `${this.#session.channels.length}`, action: "session", label: this.#session.name, mode: "path", invisible: false, wrap: false})
                    }
                    
                    // Channels
                    if (validPath.length == 0) {
                        this.#session.channels.forEach(channel=>{
                            sessionList.items.push({header: "Channel", footer: `${channel.voices.length}`, action: "channel", label: channel.name, mode: "default", id: channel.id, invisible: false, wrap: false})
                        })
                    } else if (validPath.length == 1) {
                        this.#session.channels.forEach(channel=>{
                            if (validPath[0] === channel.id) {
                                sessionList.items.push({header: "Channel", footer: `${channel.voices.length}`, action: "toggle-collapse", label: channel.name, mode: "active", id: channel.id, invisible: false, wrap: false})
                            } else if (showSiblings) {
                                sessionList.items.push({header: "Channel", footer: `${channel.voices.length}`, action: "channel", label: channel.name, mode: "default", id: channel.id, invisible: false, wrap: false})
                            }
                        })
                    } else {
                        this.#session.channels.forEach(channel=>{
                            if (validPath[0] === channel.id) {
                                sessionList.items.push({header: "Channel", footer: `${channel.voices.length}`, action: "channel", label: channel.name, mode: "path", id: channel.id, invisible: false, wrap: false})
                            } else if (showSiblings) {
                                sessionList.items.push({header: "Channel", footer: `${channel.voices.length}`, action: "channel", label: channel.name, mode: "default", id: channel.id, invisible: false, wrap: false})
                                
                            }
                        })
                    }
                    if (sessionList.items.length) rows.push(sessionList)

                    // Voices
                    let voiceList = {items:[]}
                    if (validPath.length >= 1) {
                        let activeChannel = this.#session.findChannel(validPath[0])
                        activeChannel.voices.forEach(voice=>{
                            if (validPath.length == 2 && validPath[1] === voice.id) {
                                voiceList.items.push({header: "Voice", footer: this.#getVoiceFooter(voice), action: "toggle-collapse", label: voice.name, mode: "active", id: voice.id, invisible: false, wrap: false})
                            } else if (validPath.length > 2 && validPath[1] === voice.id) {
                                voiceList.items.push({header: "Voice", footer: this.#getVoiceFooter(voice), action: "voice", label: voice.name, mode: "path", id: voice.id, invisible: false, wrap: false})
                            } else if (showSiblings || validPath.length == 1) {
                                voiceList.items.push({header: "Voice", footer: this.#getVoiceFooter(voice), action: "voice", label: voice.name, mode: "default", id: voice.id, invisible: false, wrap: false})
                            }
                        })
                    }
                    if (voiceList.items.length) rows.push(voiceList)

                    // Oscillators
                    let oscillatorOrder = ["gain", "am", "fm", "transpose", "em", "sx"]
                    let oscillatorInsertPossible = false
                    if (validPath.length >= 2) {
                        let p = []

                        for (let i = 0; i < validPath.length; i++) {
                            p.push(validPath[i])
                            const ref = this.#session.getPathReference(p)
                            if (i>=1) {
                                let oscillatorCount = 0
                                let oscillatorList = {items:[]}
                                oscillatorOrder.forEach(name=>{
                                    const active = (i == validPath.length-2) && name === validPath[i+1]
                                    const ispath = (i < validPath.length-2) && name === validPath[i+1]
                                    if (ref[name]) {
                                        oscillatorCount++
                                        const oscName = this.#getOscillatorName(name)
                                        if (active) {
                                            oscillatorList.items.push({header: "Oscillator", footer: this.#getOscillatorFooter(ref[name]), action: "toggle-collapse", label: oscName, mode: "active", path: [...p, name], invisible: false, wrap: false})
                                        } else if (ispath) {
                                            oscillatorList.items.push({header: "Oscillator", footer: this.#getOscillatorFooter(ref[name]), action: "select-oscillator", label: oscName, mode: "path", id: name, path: [...p, name], invisible: false, wrap: false})
                                        } else if (showSiblings || i == validPath.length-1) {
                                            oscillatorList.items.push({header: "Oscillator", footer: this.#getOscillatorFooter(ref[name]), action: "select-oscillator", label: oscName, mode: "default", id: name, path: [...p, name], invisible: false, wrap: false})
                                        }
                                    }
                                    
                                })
                                if (oscillatorList.items.length != oscillatorOrder.length) oscillatorInsertPossible = true
                                if (oscillatorList.items.length) rows.push(oscillatorList)
                            }
                        }

                    }

                    // Actions
                    if (validPath.length == 0) {
                        actionList.items.push({header: "Channel", footer: "", action:"add-channel", label: "Add", mode: "insert", invisible: false, wrap: false})
                    } else if (validPath.length == 1) {
                        let activeChannel = this.#session.findChannel(validPath[0])
                        actionList.items.push({header: "Voice", footer: "", action:"add-voice", label: "Add", mode: "insert", invisible: false, wrap: false})
                        actionList.items.push({header: "Channel", footer: activeChannel.name, action: "duplicate-channel", label: "Duplicate", mode: "insert", id: validPath[0], invisible: false, wrap: false}) 
                        actionList.items.push({header: "Channel", footer: activeChannel.name, action: "delete-channel", label: "Delete", mode: "delete", id: validPath[0], invisible: false, wrap: false})
                    } else if (validPath.length == 2) {  
                        let activeChannel = this.#session.findChannel(validPath[0])
                        let activeVoice
                        if (activeChannel) activeVoice = activeChannel.findVoice(validPath[1])
                        if (oscillatorInsertPossible) actionList.items.push({header: "Oscillator", footer: "", action: "choose-oscillator", label: "Add", mode: "insert", invisible: false, wrap: false})
                        actionList.items.push({header: "Voice", footer: activeVoice.name, action: "duplicate-voice", label: "Duplicate", mode: "insert", id: validPath[1], invisible: false, wrap: false}) 
                        actionList.items.push({header: "Voice", footer: activeVoice.name, action: "delete-voice", label: "Delete", mode: "delete", id: validPath[1], invisible: false, wrap: false})
                    } else if (validPath.length > 2) {
                        if (oscillatorInsertPossible) actionList.items.push({header: "Oscillator", footer: "", action: "choose-oscillator", label: "Add", mode: "insert", invisible: false, wrap: false})  
                        actionList.items.push({header: "Oscillator", footer: "", action: "delete-oscillator", label: "Delete", mode: "delete", id: validPath[validPath.length-1], invisible: false, wrap: false})
                    }
                } else if (this.#mode === INSERT_OSCILLATOR) {
                    let activeChannel = this.#session.findChannel(validPath[0])
                    let activeVoice
                    if (activeChannel) activeVoice = activeChannel.findVoice(validPath[1])
                    if (activeVoice) {
                        if (validPath.length == 2) actionList.items.push({header: "Oscillator", footer: "Cancel", action: "voice", label: "Cancel", mode: "active", id:activeVoice.id})
                        else actionList.items.push({header: "Oscillator", footer: "Cancel", action: "select-oscillator", label: "Cancel", mode: "active", path: validPath})
                    }   
                    let ref =  this.#session.getPathReference(validPath)
                    if (!ref.gain) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "Gain", mode: "insert", id:"gain", path: [...validPath, "gain"]})
                    if (!ref.am) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "AM", mode: "insert", id:"am", path: [...validPath, "am"]})
                    if (!ref.fm) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "FM", mode: "insert", id:"fm", path: [...validPath, "fm"]})
                    if (!ref.transpose) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "Pitch", mode: "insert", id:"transpose", path: [...validPath, "transpose"]})
                    if (!ref.em) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "Exponent", mode: "insert", id:"em", path: [...validPath, "em"]})
                    if (!ref.sx) actionList.items.push({header: "Oscillator", footer: "", action: "add-oscillator", label: "Scale", mode: "insert", id:"sx", path: [...validPath, "sx"]})
        
                }
            }
        }

        if (actionList.items.length) rows.push(actionList)
        
        if (this.#session && this.#session.navigationMode === Session.COMPACT) this.#container.classList.add("force-row")
        else this.#container.classList.remove("force-row")
        updateUIList(this.#container, ButtonList, rows)
    }

    destroy() {
        super.destroy()
    }
}