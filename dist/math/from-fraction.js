export function fromFraction(str) {
    const match = /([0-9]+)(\/([0-9]+))?/.exec(str)
    let val = 1
    if (match.length) {
        const num = parseInt(match[1])
        const denom = parseInt(match[3])
        if (!Number.isNaN(num)) val = num
        if (!Number.isNaN(denom) && denom > 0) val /= denom
    }
    return val
}