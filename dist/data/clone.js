export default function clone(obj, anonymize = false) {
    obj = JSON.parse(JSON.stringify(obj))
    if (anonymize) removeIds(obj)
    return obj
}

function removeIds(obj) {
    if (!obj) return
    if (Array.isArray(obj)) {
        obj.forEach(removeIds)
    } else if (typeof obj === "object") {
        if (obj.id) delete obj.id
        if (obj.name) delete obj.name
        Object.values(obj).forEach(removeIds)
    }
    return obj

}