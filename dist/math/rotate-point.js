
export default function rotatePoint(c, p, radians) {
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    return {
        x: (cos * (p.x - c.x)) + (sin * (p.y - c.y)) + c.x,
        y: (cos * (p.y - c.y)) - (sin * (p.x - c.x)) + c.y
    }
}