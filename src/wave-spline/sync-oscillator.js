export default function syncOscillator(oscillator, reference) {
    if (!oscillator || !reference) return
    oscillator.phase = reference.phase
    syncOscillator(oscillator.am, reference.am)
    syncOscillator(oscillator.fm, reference.fm)
    syncOscillator(oscillator.em, reference.em)
    syncOscillator(oscillator.sx, reference.sx)
    syncOscillator(oscillator.sy, reference.sy)
    syncOscillator(oscillator.gain, reference.gain)
    syncOscillator(oscillator.transpose, reference.transpose)
}