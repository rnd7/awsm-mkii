import getProperties from "../data/get-properties.js"
import Signal from "./signal.js"
import TProperty from "./t-property.js"

function wrapT(instance, name, descriptor) {
    const reference = descriptor.get.apply(instance)
    return {
        ...descriptor,
        set: (value)=> {
            const before = reference.read()
            reference.write(value)
            if (before != reference.read()) Signal.broadcast(instance, {property: name})
        },
        get: () => {
            return reference.read()
        },
        configurable: false,
        enumerable: true
    }
}

function wrapProperty(instance, name, descriptor) {
    const setter = descriptor.set.bind(instance)
    return {
        ...descriptor,
        set: (value)=> {
            setter(value)
            Signal.broadcast(instance, {property: name})
        },
        configurable: false,
        enumerable: true
    }
}


export default function wrap(instance) {
    const properties = getProperties(instance)
    for (let [name, descriptor] of Object.entries(properties)) {
        if (descriptor.set && descriptor.get) {
            const initialValue = descriptor.get.apply(instance)
            if (initialValue instanceof TProperty) {
                descriptor = wrapT(instance, name, descriptor)
                Signal.subscribe(initialValue, (signal)=>{
                    // tProperty is removed from path
                    Signal.broadcast(instance, {path: [...signal.path.slice(0,-1)], property: name})
                })
            } else {
                descriptor = wrapProperty(instance, name, descriptor)
            }
            Object.defineProperty(instance, name, descriptor)
        }
    }
    return instance

}