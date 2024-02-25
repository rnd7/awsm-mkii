/* 
Based on https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
posted by Kamil Kiełczewski
input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
*/
export default function hslToRgb({h = 0, s = 0, l = 0} = {}) {
    const a = s*Math.min(l,1-l)
    const f = (n,k=(n+h/30)%12) => l - a * Math.max(Math.min(k-3,9-k,1),-1)
    return {r: f(0), g: f(8), b: f(4)}
}   