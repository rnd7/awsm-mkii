/*
Based on https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699 
posted by Kamil Kiełczewski
input: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
*/
export default function rgbToHsl({r = 0, g = 0, b = 0} = {}) {
    const v = Math.max(r,g,b)
    const c = v - Math.min(r,g,b)
    const f = (1-Math.abs(v+v-c-1))
    const h = c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c))
    return {h:60*(h<0?h+6:h), s: f ? c/f : 0, l: (v+v-c)/2}
}