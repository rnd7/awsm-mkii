export default function beautifyValue(frequency) {
    let maxDigits = 4
    let value = frequency
    let unit = ""
    if (value > 1e3) {
        value /= 1e3
        unit = "k"
    } else if (value > 1e6) {
        value /= 1e3
        unit = "M"
    } else if (value > 1e9) {
        value /= 1e3
        unit = "G"
    }
    let fractionDigits = 1
    for (let e = 0; e < 3; e++) {
        if (value <= Math.pow(10, e)) {
            fractionDigits = maxDigits - e
            break;
        }
    }
    const scale = Math.pow(10, fractionDigits)
    value = Math.round(value * scale) / scale
    return { value, unit }
}