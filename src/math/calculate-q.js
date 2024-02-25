export default function calcQ(a, b, x) {
    const dx = (1 + (b - a)) % 1
    const xn = ((1 + (x - a)) % 1) / dx
    return xn
}