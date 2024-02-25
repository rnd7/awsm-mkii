export default function normalize(value, {min = 0, max = 1} = {}) {
    return value * (max-min) + min
}