import interpolateLinear from "../math/interpolate-linear.js"

class AudioSqueezeProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{
            name: 'threshold', // threshold (0-1 normalized)
            defaultValue: 0.5, 
            minValue: 0.0,
            maxValue: 1.0,
            automationRate: "a-rate",
        }, {
            name: 'scale', // scale
            defaultValue: 1,
            minValue: 0,
            maxValue: 10,
            automationRate: "a-rate",
        }, {
            name: 'potential', // loudness factor
            defaultValue: 0.0,
            minValue: 0,
            maxValue: 1,
            automationRate: "a-rate",
        }, {
            name: 'inputs',
            defaultValue: 0,
            minValue: 0,
            maxValue: 128,
            automationRate: "k-rate",
        }]
    }

    #bufferIndex = 0

    #targetPeak = 0
    #peak = 0
    #peakIncrement = 0
    #peakTime = 0
    
    #buffer = new Float32Array(512)
    #output = new Float32Array(128)
    #delay = 512

    constructor(...args) {
        super(...args)
        this.port.onmessage = (message) => {
            if (message.data.type === "destroy") {
                this.onDestroy()
            }
        }
    }

    onDestroy() {
        this.port.onmessage = null
        this.port.close()
    }

    process(inputs, outputs, parameters) {
        for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
            const output = outputs[outputIndex]
            for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
                const channel = output[channelIndex]
                if (outputIndex == 0 && channelIndex == 0) {
                    if (channel.length != this.#buffer.length) {
                        this.#output = new Float32Array(channel.length)
                    }
                    if (this.#buffer.length != this.#delay) {
                        this.#buffer = new Float32Array(this.#delay)
                    }
                }
                for (let sample = 0; sample < channel.length; sample++) {
                    if (channelIndex == 0 && outputIndex == 0) {

                        let amplitude = 0
                        for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
                            const input = inputs[inputIndex]
                            if (input.length) amplitude += input[channelIndex][sample]
                        }

                        this.#buffer[this.#bufferIndex] = amplitude

                        let magnitude = Math.abs(amplitude)

                        if (magnitude >= this.#targetPeak *.9) {
                            this.#peakTime = 0  
                        }
                        if (magnitude >= this.#targetPeak) {
                            this.#targetPeak = magnitude
                        }
                        this.#peakIncrement = (8 * this.#targetPeak) / this.#delay // min value to get from -peak to peak within delay

                        if (this.#peak - this.#peakIncrement > this.#targetPeak) {
                            this.#peak -= this.#peakIncrement
                        } else if (this.#peak + this.#peakIncrement < this.#targetPeak) {
                            this.#peak += this.#peakIncrement
                        } else {
                            this.#peak = this.#targetPeak
                        }

                        let liveAmplitude = this.#buffer[(this.#bufferIndex+1)%this.#buffer.length] || 0
                        let liveMagnitude = Math.abs(liveAmplitude)
                        let liveSign = Math.sign(liveAmplitude)
                        const overdrive = parameters.potential.length>1?parameters.potential[sample]:parameters.potential[0]
                        const threshold = (parameters.threshold.length>1?parameters.threshold[sample]:parameters.threshold[0]) * .99
                        const scale = parameters.scale.length>1?parameters.scale[sample]:parameters.scale[0]
                        let out = 0
                        let scaledMax = Math.max(
                            threshold + (1-threshold) * scale,
                            threshold + (1-threshold) * .5
                        )

                        if (this.#peak > 0) {
                            out = liveMagnitude / this.#peak
                            if (out > threshold) {
                                let rel = out - threshold
                                let scaledRel = rel * scale
                                out = threshold + interpolateLinear(rel, scaledRel, rel/(1-threshold))
                            }
                        } 
                        out /= scaledMax
                        if (this.#peak < 1) out = interpolateLinear(out * this.#peak, out, overdrive)
                    
                        this.#output[sample] = out * liveSign * .9999

                        if (this.#peakTime > this.#delay ) {
                           this.#targetPeak = this.#targetPeak * .99999
                        }

                        this.#bufferIndex = (this.#bufferIndex+1)%this.#buffer.length
                        this.#peakTime++
                        
                    } 
                    channel[sample] = this.#output[sample]
                    
                
                }
            }
        }
        return true
    }
}
registerProcessor("audio-squeeze-processor", AudioSqueezeProcessor);