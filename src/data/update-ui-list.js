export default function updateUIList(host, cls, list) {
    while (host.children.length > list.length) {
        host.lastChild.destroy()
    }
    while (host.children.length < list.length) {
        const comp = cls.create()
        host.append(comp)
    }
    for (let i = 0; i<list.length; i++) {
        Object.assign(host.children[i], list[i])
    }
}