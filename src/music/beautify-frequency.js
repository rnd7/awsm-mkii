export default function beautifyFrequency(frequency) {
    /*
        1 Hz
        1.34 Hz
        100.31 Hz
        440 Hz
        1.3 kHz
        100.3 kHz
    */
    let maxDigits = 4
    let value = frequency
    let unit = "Hz"
    if (value > 1e3) {
        value /= 1e3
        unit = "kHz"
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