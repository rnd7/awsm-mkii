import getProperties from "./get-properties.js";

export default function makeEnumerable(instance, cls) {
    const properties = getProperties(instance, cls)
    for (const descriptor in properties) {
        if (properties[descriptor].get && properties[descriptor].set) {
            properties[descriptor].enumerable = true
            Object.defineProperty(instance, descriptor, {...properties[descriptor], enumerable: true});
        }
    }
}