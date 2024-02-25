export default function beautifyTime(seconds) {
    let maxDigits = 3
    let value = seconds
    let unit = "s"
    
    if (value < 1) {
        value *= 1000
        unit = "ms"
    } else if (value >= 60) {
        value /= 60
        unit = "m"
    } else if (value >= 60*60) {
        value /= 60*60
        unit = "h"
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