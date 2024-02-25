import clone from "../data/clone.js"
import unwatch from "../glue/unwatch.js"
import watch from "../glue/watch.js"
import Voice from "../model/voice.js"
import syncVoice from "../wave-spline/sync-voice.js"

export default class VoiceManager {
    #audioContext
    #voice
    #processor
    #gainNode
    #envelope
    #envelopeTimeout
    #gainChangeTime = 1/100
    #soloBus
    #outBus
    #soloConnected = false

    constructor(audioContext, voice) {
        this.#audioContext = audioContext
        this.#gainNode = this.#audioContext.createGain()
        this.#gainNode.gain.value = 0
        this.#envelope = this.#audioContext.createGain()
        this.#envelope.gain.value = 0
        this.#processor = new AudioWorkletNode(this.#audioContext, 'wave-spline-processor')
        this.#processor.port.onmessage = (msg) => {
            if (msg.data.type === "sync") {
                syncVoice(this.voice, msg.data.voice)
            }
        }
        
        this.#processor.connect(this.#gainNode)
        this.#gainNode.connect(this.#envelope)

        watch(this, "voice", this.#onVoiceChange.bind(this))
        if (voice) this.voice = voice
  
    }

    #onVoiceChange(signal) {
        if (signal.path[0].property === "bus") {
            this.#updateBus()
        } else if (signal.path[0].property === "state") {
            this.#updateState()
        } else if (signal.path[0].origin === this.voice && signal.path[0].property === "gain") {
            this.#updateGain()
        } else if (
            signal.path[0].property !== "phase"
            && signal.path[0].property !== "name"
            && signal.path[0].property !== "lengthDriver"
            && signal.path[0].property !== "gridX"
            && signal.path[0].property !== "gridY"
            && signal.path[0].property !== "viewZoom"
            && signal.path[0].property !== "viewPosition"
        ) {
            this.#update() 
        }
    }

    set voice(value) {
        this.#voice = value
        this.#updateBus()
        this.#updateState()
        this.#updateGain()
        this.#update()
    }

    get voice() {
        return this.#voice
    }

    pause() {
        this.#processor.port.postMessage({
            type: "pause"
        })
    }

    play() {
        this.#processor.port.postMessage({
            type: "play"
        })
    }

    sync() {
        this.#processor.port.postMessage({
            type: "sync"
        })
    }

    zeroAll(id, found=false) {
        if (this.#voice.id === id) found = true
        let updateRequired = false
        const zeroRecursive = (osc, id, found=false) => {
            if (osc.id === id) found = true
            if (found) {
                updateRequired = true
                osc.phase = 0
            } 
            if (osc.fm) zeroRecursive(osc.fm, id, found)
            if (osc.am) zeroRecursive(osc.am, id, found)
            if (osc.em) zeroRecursive(osc.em, id, found)
            if (osc.sx) zeroRecursive(osc.sx, id, found)
            if (osc.sy) zeroRecursive(osc.sy, id, found)
            if (osc.gain) zeroRecursive(osc.gain, id, found)
            if (osc.transpose) zeroRecursive(osc.transpose, id, found)
        }  
        zeroRecursive(this.#voice.oscillator, id, found)
        if (updateRequired) this.#update(false)
    }
 
    connect(destination) {
        this.#outBus = destination
        this.#envelope.connect(this.#outBus)
    }

    set soloBus(value) {
        this.#soloBus = value
        this.#updateBus()
    }

    get soloBus() {
        return this.#soloBus
    }

    #onEnvelopeTimeout() {
        if (!this.#voice) return
        if (this.#voice.state === Voice.RELEASE) {
            this.#voice.state = Voice.IDLE
        } else if (this.#voice.state === Voice.DELETE_RELEASE) {
            this.#voice.state = Voice.DELETE
        } else if (this.#voice.state === Voice.ATTACK) {
            this.#voice.state = Voice.SUSTAIN
        }
        this.#envelopeTimeout = null
    }
    
    #updateBus() {
        if (this.#voice && this.#voice.bus === "main" && this.#outBus) {
            if (this.#soloConnected) {
                this.#envelope.disconnect(this.#soloBus)
                this.#soloConnected = false
            }
        } else if (this.#voice && this.#voice.bus === "solo" && this.#soloBus) {
            if (!this.#soloConnected) {
                this.#envelope.connect(this.#soloBus)
                this.#soloConnected = true
            }
        }
    }

    #updateState() {
    
        if (this.#voice.state === Voice.TRIGGER_ATTACK) {
            clearTimeout(this.#envelopeTimeout)
            this.#voice.state = Voice.ATTACK
            this.#envelope.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#envelope.gain.setValueAtTime(this.#envelope.gain.value, this.#audioContext.currentTime)
            this.#envelope.gain.linearRampToValueAtTime(1, this.#audioContext.currentTime + this.#voice.attack)
            this.#envelopeTimeout = setTimeout(()=>{this.#onEnvelopeTimeout()}, this.#voice.attack * 1000)
        } else if (this.#voice.state === Voice.TRIGGER_RELEASE) {
            clearTimeout(this.#envelopeTimeout)
            this.#voice.state = Voice.RELEASE
            this.#envelope.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#envelope.gain.setValueAtTime(this.#envelope.gain.value, this.#audioContext.currentTime)
            this.#envelope.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#voice.release)
            this.#envelopeTimeout = setTimeout(()=>{this.#onEnvelopeTimeout()}, this.#voice.release * 1000)
        } else if (this.#voice.state === Voice.TRIGGER_DELETE) {
            clearTimeout(this.#envelopeTimeout)
            this.#voice.state = Voice.DELETE_RELEASE
            this.#envelope.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#envelope.gain.setValueAtTime(this.#envelope.gain.value, this.#audioContext.currentTime)
            this.#envelope.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#voice.release)
            this.#envelopeTimeout = setTimeout(()=>{this.#onEnvelopeTimeout()}, this.#voice.release * 1000)
        }
    }

    #updateGain() {
        this.#gainNode.gain.cancelScheduledValues(this.#audioContext.currentTime)
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, this.#audioContext.currentTime)
        this.#gainNode.gain.linearRampToValueAtTime(this.#voice.gain, this.#audioContext.currentTime + this.#gainChangeTime)
    }

    #update(sync = true) {
        this.#processor.port.postMessage({
            type: "voice",
            voice: clone(this.#voice),
            sync
        })
       

    }

    destroy() {
        unwatch(this, "voice")
        this.#voice = null
        this.#processor.port.postMessage({
            type: "destroy"
        })
        
        this.#processor.port.close()
        this.#processor.disconnect()
        this.#processor = null
        this.#audioContext = null

    }
}