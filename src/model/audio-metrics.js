

export default class AudioMetrics {
    #frame = new Uint8Array()
    #callback
    constructor() {
        //wrap(this)
    }

    get callback() {
        return this.#callback
    }

    set callback(value) {
        this.#callback = value
    }

    get frame() {
        return this.#frame
    }

    set frame(value) {
        this.#frame = value
    }
}