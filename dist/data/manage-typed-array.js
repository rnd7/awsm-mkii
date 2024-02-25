export default function manageTypedArray(host, cls, value) {
    const existing = new Map()
    for (let i = 0; i<host.length; i++) existing.set(host[i].id, host[i])
    let newItems = []
    let change = false
    if (value && value.length) {
        for (let i = 0; i < value.length; i++) {
            const newItem = value[i]
            if (newItem.id && existing.has(newItem.id)) {
                if (!host[i] || host[i].id !== newItem.id) change = true
                newItems.push(Object.assign(existing.get(newItem.id), newItem))
            } else {
                change = true
                newItems.push((newItem instanceof cls)?newItem:new cls(newItem))
            }
        }
    }
    host.splice(0, Number.POSITIVE_INFINITY, ...newItems)
    return change
}