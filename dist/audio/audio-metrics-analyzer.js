
export default class AudioMetricsAnalyzer {

    #audioContext
    #analyserNode
    #audioMetrics
    #source
    #lastFrame = 0
    constructor(audioContext) {
        this.#audioContext = audioContext
        this.#analyserNode = this.#audioContext.createAnalyser()
        this.#analyserNode.fftSize = 2048
        this.#analyserNode.smoothingTimeConstant = 0.8
    }

    connect(source) {
        if (this.#source) this.#source.disconnect(this.#analyserNode)
        this.#source = source
        this.#source.connect(this.#analyserNode)
    }

    update() {
        const now = Date.now()
        if (!this.#audioMetrics || this.#lastFrame >= now-10) return
        this.#lastFrame = now
        this.#analyserNode.getByteTimeDomainData(this.#audioMetrics.frame)
    }

    set audioMetrics(value) {
        this.#audioMetrics = value
        this.#audioMetrics.frame = new Uint8Array(this.#analyserNode.frequencyBinCount)
        this.#audioMetrics.callback = this.update.bind(this)
    }

    get audioMetrics() {
        return this.#audioMetrics
    }

    destroy() {
        this.#source.disconnect(this.#analyserNode)
        this.#audioMetrics = null
        this.#audioContext  = null
        this.#analyserNode = null
    }
}