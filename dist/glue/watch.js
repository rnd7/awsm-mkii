import getProperties from "../data/get-properties.js"
import Signal from "./signal.js"

export const references = new Map()

export default function watch(reference, name, callback) {
    const properties = getProperties(reference)
    if (!properties[name]) return
    const descriptor = properties[name]
    if (descriptor && descriptor.set) {
        const setter = descriptor.set.bind(reference)
        descriptor.set = (value) => {
            if (references.has(reference) && references.get(reference).has(name)) {
                const subscription = references.get(reference).get(name)
                Signal.unsubscribe(subscription.origin, subscription.callback)
                references.get(reference).delete(name)
                if (!references.get(reference).size) references.delete(reference)
            }
            setter(value)
            if (value) {
                if (!references.has(reference)) references.set(reference, new Map())
                references.get(reference).set(name, Signal.subscribe(value, callback))
            }
            callback(new Signal({origin: value, callback}))
        }
        Object.defineProperty(reference, name, descriptor)
    }

}