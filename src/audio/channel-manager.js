import watch from "../glue/watch.js"
import unwatch from "../glue/unwatch.js"
import Channel from "../model/channel.js"
import VoiceManager from "./voice-manager.js"
import Dynamics from "../model/dynamics.js"
import Voice from "../model/voice.js"
import AudioMetricsAnalyzer from "./audio-metrics-analyzer.js"

export default class ChannelManager {
    #audioContext
    #channel
    #voiceMap = new Map()
    #gainNode
    #mix = 0
    #inputs
    #potentialParam
    #dynamics
    #thresholdParam
    #scaleParam
    #channelGainChangeTime = 1/100
    #audioMetricsAnalyzer
    #soloBus
    #releaseTimeout
    #potentialChangeTime = 1/10

    constructor(audioContext, channel) {
        this.#audioContext = audioContext
        this.#gainNode = this.#audioContext.createGain()
        this.#gainNode.gain.value = 0
        
        this.#dynamics = new AudioWorkletNode(this.#audioContext, 'audio-squeeze-processor')
        this.#inputs = this.#dynamics.parameters.get('inputs')
        this.#potentialParam = this.#dynamics.parameters.get('potential')
        this.#thresholdParam = this.#dynamics.parameters.get('threshold')
        this.#scaleParam = this.#dynamics.parameters.get('scale')
        this.#dynamics.connect(this.#gainNode)

        this.#audioMetricsAnalyzer = new AudioMetricsAnalyzer(this.#audioContext)
        this.#audioMetricsAnalyzer.connect(this.#gainNode)

        watch(this, "channel", this.#onChannelChange.bind(this))
        if (channel) this.channel = channel
            
    }

    set channel(value) {
        this.#channel = value
        this.#audioMetricsAnalyzer.audioMetrics = this.#channel.audioMetrics
        this.#updateDynamics()
        this.#update()
    }

    get channel() {
        return this.#channel
    }

    set mix(value) {
        this.#mix = value
        this.#update()
    }

    get mix() {
        return this.#mix
    }

    get audioMetrics() {
        return this.#audioMetricsAnalyzer
    }

    pause() {
        this.#voiceMap.forEach((voiceManager)=>{
            voiceManager.pause()
        })
    }

    play() {
        this.#voiceMap.forEach((voiceManager)=>{
            voiceManager.play()
        })
    }

    connect(destination) {
        this.#gainNode.connect(destination)
    }

    set soloBus(value) {
        this.#soloBus = value
        this.#voiceMap.forEach((voiceManager) => {
            voiceManager.soloBus = this.#soloBus
        })
    }

    get soloBus() {
        return this.#soloBus
    }

    sync() {
        this.#voiceMap.forEach((voiceManager) => {
            voiceManager.sync()
        })
    }

    zeroAll(id, found=false) {
        if (this.#channel.id === id) found = true
        this.#voiceMap.forEach((voiceManager) => {
            voiceManager.zeroAll(id, found)
        })
    }
    
    #onChannelChange(signal) {
        if (
            signal.path[0].origin instanceof Dynamics
        ) {
            this.#updateDynamics()

        } else if (signal.path.length == 1){
            this.#update()
        }
    }

    #updateDynamics() {
        this.#thresholdParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#thresholdParam.setValueAtTime(this.#thresholdParam.value, this.#audioContext.currentTime);
        this.#thresholdParam.linearRampToValueAtTime( this.#channel.dynamics.threshold, this.#audioContext.currentTime + this.#potentialChangeTime);

        this.#scaleParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#scaleParam.setValueAtTime(this.#scaleParam.value, this.#audioContext.currentTime);
        this.#scaleParam.linearRampToValueAtTime( this.#channel.dynamics.scale, this.#audioContext.currentTime + this.#potentialChangeTime);

        this.#potentialParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#potentialParam.setValueAtTime(this.#potentialParam.value, this.#audioContext.currentTime);
        this.#potentialParam.linearRampToValueAtTime( this.#channel.dynamics.potential, this.#audioContext.currentTime + this.#potentialChangeTime);
     
    }

    #onReleaseTimeout() {
        if (this.#channel.state === Channel.RELEASE) { 
            this.#channel.state = Channel.DELETE
        }
    }

    #update() {
        this.#inputs.setValueAtTime(this.#channel.voices.length, this.#audioContext.currentTime)
        if (this.#channel.state === Channel.ACTIVE) {
            clearTimeout(this.#releaseTimeout)
            this.#channel.voices.forEach(voice => {
                if (voice.state === Voice.DELETE) {
                    if (this.#voiceMap.has(voice.id)) {
                        let voiceManager = this.#voiceMap.get(voice.id)
                        voiceManager.destroy()
                        this.#voiceMap.delete(voice.id)
                    }
                } else {
                    if (!this.#voiceMap.has(voice.id)) {
                        const voiceManager = new VoiceManager(this.#audioContext, voice)
                        voiceManager.connect(this.#dynamics)
                        voiceManager.soloBus = this.#soloBus
                        this.#voiceMap.set(voice.id, voiceManager)
                    }
                }
            })
            let gainMultiplier = 1
            this.#gainNode.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, this.#audioContext.currentTime)
            this.#gainNode.gain.linearRampToValueAtTime(
                this.#channel.gain * gainMultiplier * this.#mix, 
                this.#audioContext.currentTime + this.#channelGainChangeTime
            )
        } else if (this.#channel.state === Channel.TRIGGER_RELEASE) {
            clearTimeout(this.#releaseTimeout)
            this.#channel.state = Channel.RELEASE
            this.#gainNode.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, this.#audioContext.currentTime)
            this.#gainNode.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#channel.release)
            this.#releaseTimeout = setTimeout(()=>{this.#onReleaseTimeout()}, this.channel.release * 1000)
        }
    }
    
    destroy() {
        unwatch(this, "channel")
        this.#voiceMap.forEach((voiceManager, key) => {
            voiceManager.destroy()
        })
        this.#voiceMap = null
        this.#gainNode.gain.cancelScheduledValues(this.#audioContext.currentTime)
        this.#gainNode.disconnect()
        this.#audioContext  = null
        this.#channel = null
    }
}