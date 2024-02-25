export default function rgbaToCss({r = 0, g = 0, b = 0, a = 1} = {}) {
    return `rgba(${r*0xFF|0}, ${g*0xFF|0}, ${b*0xFF|0}, ${Math.max(0, Math.min(1, a))})`
}