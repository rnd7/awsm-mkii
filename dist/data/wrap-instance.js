import Signal from "../signal/signal.js";
import getProperties from "./get-properties.js";

export default function wrapInstance(instance, limit) {
    const properties = getProperties(instance, limit)
    for (let [name, descriptor] of Object.entries(properties)) {
        if (descriptor.set && descriptor.get) {
            const boundSubclassSetter = descriptor.set.bind(instance)
            const boundSubclassGetter = descriptor.get.bind(instance)
            const proxyDescriptor = {
                ...descriptor,
                set: (value) => {
                    if (value === boundSubclassGetter()) return // skip identical
                    boundSubclassSetter(value)
                    Signal.broadcast(instance, Signal.CHANGE, name)
                },
                get: boundSubclassGetter,
                configurable: true,
                enumerable: true
            }
            Object.defineProperty(instance, name, proxyDescriptor)
        }
    }
}