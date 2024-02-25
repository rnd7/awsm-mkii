export default function calculateDistance(a = {x: 0, y: 0}, b = {x: 0, y: 0}, weight = {x:1, y:1}) {
    const dx = (b.x - a.x) * weight.x
    const dy = (b.y - a.y) * weight.y
    return Math.sqrt(dx * dx + dy * dy)
}