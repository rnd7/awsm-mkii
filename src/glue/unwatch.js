import Signal from "./signal.js"
import { references } from "./watch.js"

export default function unwatch(reference, name) {
    if (!references.has(reference)) return
    if (!name) {
        for (let [name, subscription] of references.get(reference)) {
            Signal.unsubscribe(subscription.origin, subscription.callback)
            references.get(reference).delete(name)
            if (!references.get(reference).size) references.delete(reference)
        }
    } else if (references.get(reference).has(name)){
        const subscription = references.get(reference).get(name)
        Signal.unsubscribe(subscription.origin, subscription.callback)
        references.get(reference).delete(name)
        if (!references.get(reference).size) references.delete(reference)
    }
}