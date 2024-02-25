import watch from "../glue/watch.js"
import calculatePoleValue from "../math/calculate-pole-value.js"
import Channel from "../model/channel.js"
import Dynamics from "../model/dynamics.js"
import Session from "../model/session.js"
import AudioMetricsAnalyzer from "./audio-metrics-analyzer.js"
import ChannelManager from "./channel-manager.js"

export default class SessionManager {
    #audioContext
    #session = new Session()
    #channels = []
    #ready = false
    #scheduled = false
    #gainNode
    #masterNode
    #channelMap = new Map()
    #dynamicLimit
    #thresholdParam
    #scaleParam
    #potentialParam
    #audioMetricsAnalyzer
    #outNode
    #powerUpTime = 2
    #syncInterval
    #syncRate = 1000/30
    #soloBus
    #mainBus
    constructor(session) {
        watch(this, "session", this.#onSessionChange.bind(this))
        if (session) this.session = session
    }
    

    async inititialize() {
        this.#audioContext = new AudioContext()
        await this.#audioContext.audioWorklet.addModule(`audio/wave-spline-processor.js?a=${Math.random()}`).catch(console.error)
        await this.#audioContext.audioWorklet.addModule(`audio/audio-squeeze-processor.js?a=${Math.random()}`).catch(console.error)
        
        // preglow to remove initial latency
        const wsp = new AudioWorkletNode(this.#audioContext, 'wave-spline-processor')
        const asp = new AudioWorkletNode(this.#audioContext, 'audio-squeeze-processor')
      

        
        this.#dynamicLimit = new AudioWorkletNode(this.#audioContext, 'audio-squeeze-processor')
        this.#thresholdParam = this.#dynamicLimit.parameters.get('threshold')
        this.#scaleParam = this.#dynamicLimit.parameters.get('scale')
        this.#potentialParam = this.#dynamicLimit.parameters.get('potential')

        this.#gainNode = this.#audioContext.createGain()
        this.#gainNode.gain.value = 0

        this.#masterNode = this.#audioContext.createGain()
        this.#masterNode.gain.value = 0

        this.#outNode = this.#audioContext.createGain()
        this.#outNode.gain.value = 0


        this.#mainBus = this.#audioContext.createGain()
        this.#mainBus.connect(this.#gainNode)

        this.#soloBus = this.#audioContext.createGain()
        this.#soloBus.connect(this.#gainNode)

        this.#gainNode.connect(this.#audioContext.destination)

        this.#dynamicLimit.connect(this.#masterNode)
        this.#masterNode.connect(this.#outNode)

        setTimeout(()=>{
            this.#outNode.connect(this.#mainBus)

            this.#powerUp()
        }, 1000)

        this.#audioMetricsAnalyzer = new AudioMetricsAnalyzer(this.#audioContext)
        this.#audioMetricsAnalyzer.connect(this.#masterNode)

        this.#ready = true
        if (this.#scheduled)  {
            this.#update()
            this.#updatePotential()
            this.#updateDynamics()
        }
    }

    set session(value) {
        this.#session = value
        if (this.#session) {
            this.#audioMetricsAnalyzer.audioMetrics = this.#session.audioMetrics
            this.solo(this.#session.solo)
        }
        this.#update()
        this.#updatePotential()
        this.#updateDynamics()
    }

    #powerUp() {
        
        this.#syncInterval = setInterval(()=>{
            this.sync()
        }, this.#syncRate)
        this.#outNode.gain.cancelScheduledValues(this.#audioContext.currentTime);
        this.#outNode.gain.setValueAtTime(this.#outNode.gain.value, this.#audioContext.currentTime);
        this.#outNode.gain.linearRampToValueAtTime(1, this.#audioContext.currentTime + this.#powerUpTime)
    }

    sync() {
        this.#channelMap.forEach((channelManager)=>{
            channelManager.sync()
        })
    }

    get session() {
        return this.#session
    }

    get audioContext() {
        return this.#audioContext
    }

    get audioMetrics() {
        return this.#audioMetricsAnalyzer
    }

    #onSessionChange(signal) {
        if (signal.path[0].property === "solo") {
            this.solo(this.#session.solo)
        } else if (
            signal.path[0].origin instanceof Dynamics
        ) {
            this.#updateDynamics()

        } else if (signal.path.length <= 2){
            this.#update()
            this.#updatePotential()
        }
    }
    
    #soloTime = 1/100

    solo(id) {
        if (id) {
            this.#mainBus.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#mainBus.gain.setValueAtTime(this.#mainBus.gain.value, this.#audioContext.currentTime);
            this.#mainBus.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#soloTime)
            
            this.#soloBus.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#soloBus.gain.setValueAtTime(this.#soloBus.gain.value, this.#audioContext.currentTime);
            this.#soloBus.gain.linearRampToValueAtTime(1, this.#audioContext.currentTime + this.#soloTime)
        } else {
            this.#soloBus.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#soloBus.gain.setValueAtTime(this.#soloBus.gain.value, this.#audioContext.currentTime);
            this.#soloBus.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#soloTime)
            
            this.#mainBus.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#mainBus.gain.setValueAtTime(this.#mainBus.gain.value, this.#audioContext.currentTime);
            this.#mainBus.gain.linearRampToValueAtTime(1, this.#audioContext.currentTime + this.#soloTime)
        }
    }

