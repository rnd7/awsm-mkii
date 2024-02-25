import syncOscillator from "./sync-oscillator.js";

export default function syncVoice(voice, reference) {
    if (!voice || !reference) return
    syncOscillator(voice.oscillator, reference.oscillator)
}