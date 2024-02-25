import {A, T} from "../glue/t.js"
import wrap from "../glue/wrap.js"
import randomName from "../utils/random-name.js"
import AudioMetrics from "./audio-metrics.js"
import Channel from "./channel.js"
import Defaults from "./defaults.js"
import Dynamics from "./dynamics.js"
import Entity from "./entity.js"
import KeyboardSettings from "./keyboard-settings.js"
import Point from "./point.js"
import Settings from "./settings.js"
import View from "./view.js"

const SYNCED_VIEWS = ["bar", "fraction"]

export default class Session extends Entity {

    static TRIGGER_PAUSE = "trigger-pause"
    static TRIGGER_PLAY = "trigger-play"
    static PLAY = "play"
    static PAUSE = "pause"
    static PLAYING = "playing"
    static PAUSED = "paused"

    static SIBLINGS = "siblings"
    static MULTILINE = "multiline"
    static COMPACT = "compact"

    #created = T(Number, Date.now())
    #settings = T(Settings, {})
    #channels = A(Channel, [])
    #main = T(Number, 1.)
    #mute = T(Boolean, false)
    #activeChannel = T(String,"")
    #keyboardSettings = T(KeyboardSettings, {})
    #channelMix = T(Point, {x:0, y:0})
    #defaults = T(Defaults, {})
    #dynamics = T(Dynamics, {})

    #potential = T(Number, 0.33)

    #name = T(String, randomName())
    #path = A(String, [])
    #keyboardFocus = A(String, [])

    #navigationMode = T(String, Session.SIBLINGS)

    #views = A(View, [{}])
    #activeView = T(Number, 0)
    #mode = T(String, "view")
    #showKeyboardSettings = T(Boolean, true)

    #tempoReference = -1
    #audioMetrics = new AudioMetrics()
    #solo = T(String,"")
    #state = T(String, Session.PLAYING)

    constructor(data = {}) {
        super()
        wrap(this)
        Object.assign(this, data)
    }

    get path() {
        return this.#path
    }
    
    set path(value) {
        this.#path = value
    }

    get dynamics() {
        return this.#dynamics
    }
    
    set dynamics(value) {
        this.#dynamics = value
    }

    get views() {
        return this.#views
    }
    
    set views(value) {
        this.#views = value
    }

    get mode() {
        return this.#mode
    }
    
    set mode(value) {
        this.#mode = value
    }

    get activeView() {
        return this.#activeView
    }
    
    set activeView(value) {
        this.#activeView = value
    }

    get name() {
        return this.#name
    }
    
    set name(value) {
        this.#name = value
    }

    get channels() {
        return this.#channels 
    }
    
    set channels(value) {
        this.#channels = value
    }

    get channelMix() {
        return this.#channelMix 
    }
    
    set channelMix(value) {
        this.#channelMix = value
    }

    get main() {
        return this.#main
    }
    
    set main(value) {
        this.#main = value
    }

    get potential() {
        return this.#potential
    }
    
    set potential(value) {
        this.#potential = value
    }

    get mute() {
        return this.#mute
    }
    
    set mute(value) {
        this.#mute = value
    }

    get activeChannel() {
        return this.#activeChannel
    }
    
    set activeChannel(value) {
        this.#activeChannel = value
    }

    get solo() {
        return this.#solo
    }
    
    set solo(value) {
        this.#solo = value
    }

    get keyboardSettings() {
        return this.#keyboardSettings
    }
    
    set keyboardSettings(value) {
        this.#keyboardSettings = value
    }

    get showKeyboardSettings() {
        return this.#showKeyboardSettings
    }
    
    set showKeyboardSettings(value) {
        this.#showKeyboardSettings = value
    }

    get settings() {
        return this.#settings
    }
    
    set settings(value) {
        this.#settings = value
    }

    get defaults() {
        return this.#defaults
    }
    
    set defaults(value) {
        this.#defaults = value
    }

    get navigationMode() {
        return this.#navigationMode
    }
    
