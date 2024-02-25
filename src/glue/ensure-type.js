export default function ensureType(type, value) {
    if (value === null || value === undefined) return null
    if (value instanceof type) return value
    if (type === String) return String(value)
    if (type === Number) return Number(value)
    if (type === Boolean) return !!value
    return new type(value)
}