export default function compareFloat(a,b, tolerance = 1e-8) {
    return Math.abs(a - b) < tolerance
}