    set navigationMode(value) {
        this.#navigationMode = value
    }

    get created() {
        return this.#created
    }
    
    set created(value) {
        this.#created = value
    }

    get state() {
        return this.#state
    }
    
    set state(value) {
        this.#state = value
    }

    get audioMetrics() {
        return this.#audioMetrics
    }

    get keyboardFocus() {
        return this.#keyboardFocus
    }
    
    set keyboardFocus(value) {
        this.#keyboardFocus = value
    }

    getPathReference(path) {
        let ref = this

        for(let i=0; i<path.length; i++) {
            if (!ref) break
            if (i == 0) {
                ref = ref.findChannel(path[i])
            } else if (i == 1) {
                ref = ref.findVoice(path[i])
                if (ref) ref = ref.oscillator
            } else {
                ref = ref[path[i]]
            }
        }
        return ref
    }

    getValidSubpath(path) {
        let ref = this
        const subpath = []

        for(let i=0; i<path.length; i++) {
            if (i == 0) {
                ref = ref.findChannel(path[i])
            } else if (i == 1) {
                ref = ref.findVoice(path[i])
                if (ref) ref = ref.oscillator
                
            } else {
                ref = ref[path[i]]
            }
            if (!ref) {
                break
            } else {
                subpath.push(path[i])
            }
        }
        return subpath
    }

    validateAllPaths() {
        this.views.forEach(view=>{
            view.path = this.getValidSubpath(view.path)
        })
    }

    findActiveChannel() {
        return this.findChannel(this.activeChannel)
    }

    findChannel(id) {
        return this.channels.find(channel => channel.id === id)
    }

    voiceSolo(id) {
        if (this.solo === id) {
            this.solo = ""
        } else {
            this.solo = id
        }
        this.channels.forEach(channel => {
            channel.voices.forEach(voice => {
                if(voice.id === this.solo) {
                    voice.bus = "solo"
                } else {
                    voice.bus = "main"
                }
            })
        })
    }

    zeroAll() {
        const zeroRecursive = (osc) => {
            osc.phase = 0
            if (osc.fm) zeroRecursive(osc.fm)
            if (osc.transpose) zeroRecursive(osc.transpose)
            if (osc.am) zeroRecursive(osc.am)
            if (osc.em) zeroRecursive(osc.em)
            if (osc.sx) zeroRecursive(osc.sx)
            if (osc.sy) zeroRecursive(osc.sy)
            if (osc.gain) zeroRecursive(osc.gain)
        }  
        this.channels.forEach(channel => {
            channel.voices.forEach(voice => {
                zeroRecursive(voice.oscillator)
            })
        })
    }

    syncTempo() {
        const multiplyRecursive = (osc, factor) => {
            if (osc.tempoSync) osc.length *= factor
            if (osc.fm) multiplyRecursive(osc.fm, factor)
            if (osc.fm) multiplyRecursive(osc.transpose, factor)
            if (osc.am) multiplyRecursive(osc.am, factor)
            if (osc.em) multiplyRecursive(osc.em, factor)
            if (osc.sx) multiplyRecursive(osc.sx, factor)
            if (osc.sy) multiplyRecursive(osc.sy, factor)
            if (osc.gain) multiplyRecursive(osc.gain, factor)
        }  
        if (this.#tempoReference != -1) {
            const factor = this.#tempoReference / this.settings.tempo
            this.channels.forEach(channel => {
                channel.voices.forEach(voice => {
                    multiplyRecursive(voice.oscillator, factor)
                })
            })
            multiplyRecursive(this.defaults.voice.oscillator, factor)
            multiplyRecursive(this.defaults.am, factor)
            multiplyRecursive(this.defaults.fm, factor)
            multiplyRecursive(this.defaults.transpose, factor)
            multiplyRecursive(this.defaults.gain, factor)
            multiplyRecursive(this.defaults.em, factor)
            multiplyRecursive(this.defaults.sx, factor)
        }
       
        this.#tempoReference = this.settings.tempo
    }
    
}