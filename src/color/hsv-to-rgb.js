/* 
Based on https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately/54024653#54024653
posted by Kamil Kiełczewski
input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
*/
export default function hsvToRgb({h = 0, s = 0, v = 0} = {}) {                              
    const f = (n,k=(n+h/60)%6) => v - v * s * Math.max(0, Math.min(k, 4 - k, 1)) 
    return {r: f(5), g: f(3), b: f(1)};       
}   