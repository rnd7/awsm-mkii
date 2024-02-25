// pow: 6 = 1/2^6 = 1/64
export default function toFraction(val, pow = 6) {
    let denom = Math.pow(2, pow)
    const sign = val < 0 ? '-' : ''
    val = Math.abs(val)
    const stp = 1 / denom
    const int = Math.floor(val)
    let num = Math.round((val - int) / stp)
    if (int == val || num == 0) return `${sign}${int}`
    while (num > 0 && num % 2 == 0) {
        num /= 2
        denom /= 2
    }
    if (int != 0) return `${sign}${int} ${num}/${denom}`
    else return `${sign}${num}/${denom}`
}
