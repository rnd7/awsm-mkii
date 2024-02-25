/*
Based on https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript/54070620#54070620
posted by Kamil Kiełczewski
input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
*/
export default function rgbToHsv({r = 0, g = 0, b = 0} = {}) {
    const v = Math.max(r,g,b)
    const c = v - Math.min(r,g,b)
    let h = c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
    return {h: 60*(h<0?h+6:h), s: v&&c/v, v}
  }