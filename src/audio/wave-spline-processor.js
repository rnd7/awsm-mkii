

import interpolateLinear from "../math/interpolate-linear.js"
import solveVoice from "../wave-spline/solve-voice.js"
import syncVoice from "../wave-spline/sync-voice.js"

class WaveSplineProcessor extends AudioWorkletProcessor {

    #voices = []
    #buffer = new Float32Array(128)
    #maxTransitionTime = 1/60 
    #transition = 0
    #keepAlive = true
    #play = true

    constructor(...args) {
        super(...args)
        this.port.onmessage = (message) => {
            if (message.data.type === "voice") {
                this.onVoiceData(message.data.voice, message.data.sync)
            } else if (message.data.type === "update") {
                this.onVoiceUpdate(message.data.voice)
            } else if (message.data.type === "destroy") {
                this.onDestroy()
            } else if (message.data.type === "sync") {
                this.port.postMessage({type: "sync", voice: this.#voices[this.#voices.length-1]})
            } else if (message.data.type === "play") {
                this.#play = true
            } else if (message.data.type === "pause") {
                this.#play = false
            } 
        }
        
    }

    onVoiceData(voice, sync) {
        if (this.#voices.length>2)this.#voices.pop()
        if (sync && this.#voices.length) syncVoice(voice, this.#voices[this.#voices.length-1])
        this.#voices.push(voice)
    }

    onVoiceUpdate(value) {
        this.#voices.forEach((voice=>{
            Object.assign(voice, value)
        }))
    }

    onDestroy() {
        this.port.onmessage = null
        this.port.close()
        this.#voices = []
        this.#transition = 0
        this.#keepAlive = false
    }

    process(inputs, outputs, parameters) {
        for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
            const output = outputs[outputIndex]
            for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
                const channel = output[channelIndex]
                if (outputIndex == 0 && channelIndex == 0 && channel.length != this.#buffer.length) this.#buffer = new Float32Array(channel.length)
                for (let frame = 0; frame < channel.length; frame++) {
                    if (channelIndex == 0 && outputIndex == 0) {
                        let val = 0
                        if (this.#play) {
                            if (this.#voices.length == 1) {
                                val = solveVoice(sampleRate, this.#voices[0])
    
                            } else if (this.#voices.length >= 2) {
                                const transitionFrames = Math.min(this.#maxTransitionTime, this.#voices[0].oscillator.length) * sampleRate
                                const q = this.#transition / transitionFrames
                                val = interpolateLinear(
                                    solveVoice(sampleRate, this.#voices[0]),
                                    solveVoice(sampleRate, this.#voices[1]),
                                    q
                                )
                                if (this.#voices.length >= 3) {
                                    solveVoice(sampleRate, this.#voices[2])
                                }
                                this.#transition++
                                if (this.#transition >= transitionFrames) {
                                    this.#voices.shift()
                                    this.#transition = 0
                                }
                            }
                        }
                        
                        this.#buffer[frame] = val
                    } 
                    channel[frame] = this.#buffer[frame]
                
                }
            }
        }

        return this.#keepAlive
    }
}
registerProcessor("wave-spline-processor", WaveSplineProcessor);