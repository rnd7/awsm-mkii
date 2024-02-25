/**
 * AWSM - AwesomeWaveSplineMachine MKII. EcmaScript software synthesizer.
 * Copyright (C) 2024 C. Nicholas Schreiber
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Keyboard from './keyboard.js'
import Component from "./component.js"
import SessionManager from '../audio/session-manager.js'
import Session from '../model/session.js'
import LayoutManager from './layout-manager.js'
import KeyboardGroup from './keyboard-group.js'
import Channel from '../model/channel.js'
import Voice from '../model/voice.js'
import DB from '../storage/db.js'
import watch from '../glue/watch.js'
import DatabaseSessionList from './database-session-list.js'
import clone from '../data/clone.js'
import resetState from '../model/reset-state.js'
import SplashScreen from './splash-screen.js'
import SessionEditor from './session-editor.js'
import defaultSession from '../model/default-session.js'


const downloadJSON = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "text/json" })
    const link = document.createElement("a")

    link.download = `${filename.toLowerCase().replace(/\s+/g,'_')}.json`
    link.href = window.URL.createObjectURL(blob)
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")

    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    link.dispatchEvent(evt)
    link.remove()
}

export default class AwesomeWaveSplineMachine extends Component {

    static CHANGE = 'change'
    static style = 'component/awsm.css'

    #views = document.createElement('div')
    #session
    #sessionManager = new SessionManager()

    #sessionEditor = LayoutManager.create()
    #keyboard = KeyboardGroup.create()
    #splashScreen = SplashScreen.create()

    #db = new DB("awsm", 1)

    #saveDelay = 1000
    #saveTriggered = false
    #saveReady = true

    constructor() {
        super()
        console.group("AWSM - AwesomeWaveSplineMachine MKII")
        console.log("EcmaScript software synthesizer.")
        console.log("Copyright (C) 2024 C. Nicholas Schreiber")
        console.log("This program comes with ABSOLUTELY NO WARRANTY")
        console.log("This is free software, and you are welcome to redistribute it under certain conditions")
        console.groupEnd()

        this.intitialized = false
        this.#views.classList.add("views")
        watch(this, "session", this.binding(this.#onSessionChange))
        this.#init()
    }


    async #init() {

        await this.appendStyleLink(AwesomeWaveSplineMachine.style)
        this.shadowRoot.append(this.#splashScreen)

        this.#splashScreen.addEventListener(SplashScreen.DISMISS, this.binding(this.#onSplashScreenDismiss))

        this.shadowRoot.addEventListener("drop", this.binding(this.#onDrop))
        this.shadowRoot.addEventListener("dragover", this.binding(this.#onDragOver))

        this.intitialized = true
     
    }

    #onDragOver(ev) {
        ev.preventDefault();
    }

    #onDrop(ev) {
        const insert = async (file)=>{
            let session = JSON.parse(await file.text())
            session = new Session(clone(session, true))
            session.created = Date.now()
            await this.#db.write(session)
        }
        ev.preventDefault()
        if (ev.dataTransfer.items) {
          [...ev.dataTransfer.items].forEach(async (item, i) => {
            if (item.kind === "file") {
              const file = item.getAsFile();
              insert(file)
              
            }
          });
        } else {
          [...ev.dataTransfer.files].forEach(async (file, i) => {
            insert(file)
          });
        }

    }

    #initializeSessioEditor() {
        this.#sessionEditor.db = this.#db

        this.#sessionEditor.addEventListener(DatabaseSessionList.TRIGGER_LOAD, this.binding(this.#onTriggerLoad))
        this.#sessionEditor.addEventListener(LayoutManager.NEW_SESSION, this.binding(this.#onNewSession))
        this.#sessionEditor.addEventListener(LayoutManager.DUPLICATE_SESSION, this.binding(this.#onDuplicateSession))
        this.#sessionEditor.addEventListener(LayoutManager.EXPORT_SESSION, this.binding(this.#onExportSession))
        this.#sessionEditor.addEventListener(LayoutManager.DELETE_SESSION, this.binding(this.#onTriggerDelete))
        
        this.#sessionEditor.addEventListener(SessionEditor.ZERO, this.binding(this.#onZeroClick))
    }


    #onZeroClick(e) {
        this.#sessionManager.zeroAll(e.detail, false)
    }

    #initializeKeyboard() {
    
        this.#keyboard.classList.add("keyboard-section")
        this.#keyboard.addEventListener(Keyboard.KEYDOWN, (e)=>{
            if (this.#session.keyboardFocus) {
                const validPath = this.#session.getValidSubpath(this.#session.keyboardFocus)
                if (validPath.length >= 2) {
                    const ref = this.#session.getPathReference(validPath)
                    if (ref.length) ref.length =  1/e.detail.keydown.frequency
                    else if (ref.oscillator && ref.oscillator.length) ref.oscillator.length = 1/e.detail.keydown.frequency
                }
            }
         
        })
        this.#keyboard.addEventListener(Keyboard.KEYUP, (e)=>{
        })
        this.#keyboard.addEventListener(Keyboard.KEYPRESSURE, (e)=>{
        })
        this.#keyboard.addEventListener(Keyboard.KEYBEND, (e)=>{
        })
    }
    
    async #initializeDatabase() {
        await this.#db.open()
    }

    async #initalizeAudioEngine() {
        await this.#sessionManager.inititialize()
    }

    async #loadRecentOrDefault() {
        let session = await this.#db.recent()

        if (session) return new Session(session)
        return new Session(defaultSession())
    }
    

    async #onSplashScreenDismiss(e) {
        await this.#initalizeAudioEngine()
        await this.#initializeDatabase()
        const session = await this.#loadRecentOrDefault()

        this.#initializeKeyboard()
        this.#initializeSessioEditor()

        this.session = session

        this.addToRenderQueue(this.binding(this.#removeSplashScreen))
    }

    #removeSplashScreen() {
        this.#splashScreen.remove()

        this.shadowRoot.append(this.#sessionEditor)
        this.shadowRoot.append(this.#keyboard)
    
    }

    async #onTriggerLoad(e) {
        const rawSession = await this.#db.read(e.detail)
        if (rawSession && (!this.#session || rawSession.id !== this.#session.id)) {
            await this.#sessionManager.stopAll()
            rawSession.mode = "storage"
            this.session = new Session(rawSession)
            this.#save()
        }
    }

    async #onTriggerDelete(e) {
        if (!this.#session) return
        await this.#sessionManager.stopAll()
        const id = this.#session.id
        this.session = null
        await this.#db.delete(id)
    }

    async #onNewSession(e) {
        await this.#sessionManager.stopAll()
        let session = new Session({mode:"storage"})
        await this.#db.write(session)
        this.session = session
    }

    async #onDuplicateSession(e) {
        if (!this.#session) return
        await this.#sessionManager.stopAll()
        let session = new Session(clone(this.#session, true))
        session.created = Date.now()
        await this.#db.write(session)
        this.session = session
    }

    async #onExportSession(e) {
        if (!this.#session) return
        downloadJSON(this.#session.name, this.#session)
    }

    #updateKeyboard() {
        if (!this.#session || this.#session.mode === "storage") {
            this.#keyboard.remove()
        } else {
            this.shadowRoot.append(this.#keyboard)
        }
    }

    #onSessionChange(signal) {
        if (signal.path[0].property === "tempo") {
            this.#session.syncTempo()
        } else if (signal.path[0].property === "mode") {
            this.#updateKeyboard()
        } else if (signal.path[0].property === "state") {
            if (signal.path[0].origin instanceof Channel) {
                if (signal.path[0].origin.state === Channel.DELETE) {
                    const channelIndex = this.#session.channels.indexOf(signal.path[0].origin)
                    this.#session.channels.splice(channelIndex, 1)
                    this.#session.validateAllPaths()
                }
            } else if (signal.path[0].origin instanceof Voice) {
                if (signal.path[0].origin.state === Voice.TRIGGER_ATTACK) {
                    signal.path[0].origin.state = Voice.ATTACK
                } else if (signal.path[0].origin.state === Voice.TRIGGER_RELEASE) {
                    signal.path[0].origin.state = Voice.RELEASE
                } else if (signal.path[0].origin.state === Voice.DELETE) {
                    const voice = signal.path[0].origin 
                    const channel = signal.path[1].origin
                    const voiceIndex = channel.voices.indexOf(voice)
                    channel.voices.splice(voiceIndex, 1)
                    this.#session.validateAllPaths()
                    
                }
            }
        } else if (signal.property === "activeView" || signal.path[0].property === "path") {
                
            const view = this.#session.views[this.#session.activeView]
            if (view && view.path.length>=2) {
                const validPath = this.#session.getValidSubpath(view.path)

                const ref = this.#session.getPathReference(validPath)
                if (ref.length || ref.oscillator && ref.oscillator.length) {
                    this.#session.keyboardFocus = validPath
                }
            }
        }
        this.#save()
    }

    async #save() {
        if (!this.#session) return
        if (!this.#saveReady) {
            this.#saveTriggered = true
            return
        }
        this.#saveTriggered = false
        this.#saveReady = false
        try {
            await this.#db.write(this.#session)
            setTimeout(()=>{
                this.#saveReady = true
                if (this.#saveTriggered) {
                    this.#save()
                }
            }, this.#saveDelay)
        } catch(e) {
            console.error(e)
        }
    }

    get session() {
        return this.#session
    }

    set session(value) {
        resetState(value)
            this.#session = value
            this.#sessionManager.session = this.#session
            this.#sessionEditor.session = this.#session
            this.#keyboard.session = this.#session
            this.#updateKeyboard()
    }

    destroy() {
        this.#db.close()
        super.destroy()
    }
}