    stopAll() {
        if (!this.#ready) return Promise.resolve()
        return new Promise((resolve, reject)=> {
            this.#ready = false
            this.#scheduled = false
            this.#masterNode.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#masterNode.gain.setValueAtTime(this.#masterNode.gain.value, this.#audioContext.currentTime);
            this.#masterNode.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#playPauseTime)
            setTimeout(()=>{
                for (let [id, channelManager] of this.#channelMap) {
                    channelManager.destroy()
                    this.#channelMap.delete(id)
                }
                this.#ready = true
                resolve()
                if (this.#scheduled) this.#update()
            }, this.#playPauseTime * 1000 )
        })
   
    }

    #updateDynamics() {
        if (!this.#ready) return this.#scheduled = true
        if (!this.#session) return

        this.#thresholdParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#thresholdParam.setValueAtTime(this.#thresholdParam.value, this.#audioContext.currentTime);
        this.#thresholdParam.linearRampToValueAtTime( this.#session.dynamics.threshold, this.#audioContext.currentTime + this.#potentialChangeTime);

        this.#scaleParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#scaleParam.setValueAtTime(this.#scaleParam.value, this.#audioContext.currentTime);
        this.#scaleParam.linearRampToValueAtTime( this.#session.dynamics.scale, this.#audioContext.currentTime + this.#potentialChangeTime);

        this.#potentialParam.cancelScheduledValues(this.#audioContext.currentTime);
        this.#potentialParam.setValueAtTime(this.#potentialParam.value, this.#audioContext.currentTime);
        this.#potentialParam.linearRampToValueAtTime( this.#session.dynamics.potential, this.#audioContext.currentTime + this.#potentialChangeTime);
      
    }

    #playPauseTime = 1/10
    #potentialChangeTime = 1/10
    #playPauseTimeout



    #update() {
        if (!this.#ready) return this.#scheduled = true
        if (!this.#session) return
        if (this.#session.state === Session.TRIGGER_PLAY) {
            clearTimeout(this.#playPauseTimeout)
            this.#session.state = Session.PLAY
            this.#channelMap.forEach((channelManager)=>{
                channelManager.play()
            })
            this.#masterNode.gain.cancelScheduledValues(this.#audioContext.currentTime)
            this.#masterNode.gain.setValueAtTime(this.#masterNode.gain.value, this.#audioContext.currentTime)
            this.#masterNode.gain.linearRampToValueAtTime(1, this.#audioContext.currentTime + this.#playPauseTime)
            this.#playPauseTimeout = setTimeout(()=>{
                this.#session.state = Session.PLAYING
            }, this.#playPauseTime * 1000)
        } else if (this.#session.state === Session.TRIGGER_PAUSE) {
            clearTimeout(this.#playPauseTimeout)
            this.#session.state = Session.PAUSE
            this.#masterNode.gain.cancelScheduledValues(this.#audioContext.currentTime);
            this.#masterNode.gain.setValueAtTime(this.#masterNode.gain.value, this.#audioContext.currentTime);
            this.#masterNode.gain.linearRampToValueAtTime(0, this.#audioContext.currentTime + this.#playPauseTime)

            this.#playPauseTimeout = setTimeout(()=>{
                this.#channelMap.forEach((channelManager)=>{
                    channelManager.pause()
                })
                this.#session.state = Session.PAUSED
            }, this.#playPauseTime * 1000)

        }
        this.#session.channels.forEach(channel => {
            if (channel.state === Channel.DELETE) {
                if (this.#channelMap.has(channel.id)) {
                    let channelManager = this.#channelMap.get(channel.id)
                    channelManager.destroy()
                    this.#channelMap.delete(channel.id)
                }
            } else {
                if (!this.#channelMap.has(channel.id)) {
                    let channelManager = new ChannelManager(this.#audioContext, channel)
                    channelManager.connect(this.#dynamicLimit)
                    channelManager.soloBus = this.#soloBus
                    this.#channelMap.set(channel.id, channelManager)
                }
            }
            
        })
        for (let i = 0; i<this.#session.channels.length; i++) {
            let channel = this.#session.channels[i]
            if (this.#channelMap.has(channel.id)) {
                this.#channelMap.get(channel.id).mix = calculatePoleValue(i, this.#session.channels.length, this.#session.channelMix )
            }
        }
    }

    zeroAll(id, found=false) {
        if (this.#session.id === id) found = true
        this.#channelMap.forEach((channelManager)=>{
            channelManager.zeroAll(id, found)
        })
    }

    #updatePotential() {
        if (!this.#ready) return this.#scheduled = true
        if (!this.#session) return
        let potentialFactor = 1
       
        this.#gainNode.gain.cancelScheduledValues(this.#audioContext.currentTime);
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, this.#audioContext.currentTime);
        this.#gainNode.gain.linearRampToValueAtTime( this.#session.main * potentialFactor, this.#audioContext.currentTime + this.#potentialChangeTime);
       

    }
}