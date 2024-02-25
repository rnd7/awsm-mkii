
export default function calculateCirclePoint(radius, angle) {
    return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
    } 
}