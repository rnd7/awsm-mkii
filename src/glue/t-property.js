export default class TProperty  {

    #value
    
    constructor() {
        
    }

    write(value) {
        this.value = value
    }

    read() {
        return this.value
    }

    get value() {
        return this.#value
    }

    set value(value) {
        return this.#value = value
    }
}