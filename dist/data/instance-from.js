export default function instanceFrom(cls, object) {
    if (!object) return null
    if (object instanceof cls) return object
    return new cls(object)
}