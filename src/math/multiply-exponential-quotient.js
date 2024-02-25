export default function multiplyExponentialQuotient(x, {n=1, o=1} = {}) {
    return x * Math.pow(2, n/o)
}