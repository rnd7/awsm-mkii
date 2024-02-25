export default class Subscription {
    #origin
    #callback
    constructor(origin, callback) {
        this.#origin = origin
        this.#callback = callback
    }
    get origin() {
        return this.#origin
    }
    get callback() {
        return this.#callback
    }
}