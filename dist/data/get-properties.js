export default function getProperties(instance, limit = Object) {
    let properties = {}
    const proto = Object.getPrototypeOf(instance)
    Object.assign(properties, Object.getOwnPropertyDescriptors(proto))
    if (proto !== limit.prototype) {
        return Object.assign(properties, getProperties(proto, limit))
    }
    return properties
}